// netlify/functions/cobalt.js
// Proxy para la API de Cobalt v2.
// La request sale del servidor Netlify, no del browser,
// así evita el bloqueo de autenticación.

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

  try {
    const response = await fetch('https://api.cobalt.tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'tarostools/1.0 (+https://tarostools.netlify.app)',
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
