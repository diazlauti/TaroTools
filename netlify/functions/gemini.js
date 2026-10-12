// netlify/functions/gemini.js
// Proxy serverless usando OpenRouter — modelos gratuitos sin billing.
//
// Esta key es el recurso más fácil de agotar de todo el sitio: la URL de
// esta función está en el JS público, así que cualquiera puede pegarle
// directo (sin pasar por el navegador ni por el frontend) y consumir la
// cuota gratuita de OpenRouter o hacer que el proveedor banee la key por
// abuso, rompiendo la herramienta para los usuarios reales. Mismo
// rate-limit simple por IP que ya usa guestbook.js, para que un script no
// pueda hacer eso con un loop.
//
// DESACTIVADA a pedido del usuario (2026-10-12): las herramientas de IA se
// sacaron del catálogo del frontend por el mismo motivo de costo/abuso, y
// esta función queda cortada server-side además, por si alguien le pega
// directo a la URL salteándose el sitio. Para reactivar: borrar el bloque
// AI_DISABLED de abajo (el rate-limit y el resto del proxy ya quedan listos).
const AI_DISABLED = true;

const { connectLambda, getStore } = require('@netlify/blobs');
const RATE_LIMIT_MS = 15 * 1000; // 1 llamada por IP cada 15s

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

async function checkRate(ip) {
  if (ip === 'unknown') return true; // no bloqueamos si no pudimos identificar IP
  const store = getStore('gemini-rate');
  const last = await store.get(ip);
  if (last && Date.now() - Number(last) < RATE_LIMIT_MS) return false;
  await store.set(ip, String(Date.now()));
  return true;
}

exports.handler = async (event) => {
  if (AI_DISABLED) {
    return { statusCode: 503, headers: corsHeaders(), body: JSON.stringify({ error: 'Las herramientas de IA están desactivadas por ahora.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  connectLambda(event);
  const allowed = await checkRate(clientIp(event));
  if (!allowed) {
    return { statusCode: 429, headers: corsHeaders(), body: JSON.stringify({ error: 'Demasiadas solicitudes. Esperá unos segundos e intentá de nuevo.' }) };
  }

  const apiKey = process.env.TARO_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Falta configurar la variable de entorno TARO_KEY en Netlify. ' +
          'Es gratis: creá una cuenta en openrouter.ai, generá una API key ' +
          '(no hace falta tarjeta para el modelo gratuito ya configurado) y ' +
          'agregala en Netlify → Site settings → Environment variables → TARO_KEY.',
      }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Body inválido' }) }; }

  if (!Array.isArray(body.contents) || !body.contents.length) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Falta el contenido a procesar' }) };
  }

  // Convertir formato Gemini → formato OpenAI (que usa OpenRouter)
  const messages = body.contents.map(c => ({
    role: c.role === 'model' ? 'assistant' : 'user',
    content: c.parts.map(p => p.text).join(''),
  }));

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://tarostools.netlify.app',
        'X-Title': "Taro's Tools",
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, headers: corsHeaders(), body: JSON.stringify({ error: data?.error?.message || 'Error de OpenRouter' }) };
    }

    // Convertir respuesta OpenAI → formato Gemini para que el frontend no cambie
    const text = data.choices?.[0]?.message?.content || '';
    const geminiFormat = {
      candidates: [{ content: { parts: [{ text }] } }]
    };

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(geminiFormat) };

  } catch (error) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: error.message }) };
  }
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
