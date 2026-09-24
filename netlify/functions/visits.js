// netlify/functions/visits.js
// Contador de visitas real y compartido entre todos los que entran al sitio,
// persistido en Netlify Blobs (no hay tracking individual: solo se guarda un
// número total, nada por visitante — sigue siendo "sin cookies, sin cuenta").

const { connectLambda, getStore } = require('@netlify/blobs');

const STORE_NAME = 'site-stats';
const KEY = 'visits';
const MAX_RETRIES = 12;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Incremento atómico vía compare-and-swap (etag de Netlify Blobs). Bajo
// visitas concurrentes varios requests pueden leer el mismo valor a la vez;
// el que pierde la carrera reintenta con un backoff creciente + jitter para
// no volver a chocar todos contra el mismo valor viejo. Nunca hace un `set`
// a ciegas (eso sí perdería visitas bajo carga), así que en el peor caso
// tarda un poco más pero el conteo siempre queda correcto.
async function incrementCounter(store) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const existing = await store.getWithMetadata(KEY, { type: 'json' });
    const current = (existing && typeof existing.data?.n === 'number') ? existing.data.n : 0;
    const next = current + 1;

    const result = existing
      ? await store.setJSON(KEY, { n: next }, { onlyIfMatch: existing.etag })
      : await store.setJSON(KEY, { n: next }, { onlyIfNew: true });

    if (result.modified) return next;
    await sleep(15 * (i + 1) + Math.random() * 30);
  }
  throw new Error('No se pudo incrementar el contador tras varios intentos (mucha concurrencia)');
}

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    connectLambda(event);
    const store = getStore(STORE_NAME);
    const total = await incrementCounter(store);
    return { statusCode: 200, headers: cors, body: JSON.stringify({ total }) };
  } catch (error) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: 'No se pudo actualizar el contador.' }),
    };
  }
};
