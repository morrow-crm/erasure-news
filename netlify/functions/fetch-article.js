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

// ── RSS feed assignments by topic ──
const TOPIC_RSS = {
  unicorns: [
    'https://www.goodnewsnetwork.org/feed',
    'https://feeds.feedburner.com/upworthy',
    'https://positive.news/feed',
    'https://www.kottke.org/feed',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://www.newscientist.com/feed/home',
    'https://phys.org/rss-feed',
    'https://www.theconversation.com/articles.atom',
  ],
  space: [
    'https://www.sciencedaily.com/rss/space_time.xml',
    'https://phys.org/rss-feed/space-news',
  ],
  culture: [
    'https://lithub.com/feed',
    'https://hyperallergic.com/feed',
    'https://www.smithsonianmag.com/rss/latest',
  ],
  technology: [
    'https://arstechnica.com/feed',
    'https://www.theconversation.com/technology/articles.atom',
  ],
  ai: [
    'https://arstechnica.com/feed',
    'https://www.theconversation.com/technology/articles.atom',
  ],
  climate: [
    'https://www.theconversation.com/environment/articles.atom',
    'https://phys.org/rss-feed/earth-news',
  ],
  war: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://www.dw.com/rss/rss.xml',
    'https://rfi.fr/en/rss',
  ],
  land: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://www.dw.com/rss/rss.xml',
    'https://rfi.fr/en/rss',
  ],
  water: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://www.dw.com/rss/rss.xml',
    'https://rfi.fr/en/rss',
  ],
  // Politics/social topics share a common set
  justice:  ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  ice:      ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  guns:     ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  protests: ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  race:     ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  gender:   ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  labor:    ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  religion: ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  bodies:   ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  crime:    ['https://www.theconversation.com/articles.atom', 'https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
  // Economy topics
  inflation: ['https://www.theconversation.com/economy/articles.atom', 'https://arstechnica.com/feed'],
  housing:   ['https://www.theconversation.com/economy/articles.atom', 'https://arstechnica.com/feed'],
  tariffs:   ['https://www.theconversation.com/economy/articles.atom', 'https://arstechnica.com/feed'],
  money:     ['https://www.theconversation.com/economy/articles.atom', 'https://arstechnica.com/feed'],
  work:      ['https://www.theconversation.com/economy/articles.atom', 'https://arstechnica.com/feed'],
  // Education
  education: ['https://www.theconversation.com/education/articles.atom'],
  // Health
  health:   ['https://www.theconversation.com/health/articles.atom', 'https://www.sciencedaily.com/rss/health_medicine.xml'],
  vaccines: ['https://www.theconversation.com/health/articles.atom', 'https://www.sciencedaily.com/rss/health_medicine.xml'],
  // Power & Elections
  power: ['https://commondreams.org/rss.xml', 'https://reason.com/feed', 'https://www.dailycaller.com/feed'],
};

// RSS source → lean + short label
const RSS_SOURCE_LEAN = {
  'goodnewsnetwork.org':  { lean: 'unicorn', short: 'GoodNews' },
  'feedburner.com':       { lean: 'unicorn', short: 'Upworthy' },
  'upworthy':             { lean: 'unicorn', short: 'Upworthy' },
  'positive.news':        { lean: 'unicorn', short: 'PosNews' },
  'kottke.org':           { lean: 'unicorn', short: 'Kottke' },
  'sciencedaily.com':     { lean: 'center',  short: 'SciDaily' },
  'newscientist.com':     { lean: 'center',  short: 'NewSci' },
  'phys.org':             { lean: 'center',  short: 'PhysOrg' },
  'theconversation.com':  { lean: 'center',  short: 'TheConvo' },
  'lithub.com':           { lean: 'center',  short: 'LitHub' },
  'hyperallergic.com':    { lean: 'left',    short: 'HyperAll' },
  'smithsonianmag.com':   { lean: 'center',  short: 'Smithson' },
  'arstechnica.com':      { lean: 'center',  short: 'ArsTech' },
  'aljazeera.com':        { lean: 'left',    short: 'AlJazeera' },
  'dw.com':               { lean: 'center',  short: 'DW' },
  'rfi.fr':               { lean: 'center',  short: 'RFI' },
  'commondreams.org':     { lean: 'left',    short: 'CommDream' },
  'reason.com':           { lean: 'right',   short: 'Reason' },
  'dailycaller.com':      { lean: 'right',   short: 'DailyCal' },
  'nasa.gov':             { lean: 'center',  short: 'NASA' },
};

