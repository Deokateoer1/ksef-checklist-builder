// Netlify Function — proxy do Gemini API
// Klucz API bezpieczny po stronie serwera (env var GEMINI_API_KEY)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Brak klucza API (GEMINI_API_KEY)' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowe JSON' }) };
  }

  const { prompt, model = 'gemini-3-flash-preview', config = {} } = body;
  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Brak pola prompt' }) };
  }

  const geminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (config.systemInstruction) {
    geminiBody.systemInstruction = { parts: [{ text: config.systemInstruction }] };
  }

  if (config.responseMimeType || config.temperature !== undefined || config.topP !== undefined) {
    geminiBody.generationConfig = {};
    if (config.responseMimeType) geminiBody.generationConfig.responseMimeType = config.responseMimeType;
    if (config.temperature !== undefined) geminiBody.generationConfig.temperature = config.temperature;
    if (config.topP !== undefined) geminiBody.generationConfig.topP = config.topP;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: errMsg }),
      };
    }

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Błąd połączenia z Gemini: ${err.message}` }),
    };
  }
};
