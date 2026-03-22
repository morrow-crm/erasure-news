const { getStore } = require('@netlify/blobs');

// Launch date: March 2026
const LAUNCH_YEAR = 2026;
const LAUNCH_MONTH = 3; // March

function getVolume() {
  const now = new Date();
  return (now.getFullYear() - LAUNCH_YEAR) * 12 + (now.getMonth() + 1 - LAUNCH_MONTH) + 1;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const volume = getVolume();

  try {
    const store = getStore({ name: 'edition-counter', consistency: 'strong' });

    if (event.httpMethod === 'GET') {
      const raw = await store.get('count');
      let count = raw ? parseInt(raw, 10) : 0;
      if (isNaN(count) || count < 1) count = 0;

      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume, number: count || null }),
      };
    }

    if (event.httpMethod === 'POST') {
      const raw = await store.get('count');
      let count = raw ? parseInt(raw, 10) : 0;
      if (isNaN(count) || count < 0) count = 0;

      count += 1;
      await store.set('count', String(count));

      console.log(`[counter] Incremented to Vol. ${volume} · No. ${count}`);

      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume, number: count }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('[counter] Error:', err.message);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume, number: null, error: err.message }),
    };
  }
};
