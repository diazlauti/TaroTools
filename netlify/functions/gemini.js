// netlify/functions/gemini.js
// Proxy serverless usando OpenRouter — modelos gratuitos sin billing.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
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
