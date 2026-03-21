const TOPIC_QUERIES = {
  climate:     'climate change OR extreme weather OR wildfire OR flooding OR carbon emissions',
  economy:     'inflation OR unemployment OR housing market OR interest rates OR recession',
  politics:    'Congress OR White House OR Senate OR election OR legislation',
  technology:  'artificial intelligence OR big tech OR data privacy OR social media regulation',
  war:         'military conflict OR war OR ceasefire OR troops OR bombing',
  immigration: 'immigration OR migrants OR border OR asylum OR deportation',
  health:      'public health OR pandemic OR hospital OR drug prices OR mental health',
  justice:     'Supreme Court OR policing OR civil rights OR criminal justice',
  science:     'scientific discovery OR space OR biology OR physics OR research',
  culture:     'arts OR censorship OR museum OR literature OR film',
};

// Map display source names to NewsAPI source IDs or domain fallbacks.
// Some sources (NYT, NY Post) aren't in NewsAPI's source list but can be
// reached via the `domains` parameter instead.
const SOURCE_MAP = {
  'New York Times':      { domains: 'nytimes.com' },
  'The Guardian':        { sources: 'the-guardian-us' },
  'Washington Post':     { sources: 'the-washington-post' },
  'AP':                  { sources: 'associated-press' },
  'Reuters':             { sources: 'reuters' },
  'Wall Street Journal': { sources: 'the-wall-street-journal' },
  'Fox News':            { sources: 'fox-news' },
  'New York Post':       { domains: 'nypost.com' },
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Strip the "[+1234 chars]" truncation marker NewsAPI appends. */
function cleanContent(text) {
  if (!text) return '';
  return text.replace(/\[\+\d+ chars\]$/, '').trim();
}

/**
 * Build the article response object that the frontend expects.
 * Combines text from up to 5 NewsAPI articles into a single
 * { headline, byline, paragraphs } structure.
 */
function buildArticle(articles, source, dateStr) {
  const lead = articles[0];
  const headline = lead.title || 'Untitled';
  const author = lead.author || 'Staff Reporter';
  const byline = `By ${author} | ${source} | ${dateStr}`;

  // Collect a text chunk from each article (description + truncated content).
  const chunks = articles.map(a => {
    const desc = (a.description || '').trim();
    const body = cleanContent(a.content);
    // Avoid repeating the description if it's already the start of content.
    if (body && desc && body.startsWith(desc.substring(0, 50))) return body;
    return [desc, body].filter(Boolean).join(' ');
  }).filter(t => t.length > 0);

  let paragraphs;
  if (chunks.length >= 5) {
    paragraphs = chunks.slice(0, 5);
  } else if (chunks.length > 0) {
    // Fewer than 5 articles — split all text into 5 roughly equal paragraphs.
    const allText = chunks.join(' ');
    const sentences = allText.split(/(?<=[.!?])\s+/);
    const per = Math.ceil(sentences.length / 5);
    paragraphs = [];
    for (let i = 0; i < 5; i++) {
      const slice = sentences.slice(i * per, (i + 1) * per).join(' ');
      if (slice) paragraphs.push(slice);
    }
  } else {
    paragraphs = ['No article text available.'];
  }

  // Pad to at least 2 paragraphs so the erasure layer has enough content.
  while (paragraphs.length < 2) {
    paragraphs.push(paragraphs[paragraphs.length - 1]);
  }

  return { headline, byline, paragraphs };
}

export const handler = async (event) => {
  // CORS preflight
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

  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'NEWSAPI_KEY not configured' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { source, topic, dateStr } = body;
  if (!source || !topic || !dateStr) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing required fields: source, topic, dateStr' }),
    };
  }

  const query = TOPIC_QUERIES[topic] || topic;
  const mapping = SOURCE_MAP[source] || {};

  // 7-day lookback window
  const from = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0];

  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    pageSize: '5',
    language: 'en',
    from,
    apiKey,
  });

  // Use `sources` or `domains` depending on which is available for the outlet.
  if (mapping.sources) params.set('sources', mapping.sources);
  else if (mapping.domains) params.set('domains', mapping.domains);

  try {
    let res = await fetch(`https://newsapi.org/v2/everything?${params}`);
    let data = await res.json();

    // Fallback: if no results for this specific source, retry without source filter.
    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      params.delete('sources');
      params.delete('domains');
      res = await fetch(`https://newsapi.org/v2/everything?${params}`);
      data = await res.json();
    }

    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No articles found for this source and topic' }),
      };
    }

    const article = buildArticle(data.articles, source, dateStr);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    };
  } catch (err) {
    console.error('NewsAPI fetch error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
