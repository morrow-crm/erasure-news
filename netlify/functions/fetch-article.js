const TOPIC_QUERIES = {
  ai:         'artificial intelligence OR machine learning OR AI regulation OR AI jobs OR ChatGPT',
  bodies:     'bodily autonomy OR reproductive rights OR abortion OR gender affirming care',
  climate:    'climate change OR extreme weather OR wildfire OR flooding OR carbon emissions',
  crime:      'crime OR murder OR robbery OR organized crime OR criminal investigation OR shooting',
  culture:    'arts OR censorship OR museum OR literature OR film OR cultural policy',
  education:  'education OR schools OR student loans OR teachers OR curriculum OR university',
  gender:     'gender equality OR gender identity OR transgender OR women rights OR Title IX',
  guns:       'gun control OR gun violence OR mass shooting OR Second Amendment OR firearms',
  health:     'public health OR pandemic OR hospital OR drug prices OR mental health',
  housing:    'housing crisis OR rent OR homelessness OR affordable housing OR mortgage rates',
  ice:        'ICE immigration enforcement OR deportation OR immigration raids OR undocumented',
  inflation:  'inflation OR consumer prices OR cost of living OR grocery prices OR CPI',
  justice:    'Supreme Court OR policing OR civil rights OR criminal justice OR protest',
  labor:      'labor unions OR strikes OR collective bargaining OR minimum wage OR workers',
  land:       'land rights OR public lands OR Indigenous land OR housing development OR eminent domain',
  money:      'personal finance OR wealth inequality OR billionaires OR wages OR cost of living',
  power:      'political power OR energy power grid OR power outage OR authoritarian OR executive power',
  protests:   'protest OR demonstration OR civil disobedience OR rally OR activism OR march',
  race:       'racial justice OR racism OR diversity OR hate crime OR civil rights',
  religion:   'religion OR faith OR church OR mosque OR religious freedom OR evangelical',
  science:    'scientific discovery OR biology OR physics OR research OR breakthrough',
  space:      'space exploration OR NASA OR rocket launch OR satellite OR asteroid OR Mars',
  tariffs:    'tariffs OR trade war OR import taxes OR trade policy',
  technology: 'big tech OR data privacy OR social media regulation OR cybersecurity OR Silicon Valley',
  unicorns:   'good news OR heartwarming OR acts of kindness OR animal rescue OR unexpected hero OR joyful OR wonder OR surprising discovery',
  vaccines:   'vaccine OR vaccination OR immunization OR booster OR anti-vax OR public health mandate',
  war:        'military conflict OR war OR ceasefire OR troops OR bombing OR casualties',
  water:      'water rights OR water crisis OR drought OR clean water OR flooding',
  work:       'labor market OR remote work OR workers rights OR layoffs OR gig economy',
};

// Map display source names to NewsAPI source IDs or domain fallbacks.
const SOURCE_MAP = {
  'New York Times':      { domains: 'nytimes.com' },
  'The Guardian':        { sources: 'the-guardian-us' },
  'Washington Post':     { sources: 'the-washington-post' },
  'AP':                  { sources: 'associated-press' },
  'Reuters':             { sources: 'reuters' },
  'Wall Street Journal': { sources: 'the-wall-street-journal' },
  'Fox News':            { sources: 'fox-news' },
  'New York Post':       { domains: 'nypost.com' },
  'NPR':                 { sources: 'npr' },
  'Bloomberg':           { sources: 'bloomberg' },
  'Politico':            { domains: 'politico.com' },
  'National Review':     { sources: 'national-review' },
};

// Source name → lean/short for headline cards.
// Lowercase keys for fuzzy matching.
const SOURCE_LEAN = {
  'new york times':      { lean: 'left',   short: 'NYT' },
  'the new york times':  { lean: 'left',   short: 'NYT' },
  'nytimes.com':         { lean: 'left',   short: 'NYT' },
  'the guardian':        { lean: 'left',   short: 'Guardian' },
  'washington post':     { lean: 'left',   short: 'WaPo' },
  'the washington post': { lean: 'left',   short: 'WaPo' },
  'npr':                 { lean: 'left',   short: 'NPR' },
  'associated press':    { lean: 'center', short: 'AP' },
  'ap':                  { lean: 'center', short: 'AP' },
  'ap news':             { lean: 'center', short: 'AP' },
  'reuters':             { lean: 'center', short: 'Reuters' },
  'bloomberg':           { lean: 'center', short: 'Bloomberg' },
  'politico':            { lean: 'center', short: 'Politico' },
  'wall street journal': { lean: 'right',  short: 'WSJ' },
  'the wall street journal': { lean: 'right', short: 'WSJ' },
  'fox news':            { lean: 'right',  short: 'Fox' },
  'new york post':       { lean: 'right',  short: 'NYPost' },
  'national review':     { lean: 'right',  short: 'NatRev' },
  'bbc news':            { lean: 'center', short: 'BBC' },
  'bbc':                 { lean: 'center', short: 'BBC' },
  'cnn':                 { lean: 'left',   short: 'CNN' },
  'cbs news':            { lean: 'left',   short: 'CBS' },
  'abc news':            { lean: 'left',   short: 'ABC' },
  'msnbc':               { lean: 'left',   short: 'MSNBC' },
  'the hill':            { lean: 'center', short: 'TheHill' },
  'usa today':           { lean: 'center', short: 'USAToday' },
  'axios':               { lean: 'center', short: 'Axios' },
  'the daily beast':     { lean: 'left',   short: 'DailyBeast' },
  'breitbart news':      { lean: 'right',  short: 'Breitbart' },
  'daily mail':          { lean: 'right',  short: 'DailyMail' },
  'newsweek':            { lean: 'center', short: 'Newsweek' },
  'al jazeera english':  { lean: 'center', short: 'AlJazeera' },
};

