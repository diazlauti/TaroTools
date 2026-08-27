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

const DEFAULT_INSTANCE = 'https://api.cobalt.tools';

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