/** Derive source name from a feed URL for lean lookup. */
function rssSourceFromUrl(feedUrl) {
  try {
    const host = new URL(feedUrl).hostname.replace(/^www\./, '');
    for (const [domain, info] of Object.entries(RSS_SOURCE_LEAN)) {
      if (host.includes(domain)) return { sourceName: info.short, ...info };
    }
    return { sourceName: host, lean: 'center', short: host.split('.')[0] };
  } catch {
    return { sourceName: 'RSS', lean: 'center', short: 'RSS' };
  }
}

/** Minimal XML text extraction — gets text content from an XML tag. */
function xmlText(xml, tag) {
  // Handle namespaced and non-namespaced tags
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'),
  ];
  for (const re of patterns) {
    const m = xml.match(re);
    if (m) return m[1].replace(/<[^>]+>/g, '').trim();
  }
  return '';
}

/** Parse RSS/Atom XML into normalized article objects. Cap at maxItems. */
function parseRSSItems(xml, feedUrl, maxItems = 4) {
  const { sourceName, lean, short } = rssSourceFromUrl(feedUrl);
  const items = [];

  // Try RSS <item> tags first, then Atom <entry> tags
  const isAtom = xml.includes('<feed') && xml.includes('<entry');
  const tagOpen = isAtom ? '<entry' : '<item';
  const tagClose = isAtom ? '</entry>' : '</item>';

  let pos = 0;
  while (items.length < maxItems) {
    const start = xml.indexOf(tagOpen, pos);
    if (start === -1) break;
    const end = xml.indexOf(tagClose, start);
    if (end === -1) break;
    const chunk = xml.substring(start, end + tagClose.length);
    pos = end + tagClose.length;

    const title = xmlText(chunk, 'title');
    if (!title) continue;

    let description = '';
    if (isAtom) {
      description = xmlText(chunk, 'summary') || xmlText(chunk, 'content');
    } else {
      description = xmlText(chunk, 'description') || xmlText(chunk, 'content:encoded');
    }
    // Strip HTML and truncate description to something reasonable
    description = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (description.length > 800) description = description.substring(0, 800);

    let link = '';
    if (isAtom) {
      const linkMatch = chunk.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      link = linkMatch ? linkMatch[1] : '';
    } else {
      link = xmlText(chunk, 'link');
    }

    let pubDate = '';
    if (isAtom) {
      pubDate = xmlText(chunk, 'published') || xmlText(chunk, 'updated');
    } else {
      pubDate = xmlText(chunk, 'pubDate');
    }

    const author = xmlText(chunk, 'author') || xmlText(chunk, 'dc:creator') || '';

    items.push({
      title,
      description,
      content: description,  // RSS descriptions are often the full content
      author: author || `${sourceName} Staff`,
      sourceName,
      lean,
      short,
      publishedAt: pubDate || new Date().toISOString(),
      url: link,
      viaRSS: true,
    });
  }

  return items;
}

/** Fetch a single RSS feed with a 3-second timeout. */
async function fetchRSSFeed(feedUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    console.log(`[RSS] Fetching: ${feedUrl.substring(0, 60)}…`);
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ErasureNews/1.0' },
    });
    if (!res.ok) {
      console.log(`[RSS] HTTP ${res.status} from ${feedUrl}`);
      return [];
    }
    const xml = await res.text();
    const items = parseRSSItems(xml, feedUrl, 4);
    console.log(`[RSS] Got ${items.length} items from ${feedUrl.substring(0, 50)}`);
    return items;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(`[RSS] Timeout (3s) for ${feedUrl.substring(0, 50)}`);
    } else {
      console.log(`[RSS] Error fetching ${feedUrl.substring(0, 50)}: ${err.message}`);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetch all RSS feeds for given topics in parallel. */
async function fetchRSSForTopics(topics) {
  const feedSet = new Set();
  for (const topic of topics) {
    const feeds = TOPIC_RSS[topic];
    if (feeds) feeds.forEach(f => feedSet.add(f));
  }
  if (feedSet.size === 0) return [];

  console.log(`[RSS] Fetching ${feedSet.size} feeds for topics: ${topics.join(', ')}`);
  const results = await Promise.allSettled(
    [...feedSet].map(url => fetchRSSFeed(url))
  );

  const articles = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      articles.push(...r.value);
    }
  }
  console.log(`[RSS] Total: ${articles.length} articles from ${feedSet.size} feeds`);
  return articles;
}

