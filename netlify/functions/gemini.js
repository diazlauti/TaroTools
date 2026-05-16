// netlify/functions/gemini.js
// Proxy serverless — la GEMINI_KEY vive en las variables de entorno del servidor,
// nunca en el frontend. Configurala en Netlify → Site Settings → Environment Variables.

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    console.error('GEMINI_KEY no configurada en las variables de entorno');
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'API key no configurada en el servidor' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Body inválido' }),
    };
  }

  // El modelo puede venir en el body o usa el default
  const model = body.model || 'gemini-2.0-flash';
  delete body.model; // no lo mandamos en el payload a Gemini

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Gemini API:', data);
      return {
        statusCode: response.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: data?.error?.message || 'Error de Gemini API' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error al llamar a Gemini:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    // Cambiá '*' por tu dominio en producción: 'https://tarostools.netlify.app'
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
