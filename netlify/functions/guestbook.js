// netlify/functions/guestbook.js
// Libro de visitas real: las firmas quedan guardadas en Netlify Blobs y las
// ve cualquiera que entre al sitio (no solo quien firmó). GET devuelve las
// últimas firmas, POST agrega una. Sin login, pero con límites básicos de
// tamaño y un rate-limit simple por IP para frenar spam automatizado.

const { connectLambda, getStore } = require('@netlify/blobs');

const ENTRIES_STORE = 'guestbook';
const ENTRIES_KEY = 'entries';
const RATE_STORE = 'guestbook-rate';
const MAX_STORED = 200;   // tope de firmas guardadas
const MAX_RETURNED = 30;  // cuántas se mandan al front
const MAX_MSG = 200;
const MAX_WHO = 30;
const RATE_LIMIT_MS = 60 * 1000; // 1 firma por IP por minuto
const MAX_RETRIES = 6;

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function cleanLine(s, max) {
  return String(s || '')
    .replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f]/g, '') // controles, deja \n (\u000a)
    .trim()
    .slice(0, max);
}

async function checkRate(ip) {
  if (ip === 'unknown') return true; // no bloqueamos si no pudimos identificar IP
  const store = getStore(RATE_STORE);
  const last = await store.get(ip);
  if (last && Date.now() - Number(last) < RATE_LIMIT_MS) return false;
  await store.set(ip, String(Date.now()));
  return true;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function appendEntry(entry) {
  const store = getStore(ENTRIES_STORE);
  for (let i = 0; i < MAX_RETRIES; i++) {
    const existing = await store.getWithMetadata(ENTRIES_KEY, { type: 'json' });
    const list = (existing && Array.isArray(existing.data)) ? existing.data : [];
    const next = [entry, ...list].slice(0, MAX_STORED);

    const result = existing
      ? await store.setJSON(ENTRIES_KEY, next, { onlyIfMatch: existing.etag })
      : await store.setJSON(ENTRIES_KEY, next, { onlyIfNew: true });

    if (result.modified) return next.slice(0, MAX_RETURNED);
    await sleep(15 * (i + 1) + Math.random() * 30);
  }
  throw new Error('No se pudo guardar la firma tras varios intentos');
}

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    connectLambda(event);

    if (event.httpMethod === 'GET') {
      const store = getStore(ENTRIES_STORE);
      const list = await store.get(ENTRIES_KEY, { type: 'json' });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ entries: (list || []).slice(0, MAX_RETURNED) }) };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try { body = JSON.parse(event.body); }
      catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Body inválido' }) }; }

      const msg = cleanLine(body.msg, MAX_MSG);
      const who = cleanLine(body.who, MAX_WHO) || 'anon';
      if (!msg) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Falta el mensaje' }) };

      const ip = clientIp(event);
      const allowed = await checkRate(ip);
      if (!allowed) {
        return { statusCode: 429, headers: cors, body: JSON.stringify({ error: 'Esperá un minuto antes de firmar de nuevo.' }) };
      }

      const entry = { date: new Date().toISOString().slice(0, 10), who, msg };
      const entries = await appendEntry(entry);
      return { statusCode: 200, headers: cors, body: JSON.stringify({ entries }) };
    }

    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'No se pudo acceder al libro de visitas.' }) };
  }
};
