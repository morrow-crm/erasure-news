const { getStore } = require('@netlify/blobs');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const volume = new Date().getMonth() + 1; // January = 1

  try {
    const store = getStore({ name: 'edition-counter', consistency: 'strong' });

    // Read current count
    const raw = await store.get('count');
    let count = raw ? parseInt(raw, 10) : 0;
    if (isNaN(count)) count = 0;

    // Increment
    count += 1;

    // Save back
    await store.set('count', String(count));

    console.log(`[counter] Incremented to Vol. ${volume} · No. ${count}`);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume, number: count }),
    };
  } catch (err) {
    console.error('[counter] Error:', err.message);
    // Return volume-only on failure
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume, number: null, error: err.message }),
    };
  }
};
