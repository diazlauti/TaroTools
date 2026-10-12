// netlify/functions/cobalt.js
// Proxy para la API de Cobalt v2.
// La request sale del servidor Netlify, no del browser,
// así evita el bloqueo de autenticación.
//
// La instancia pública oficial (api.cobalt.tools) a veces bloquea IPs de
// proveedores cloud (como las de Netlify Functions) por su protección
// anti-abuso de Cloudflare. Si eso pasa, no hace falta tocar código: se
// puede apuntar a otra instancia pública (elegí una activa en
// https://cobalt.tools → ⚙️ Configuración → Instancia de procesamiento,
// o self-hosteá la tuya) configurando la variable de entorno
// COBALT_INSTANCE en Netlify. Si esa instancia requiere API key, se puede
// pasar con COBALT_API_KEY.
//
// La URL de esta función también está en el JS público: sin límite propio,
// cualquiera puede pegarle directo (sin pasar por el sitio) y usarla como
// proxy gratis de descarga a escala, agotando los minutos de ejecución de
// Netlify Functions o haciendo que la instancia de Cobalt banee esta IP
// por abuso. Mismo rate-limit simple por IP que ya usa guestbook.js.

const { connectLambda, getStore } = require('@netlify/blobs');

const DEFAULT_INSTANCE = 'https://api.cobalt.tools';
const RATE_LIMIT_MS = 10 * 1000; // 1 descarga por IP cada 10s

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

async function checkRate(ip) {
  if (ip === 'unknown') return true; // no bloqueamos si no pudimos identificar IP
  const store = getStore('cobalt-rate');
  const last = await store.get(ip);
  if (last && Date.now() - Number(last) < RATE_LIMIT_MS) return false;
  await store.set(ip, String(Date.now()));
  return true;
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

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Body inválido' }) }; }

  if (!body.url) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Falta la URL' }) };
  }

  connectLambda(event);
  const allowed = await checkRate(clientIp(event));
  if (!allowed) {
    return { statusCode: 429, headers: cors, body: JSON.stringify({ status: 'error', error: { code: 'error.api.rate_exceeded' } }) };
  }

  const instance = (process.env.COBALT_INSTANCE || DEFAULT_INSTANCE).replace(/\/$/, '');
  const apiKey = process.env.COBALT_API_KEY;

  try {
    const response = await fetch(instance, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'tarostools/1.0 (+https://tarostools.netlify.app)',
        ...(apiKey ? { 'Authorization': `Api-Key ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return { statusCode: response.status, headers: cors, body: JSON.stringify(data) };

  } catch (error) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({
        status: 'error',
        error: { code: 'error.proxy.fetch_failed' },
      }),
    };
  }
};