function lookupLean(sourceName) {
  if (!sourceName) return { lean: 'center', short: 'News' };
  const key = sourceName.toLowerCase().trim();
  if (SOURCE_LEAN[key]) return SOURCE_LEAN[key];
  // Try partial match
  for (const [k, v] of Object.entries(SOURCE_LEAN)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Unknown source — derive short name, default to center
  const short = sourceName.split(/\s+/).map(w => w[0]).join('').substring(0, 6);
  return { lean: 'center', short: short || 'News' };
}

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

// ── Per-API fetchers (each returns normalized headline array) ──

async function fetchNewsAPI(query, apiKey) {
  const from = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0];
  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    pageSize: '15',
    language: 'en',
    from,
    apiKey,
  });
  console.log(`[NewsAPI] Fetching: q="${query.substring(0, 40)}…"`);
  const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
  const data = await res.json();
  if (data.status !== 'ok' || !data.articles) {
    console.log(`[NewsAPI] status=${data.status}, code=${data.code || 'none'}`);
    return [];
  }
  console.log(`[NewsAPI] Got ${data.articles.length} articles`);
  return data.articles.map(a => ({
    title: a.title,
    description: (a.description || '').trim(),
    content: cleanContent(a.content),
    author: a.author || 'Staff Reporter',
    sourceName: a.source?.name || 'News',
    publishedAt: a.publishedAt,
    url: a.url,
  }));
}

async function fetchGuardian(query, apiKey) {
  if (!apiKey) return [];
  const params = new URLSearchParams({
    q: query,
    'api-key': apiKey,
    'show-fields': 'headline,trailText,byline',
    'page-size': '15',
    'order-by': 'newest',
  });
  console.log(`[Guardian] Fetching: q="${query.substring(0, 40)}…"`);
  const res = await fetch(`https://content.guardianapis.com/search?${params}`);
  const data = await res.json();
  if (!data.response || !data.response.results) {
    console.log(`[Guardian] No results in response`);
    return [];
  }
  console.log(`[Guardian] Got ${data.response.results.length} results`);
  return data.response.results.map(r => ({
    title: r.fields?.headline || r.webTitle || 'Untitled',
    description: r.fields?.trailText || '',
    content: '',
    author: r.fields?.byline || 'Guardian Staff',
    sourceName: 'The Guardian',
    publishedAt: r.webPublicationDate,
    url: r.webUrl,
  }));
}

async function fetchGNews(query, apiKey) {
  if (!apiKey) return [];
  const params = new URLSearchParams({
    q: query,
    apikey: apiKey,
    lang: 'en',
    max: '10',
    sortby: 'publishedAt',
  });
  console.log(`[GNews] Fetching: q="${query.substring(0, 40)}…"`);
  const res = await fetch(`https://gnews.io/api/v4/search?${params}`);
  const data = await res.json();
  if (!data.articles) {
    console.log(`[GNews] No articles in response`);
    return [];
  }
  console.log(`[GNews] Got ${data.articles.length} articles`);
  return data.articles.map(a => ({
    title: a.title,
    description: a.description || '',
    content: a.content || '',
    author: '',
    sourceName: a.source?.name || 'News',
    publishedAt: a.publishedAt,
    url: a.url,
  }));
}