/** Fetch NASA APOD for the Space topic. */
async function fetchNASAApod(apiKey) {
  if (!apiKey) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    console.log('[NASA] Fetching APOD');
    const params = new URLSearchParams({ api_key: apiKey, count: '3' });
    const res = await fetch(`https://api.nasa.gov/planetary/apod?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      console.log(`[NASA] HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = (Array.isArray(data) ? data : [data]).map(item => ({
      title: item.title || 'NASA Image of the Day',
      description: (item.explanation || '').substring(0, 800),
      content: item.explanation || '',
      author: item.copyright || 'NASA',
      sourceName: 'NASA',
      lean: 'center',
      short: 'NASA',
      publishedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      url: item.hdurl || item.url || 'https://apod.nasa.gov',
      viaRSS: true,
    }));
    console.log(`[NASA] Got ${items.length} APOD items`);
    return items;
  } catch (err) {
    console.log(`[NASA] Error: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

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
  'al jazeera english':  { lean: 'left', short: 'AlJazeera' },
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
    'show-fields': 'headline,trailText,byline,body',
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
  return data.response.results.map(r => {
    // Strip HTML tags from body text
    const rawBody = (r.fields?.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      title: r.fields?.headline || r.webTitle || 'Untitled',
      description: r.fields?.trailText || '',
      content: rawBody,
      author: r.fields?.byline || 'Guardian Staff',
      sourceName: 'The Guardian',
      publishedAt: r.webPublicationDate,
      url: r.webUrl,
    };
  });
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

/** Classify text quality: 'full' (>500 chars), 'long' (>200), or 'short'. */
function textQuality(hl) {
  const contentLen = (hl.content || '').length;
  const descLen = (hl.description || '').length;
  if (contentLen > 500) return 'full';
  if (contentLen > 200 || descLen > 200) return 'long';
  return 'short';
}

/** Fisher-Yates shuffle (in-place). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sources grouped by lean for targeted balance requests via NewsAPI.
const LEAN_SOURCES = {
  left:   [
    { sources: 'the-guardian-us' },
    { domains: 'nytimes.com' },
    { sources: 'the-washington-post' },
    { sources: 'npr' },
  ],
  center: [
    { sources: 'associated-press' },
    { sources: 'reuters' },
    { sources: 'bloomberg' },
    { domains: 'politico.com' },
  ],
  right:  [
    { sources: 'fox-news' },
    { domains: 'nypost.com' },
    { sources: 'the-wall-street-journal' },
    { sources: 'national-review' },
  ],
};

/** Make a targeted NewsAPI request for a specific lean. */
async function fetchNewsAPIForLean(query, apiKey, lean) {
  if (!apiKey) return [];
  const targets = LEAN_SOURCES[lean];
  if (!targets || targets.length === 0) return [];
  const pick = targets[Math.floor(Math.random() * targets.length)];
  const from = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0];
  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    pageSize: '5',
    language: 'en',
    from,
    apiKey,
  });
  if (pick.sources) params.set('sources', pick.sources);
  else if (pick.domains) params.set('domains', pick.domains);
  console.log(`[NewsAPI-${lean}] Targeted fetch for balance`);
  const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
  const data = await res.json();
  if (data.status !== 'ok' || !data.articles) return [];
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

// ── Multi-API headlines handler ──

async function handleMultiApiHeadlines(body) {
  const { topics } = body;
  const newsapiKey = process.env.NEWSAPI_KEY;
  const guardianKey = process.env.GUARDIAN_KEY;
  const gnewsKey = process.env.GNEWS_KEY;
  const nasaKey = process.env.NASA_API_KEY;
  const isUnicorn = topics.includes('unicorns');
  const isSpace = topics.includes('space');

  console.log(`[multi-api] topics=${JSON.stringify(topics)}, APIs: NewsAPI=${newsapiKey ? 'yes' : 'no'}, Guardian=${guardianKey ? 'yes' : 'no'}, GNews=${gnewsKey ? 'yes' : 'no'}, NASA=${nasaKey ? 'yes' : 'no'}`);

  // Phase 1: Broad fetch across all topics × all APIs + RSS + NASA in parallel
  const fetches = [];
  for (const topic of topics) {
    const query = TOPIC_QUERIES[topic] || topic;
    fetches.push(
      fetchNewsAPI(query, newsapiKey).catch(err => { console.error('[NewsAPI error]', err.message); return []; }),
      fetchGuardian(query, guardianKey).catch(err => { console.error('[Guardian error]', err.message); return []; }),
      fetchGNews(query, gnewsKey).catch(err => { console.error('[GNews error]', err.message); return []; }),
    );
  }

  // RSS feeds and NASA run in parallel with the API fetches
  const rssPromise = fetchRSSForTopics(topics).catch(err => { console.error('[RSS error]', err.message); return []; });
  const nasaPromise = isSpace ? fetchNASAApod(nasaKey).catch(err => { console.error('[NASA error]', err.message); return []; }) : Promise.resolve([]);

  const [apiResults, rssArticles, nasaArticles] = await Promise.all([
    Promise.allSettled(fetches),
    rssPromise,
    nasaPromise,
  ]);

  let pool = [];
  for (const r of apiResults) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      pool.push(...r.value);
    }
  }

  console.log(`[multi-api] Raw API pool: ${pool.length}, RSS: ${rssArticles.length}, NASA: ${nasaArticles.length}`);

  // For unicorns, RSS results go first so they get priority after dedup
  const rssPool = [...rssArticles, ...nasaArticles];
  if (isUnicorn) {
    pool = [...rssPool, ...pool];
  } else {
    pool = [...pool, ...rssPool];
  }

  // Deduplicate by lowercased title (first occurrence wins — order matters for unicorn priority)
  const seen = new Set();
  pool = pool.filter(hl => {
    if (!hl.title) return false;
    const key = hl.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Attach lean/short/textQuality metadata (RSS items already have lean/short)
  pool = pool.map(hl => {
    if (!hl.lean || !hl.short) {
      const { lean, short } = lookupLean(hl.sourceName);
      return { ...hl, lean, short, textQuality: textQuality(hl) };
    }
    return { ...hl, textQuality: hl.textQuality || textQuality(hl) };
  });

  // Phase 2: Check lean balance — if any lean has < 3 articles, do targeted fetches
  const leanCounts = { left: 0, center: 0, right: 0 };
  pool.forEach(hl => { if (leanCounts[hl.lean] !== undefined) leanCounts[hl.lean]++; });
  console.log(`[multi-api] Lean balance: L=${leanCounts.left}, C=${leanCounts.center}, R=${leanCounts.right}`);

  const balanceFetches = [];
  const query0 = TOPIC_QUERIES[topics[0]] || topics[0];
  for (const lean of ['left', 'center', 'right']) {
    if (leanCounts[lean] < 3) {
      balanceFetches.push(
        fetchNewsAPIForLean(query0, newsapiKey, lean)
          .catch(err => { console.error(`[balance-${lean} error]`, err.message); return []; })
      );
    }
  }

  if (balanceFetches.length > 0) {
    const balanceResults = await Promise.allSettled(balanceFetches);
    for (const r of balanceResults) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const hl of r.value) {
          const key = hl.title?.toLowerCase().trim();
          if (key && !seen.has(key)) {
            seen.add(key);
            const { lean, short } = lookupLean(hl.sourceName);
            pool.push({ ...hl, lean, short, textQuality: textQuality(hl) });
          }
        }
      }
    }
    console.log(`[multi-api] After balance: ${pool.length} headlines`);
  }

  // Sort: prefer articles with more text (full > long > short)
  const qualityOrder = { full: 0, long: 1, short: 2 };
  pool.sort((a, b) => (qualityOrder[a.textQuality] || 2) - (qualityOrder[b.textQuality] || 2));

  // Build a balanced selection: pick up to 5 per lean, then fill remaining
  const byLean = { left: [], center: [], right: [], unicorn: [] };
  const overflow = [];
  for (const hl of pool) {
    if (byLean[hl.lean] && byLean[hl.lean].length < 5) {
      byLean[hl.lean].push(hl);
    } else {
      overflow.push(hl);
    }
  }

  // Unicorn articles always included when topic is unicorns
  let headlines = [...byLean.unicorn, ...byLean.left, ...byLean.center, ...byLean.right];
  // Fill to 15 from overflow
  for (const hl of overflow) {
    if (headlines.length >= 15) break;
    headlines.push(hl);
  }

  shuffle(headlines);
  headlines = headlines.slice(0, 15);

  console.log(`[multi-api] Returning ${headlines.length} headlines (L=${headlines.filter(h=>h.lean==='left').length}, C=${headlines.filter(h=>h.lean==='center').length}, R=${headlines.filter(h=>h.lean==='right').length})`);

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