/** Fisher-Yates shuffle (in-place). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Multi-API headlines handler ──

async function handleMultiApiHeadlines(body) {
  const { topics, dateStr } = body;
  const newsapiKey = process.env.NEWSAPI_KEY;
  const guardianKey = process.env.GUARDIAN_KEY;
  const gnewsKey = process.env.GNEWS_KEY;

  console.log(`[multi-api] topics=${JSON.stringify(topics)}, APIs: NewsAPI=${newsapiKey ? 'yes' : 'no'}, Guardian=${guardianKey ? 'yes' : 'no'}, GNews=${gnewsKey ? 'yes' : 'no'}`);

  // Build all fetch promises across all topics × all APIs
  const fetches = [];
  for (const topic of topics) {
    const query = TOPIC_QUERIES[topic] || topic;
    fetches.push(
      fetchNewsAPI(query, newsapiKey).catch(err => { console.error('[NewsAPI error]', err.message); return []; }),
      fetchGuardian(query, guardianKey).catch(err => { console.error('[Guardian error]', err.message); return []; }),
      fetchGNews(query, gnewsKey).catch(err => { console.error('[GNews error]', err.message); return []; }),
    );
  }

  const results = await Promise.allSettled(fetches);
  let pool = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      pool.push(...r.value);
    }
  }

  console.log(`[multi-api] Raw pool: ${pool.length} headlines`);

  // Deduplicate by lowercased title
  const seen = new Set();
  pool = pool.filter(hl => {
    if (!hl.title) return false;
    const key = hl.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Attach lean/short metadata
  pool = pool.map(hl => {
    const { lean, short } = lookupLean(hl.sourceName);
    return { ...hl, lean, short };
  });

  // Shuffle and cap
  shuffle(pool);
  const headlines = pool.slice(0, 15);

  console.log(`[multi-api] Returning ${headlines.length} headlines`);

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ headlines }),
  };
}

// ── Legacy single-source article builder ──

function buildArticle(articles, source, dateStr) {
  const lead = articles[0];
  const headline = lead.title || 'Untitled';
  const author = lead.author || 'Staff Reporter';
  const byline = `By ${author} | ${source} | ${dateStr}`;

  const chunks = articles.map(a => {
    const desc = (a.description || '').trim();
    const body = cleanContent(a.content);
    if (body && desc && body.startsWith(desc.substring(0, 50))) return body;
    return [desc, body].filter(Boolean).join(' ');
  }).filter(t => t.length > 0);

  let paragraphs;
  if (chunks.length >= 5) {
    paragraphs = chunks.slice(0, 5);
  } else if (chunks.length > 0) {
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

  while (paragraphs.length < 2) {
    paragraphs.push(paragraphs[paragraphs.length - 1]);
  }

  return { headline, byline, paragraphs };
}

function logUrl(params) {
  const clone = new URLSearchParams(params);
  clone.set('apiKey', '***MASKED***');
  return `https://newsapi.org/v2/everything?${clone}`;
}

function logNewsApiResponse(label, data) {
  console.log(`[NewsAPI ${label}] status=${data.status}, totalResults=${data.totalResults ?? 'n/a'}, code=${data.code ?? 'none'}, message=${data.message ?? 'none'}`);
}

exports.handler = async (event) => {
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

  const { mode, topics } = body;

  // ── New multi-API headlines path ──
  if (mode === 'headlines' && Array.isArray(topics) && topics.length > 0) {
    try {
      return await handleMultiApiHeadlines(body);
    } catch (err) {
      console.error('[multi-api] Unexpected error:', err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  // ── Legacy single-source path (article building for erasure) ──
  const { source, topic, dateStr } = body;
  console.log(`[fetch-article] source="${source}", topic="${topic}", dateStr="${dateStr}"`);

  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'NEWSAPI_KEY not configured.' }),
    };
  }

  if (!source || !topic || !dateStr) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing required fields: source, topic, dateStr' }),
    };
  }

  const query = TOPIC_QUERIES[topic] || topic;
  const mapping = SOURCE_MAP[source] || {};
  const from = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0];

  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    pageSize: mode === 'headlines' ? '12' : '5',
    language: 'en',
    from,
    apiKey,
  });

  if (mapping.sources) params.set('sources', mapping.sources);
  else if (mapping.domains) params.set('domains', mapping.domains);

  console.log(`[fetch-article] Request URL: ${logUrl(params)}`);

  try {
    let res = await fetch(`https://newsapi.org/v2/everything?${params}`);
    let data = await res.json();
    console.log(`[fetch-article] HTTP ${res.status}`);
    logNewsApiResponse('primary', data);

    if (data.status === 'error') {
      console.error(`[fetch-article] NewsAPI error: code=${data.code}, message=${data.message}`);
      if (['apiKeyInvalid', 'apiKeyDisabled', 'corsNotAllowed', 'rateLimited'].includes(data.code)) {
        return {
          statusCode: 502,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: `NewsAPI error: ${data.message}`, newsapiCode: data.code }),
        };
      }
    }

    // Fallback: retry without source filter
    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      console.log('[fetch-article] No results, retrying without source filter...');
      params.delete('sources');
      params.delete('domains');
      res = await fetch(`https://newsapi.org/v2/everything?${params}`);
      data = await res.json();
      logNewsApiResponse('fallback', data);
    }

    if (data.status === 'error') {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `NewsAPI error: ${data.message}`, newsapiCode: data.code }),
      };
    }

    if (!data.articles || data.articles.length === 0) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No articles found for this source and topic' }),
      };
    }

    console.log(`[fetch-article] Success: ${data.articles.length} articles`);

    if (mode === 'headlines') {
      const headlines = data.articles.map(a => ({
        title: a.title,
        description: (a.description || '').trim(),
        content: cleanContent(a.content),
        author: a.author || 'Staff Reporter',
        sourceName: a.source?.name || source,
        publishedAt: a.publishedAt,
        url: a.url,
      }));
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlines }),
      };
    }

    const article = buildArticle(data.articles, source, dateStr);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    };
  } catch (err) {
    console.error('[fetch-article] Unexpected error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
