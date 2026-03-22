const TOPIC_KEYWORDS = {
  ai: {
    query: '"artificial intelligence" OR "AI" OR "machine learning" OR "generative AI" OR "GenAI" OR "large language model" OR "LLM" OR "ChatGPT" OR "OpenAI" OR "Anthropic" OR "Gemini" OR "Claude" OR "deep learning" OR "neural network"',
    required: ['artificial intelligence', 'AI', 'machine learning', 'generative', 'ChatGPT', 'OpenAI', 'Anthropic', 'Gemini', 'Claude', 'LLM', 'neural', 'deepfake', 'algorithm', 'automation', 'robot'],
  },
  bodies: {
    query: '"abortion" OR "reproductive rights" OR "bodily autonomy" OR "Roe v Wade" OR "gender affirming" OR "trans healthcare" OR "contraception" OR "IVF" OR "maternal health" OR "planned parenthood"',
    required: ['abortion', 'reproductive', 'bodily autonomy', 'contraception', 'IVF', 'maternal', 'gender affirming', 'trans healthcare', 'planned parenthood'],
  },
  climate: {
    query: '"climate change" OR "global warming" OR "carbon emissions" OR "greenhouse gas" OR "fossil fuels" OR "renewable energy" OR "extreme weather" OR "wildfire" OR "flooding" OR "drought" OR "sea level" OR "IPCC" OR "Paris agreement"',
    required: ['climate', 'warming', 'carbon', 'emissions', 'fossil fuel', 'renewable', 'wildfire', 'flood', 'drought', 'sea level', 'hurricane', 'tornado', 'extreme weather'],
  },
  crime: {
    query: '"crime" OR "murder" OR "shooting" OR "robbery" OR "arrest" OR "convicted" OR "sentenced" OR "criminal" OR "homicide" OR "assault" OR "theft" OR "fraud" OR "corruption"',
    required: ['crime', 'murder', 'shooting', 'robbery', 'arrest', 'convicted', 'sentenced', 'criminal', 'homicide', 'assault', 'theft', 'fraud', 'corrupt'],
  },
  culture: {
    query: '"art" OR "music" OR "film" OR "literature" OR "theater" OR "museum" OR "book" OR "novel" OR "exhibition" OR "culture" OR "performance" OR "festival" OR "award" OR "Grammy" OR "Oscar" OR "Pulitzer"',
    required: ['art', 'music', 'film', 'movie', 'literature', 'theater', 'museum', 'book', 'novel', 'exhibition', 'culture', 'performance', 'festival', 'Grammy', 'Oscar', 'Pulitzer', 'gallery'],
  },
  education: {
    query: '"education" OR "school" OR "university" OR "college" OR "student" OR "teacher" OR "curriculum" OR "tuition" OR "student loan" OR "school board" OR "classroom" OR "academic" OR "literacy" OR "graduation"',
    required: ['education', 'school', 'university', 'college', 'student', 'teacher', 'curriculum', 'tuition', 'classroom', 'academic', 'literacy', 'graduation', 'school board'],
  },
  gender: {
    query: '"gender" OR "transgender" OR "nonbinary" OR "LGBTQ" OR "feminism" OR "sexism" OR "gender pay gap" OR "Title IX" OR "gender identity" OR "pronouns" OR "women\'s rights" OR "gender based violence"',
    required: ['gender', 'transgender', 'nonbinary', 'LGBTQ', 'feminism', 'sexism', 'pay gap', 'Title IX', 'gender identity', 'pronouns', "women's rights"],
  },
  guns: {
    query: '"gun" OR "firearm" OR "shooting" OR "Second Amendment" OR "gun control" OR "NRA" OR "mass shooting" OR "gun violence" OR "rifle" OR "handgun" OR "ammunition" OR "concealed carry" OR "red flag law"',
    required: ['gun', 'firearm', 'Second Amendment', 'NRA', 'shooting', 'gun control', 'mass shooting', 'rifle', 'handgun', 'ammunition', 'concealed carry'],
  },
  health: {
    query: '"health" OR "hospital" OR "disease" OR "pandemic" OR "FDA" OR "CDC" OR "vaccine" OR "cancer" OR "mental health" OR "drug" OR "medication" OR "surgery" OR "healthcare" OR "insurance" OR "Medicaid" OR "Medicare"',
    required: ['health', 'hospital', 'disease', 'pandemic', 'FDA', 'CDC', 'vaccine', 'cancer', 'mental health', 'drug', 'medication', 'surgery', 'healthcare', 'insurance', 'Medicaid', 'Medicare'],
  },
  housing: {
    query: '"housing" OR "rent" OR "mortgage" OR "eviction" OR "homeless" OR "affordable housing" OR "real estate" OR "home prices" OR "landlord" OR "tenant" OR "zoning" OR "housing crisis" OR "foreclosure"',
    required: ['housing', 'rent', 'mortgage', 'eviction', 'homeless', 'affordable housing', 'real estate', 'home prices', 'landlord', 'tenant', 'zoning', 'foreclosure'],
  },
  ice: {
    query: '"ICE" OR "immigration enforcement" OR "deportation" OR "undocumented" OR "immigration raid" OR "detention center" OR "border patrol" OR "asylum seeker" OR "immigration arrest" OR "removal order" OR "sanctuary city"',
    required: ['ICE', 'immigration enforcement', 'deportation', 'undocumented', 'immigration raid', 'detention', 'border patrol', 'asylum', 'removal order', 'sanctuary city'],
  },
  inflation: {
    query: '"inflation" OR "consumer prices" OR "CPI" OR "cost of living" OR "price increase" OR "Federal Reserve" OR "interest rates" OR "purchasing power" OR "tariff" OR "grocery prices" OR "energy prices"',
    required: ['inflation', 'consumer prices', 'CPI', 'cost of living', 'price increase', 'Federal Reserve', 'interest rates', 'purchasing power', 'grocery prices'],
  },
  justice: {
    query: '"Supreme Court" OR "court ruling" OR "lawsuit" OR "civil rights" OR "justice" OR "trial" OR "verdict" OR "judge" OR "attorney general" OR "DOJ" OR "constitutional" OR "legal" OR "indictment" OR "prosecution"',
    required: ['Supreme Court', 'court', 'lawsuit', 'civil rights', 'justice', 'trial', 'verdict', 'judge', 'attorney general', 'DOJ', 'constitutional', 'indictment', 'prosecution'],
  },
  labor: {
    query: '"labor" OR "union" OR "strike" OR "workers" OR "wages" OR "minimum wage" OR "layoffs" OR "employment" OR "unemployment" OR "gig economy" OR "NLRB" OR "collective bargaining" OR "workplace" OR "remote work"',
    required: ['labor', 'union', 'strike', 'workers', 'wages', 'minimum wage', 'layoffs', 'employment', 'unemployment', 'gig economy', 'NLRB', 'collective bargaining', 'workplace'],
  },
  land: {
    query: '"land rights" OR "public lands" OR "Indigenous land" OR "eminent domain" OR "National Park" OR "deforestation" OR "land use" OR "property rights" OR "conservation" OR "land grab" OR "federal land" OR "tribal land"',
    required: ['land', 'public lands', 'Indigenous', 'eminent domain', 'National Park', 'deforestation', 'conservation', 'tribal', 'property rights', 'land use'],
  },
  money: {
    query: '"wealth" OR "billionaire" OR "inequality" OR "personal finance" OR "stock market" OR "Wall Street" OR "hedge fund" OR "tax" OR "IRS" OR "deficit" OR "debt" OR "cryptocurrency" OR "bitcoin" OR "banking"',
    required: ['wealth', 'billionaire', 'inequality', 'finance', 'stock market', 'Wall Street', 'hedge fund', 'tax', 'IRS', 'deficit', 'debt', 'cryptocurrency', 'bitcoin', 'banking'],
  },
  power: {
    query: '"executive power" OR "authoritarianism" OR "democracy" OR "autocracy" OR "political power" OR "government overreach" OR "checks and balances" OR "separation of powers" OR "coup" OR "martial law" OR "emergency powers"',
    required: ['executive power', 'authoritarianism', 'democracy', 'autocracy', 'political power', 'government overreach', 'checks and balances', 'separation of powers', 'coup', 'martial law', 'emergency powers'],
  },
  protests: {
    query: '"protest" OR "demonstration" OR "rally" OR "march" OR "activist" OR "civil disobedience" OR "riot" OR "uprising" OR "sit-in" OR "boycott" OR "picket" OR "demonstrators"',
    required: ['protest', 'demonstration', 'rally', 'march', 'activist', 'civil disobedience', 'riot', 'uprising', 'boycott', 'picket', 'demonstrators'],
  },
  race: {
    query: '"race" OR "racism" OR "racial" OR "civil rights" OR "Black" OR "white supremacy" OR "discrimination" OR "diversity" OR "equity" OR "reparations" OR "hate crime" OR "systemic racism" OR "NAACP" OR "segregation"',
    required: ['race', 'racism', 'racial', 'civil rights', 'white supremacy', 'discrimination', 'diversity', 'equity', 'reparations', 'hate crime', 'systemic racism', 'NAACP', 'segregation'],
  },
  religion: {
    query: '"religion" OR "church" OR "faith" OR "Christian" OR "Muslim" OR "Jewish" OR "Hindu" OR "Buddhist" OR "mosque" OR "synagogue" OR "religious freedom" OR "Pope" OR "evangelical" OR "separation of church and state"',
    required: ['religion', 'church', 'faith', 'Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'mosque', 'synagogue', 'religious freedom', 'Pope', 'evangelical'],
  },
  science: {
    query: '"science" OR "research" OR "study" OR "discovery" OR "scientist" OR "biology" OR "physics" OR "chemistry" OR "genetics" OR "evolution" OR "NASA" OR "experiment" OR "breakthrough" OR "peer reviewed"',
    required: ['science', 'research', 'study', 'discovery', 'scientist', 'biology', 'physics', 'chemistry', 'genetics', 'evolution', 'NASA', 'experiment', 'breakthrough'],
  },
  space: {
    query: '"space" OR "NASA" OR "SpaceX" OR "rocket" OR "astronaut" OR "satellite" OR "Mars" OR "moon" OR "orbit" OR "telescope" OR "James Webb" OR "asteroid" OR "galaxy" OR "universe" OR "launch"',
    required: ['space', 'NASA', 'SpaceX', 'rocket', 'astronaut', 'satellite', 'Mars', 'moon', 'orbit', 'telescope', 'James Webb', 'asteroid', 'galaxy', 'launch'],
  },
  tariffs: {
    query: '"tariff" OR "trade war" OR "import tax" OR "trade policy" OR "trade deficit" OR "WTO" OR "trade deal" OR "customs" OR "export" OR "sanctions" OR "trade barrier" OR "supply chain"',
    required: ['tariff', 'trade war', 'import tax', 'trade policy', 'trade deficit', 'WTO', 'trade deal', 'customs', 'export', 'sanctions', 'trade barrier', 'supply chain'],
  },
  technology: {
    query: '"technology" OR "tech" OR "software" OR "hardware" OR "startup" OR "Silicon Valley" OR "Apple" OR "Google" OR "Microsoft" OR "Meta" OR "Amazon" OR "cybersecurity" OR "data privacy" OR "social media" OR "app"',
    required: ['technology', 'tech', 'software', 'hardware', 'startup', 'Silicon Valley', 'Apple', 'Google', 'Microsoft', 'Meta', 'Amazon', 'cybersecurity', 'data privacy', 'social media', 'app'],
  },
  unicorns: {
    query: '"good news" OR "heartwarming" OR "acts of kindness" OR "community hero" OR "animal rescue" OR "joyful" OR "wonder" OR "surprising discovery" OR "uplifting" OR "hope" OR "celebration" OR "breakthrough" OR "miracle"',
    required: ['good news', 'heartwarming', 'kindness', 'hero', 'rescue', 'joyful', 'uplifting', 'hope', 'celebration', 'miracle', 'wonder', 'inspiring'],
  },
  vaccines: {
    query: '"vaccine" OR "vaccination" OR "immunization" OR "booster" OR "anti-vax" OR "herd immunity" OR "mRNA" OR "Pfizer" OR "Moderna" OR "CDC vaccine" OR "measles" OR "polio" OR "flu shot"',
    required: ['vaccine', 'vaccination', 'immunization', 'booster', 'anti-vax', 'herd immunity', 'mRNA', 'Pfizer', 'Moderna', 'measles', 'polio', 'flu shot'],
  },
  war: {
    query: '"war" OR "conflict" OR "military" OR "troops" OR "bombing" OR "ceasefire" OR "invasion" OR "missile" OR "airstrike" OR "casualties" OR "battle" OR "frontline" OR "weapons" OR "NATO" OR "Pentagon"',
    required: ['war', 'conflict', 'military', 'troops', 'bombing', 'ceasefire', 'invasion', 'missile', 'airstrike', 'casualties', 'battle', 'frontline', 'weapons', 'NATO', 'Pentagon'],
  },
  water: {
    query: '"water" OR "drinking water" OR "water rights" OR "drought" OR "water crisis" OR "contamination" OR "flood" OR "river" OR "dam" OR "water supply" OR "aquifer" OR "water pollution" OR "clean water"',
    required: ['water', 'drinking water', 'water rights', 'drought', 'water crisis', 'contamination', 'flood', 'river', 'dam', 'water supply', 'aquifer', 'pollution', 'clean water'],
  },
  work: {
    query: '"work" OR "workplace" OR "job" OR "career" OR "remote work" OR "return to office" OR "four day week" OR "burnout" OR "workforce" OR "employment" OR "hiring" OR "firing" OR "resignation" OR "work life balance"',
    required: ['work', 'workplace', 'job', 'career', 'remote work', 'return to office', 'four day week', 'burnout', 'workforce', 'employment', 'hiring', 'firing', 'resignation'],
  },
};

/** Get query string for a topic. */
function getTopicQuery(topic) {
  return TOPIC_KEYWORDS[topic]?.query || topic;
}

/** Get required keywords for a topic. */
function getRequiredKeywords(topics) {
  const all = [];
  for (const t of topics) {
    if (TOPIC_KEYWORDS[t]?.required) all.push(...TOPIC_KEYWORDS[t].required);
  }
  return all;
}

/** Check if an article's title+description contain at least one required keyword (case-insensitive). */
function passesRelevanceFilter(article, requiredKeywords) {
  if (!requiredKeywords || requiredKeywords.length === 0) return true;
  const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
  return requiredKeywords.some(kw => text.includes(kw.toLowerCase()));
}

/** Get ISO date string N days ago. */
function daysAgo(n) {
  return new Date(Date.now() - n * 86_400_000).toISOString().split('T')[0];
}

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

/** Minimal XML text extraction — gets text content from an XML tag.
 *  stripHtml=false returns raw content (for further processing). */
function xmlText(xml, tag, stripHtml = true) {
  // Handle namespaced and non-namespaced tags
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'),
  ];
  for (const re of patterns) {
    const m = xml.match(re);
    if (m) {
      const raw = m[1].trim();
      return stripHtml ? raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : raw;
    }
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

    // Extract full content — check content:encoded first (often has full article HTML)
    let fullContent = '';
    let description = '';
    if (isAtom) {
      fullContent = xmlText(chunk, 'content') || xmlText(chunk, 'summary');
      description = xmlText(chunk, 'summary') || fullContent;
    } else {
      // content:encoded typically has the full article in RSS feeds
      fullContent = xmlText(chunk, 'content:encoded') || xmlText(chunk, 'description');
      description = xmlText(chunk, 'description') || fullContent;
    }
    // fullContent is already HTML-stripped by xmlText; cap at 3000 chars for full text
    if (fullContent.length > 3000) fullContent = fullContent.substring(0, 3000);
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

    // Use the longer of fullContent vs description
    const bestContent = fullContent.length > description.length ? fullContent : description;
    const wc = wordCount(bestContent);
    console.log(`[RSS] "${title.substring(0, 50)}" (${sourceName}) — ${wc} words`);

    items.push({
      title,
      description,
      content: bestContent,
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

/** Count words in a string. */
function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Attempt to scrape article text from a URL (3s timeout). */
async function scrapeArticleText(url) {
  if (!url) return '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ErasureNews/1.0)',
        'Accept': 'text/html',
      },
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Extract text from <article> or <main> or common article body selectors
    let body = '';
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      body = articleMatch[1];
    } else {
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) body = mainMatch[1];
    }
    if (!body) {
      // Try grabbing all <p> tags
      const pTags = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pTags && pTags.length > 3) {
        body = pTags.join(' ');
      }
    }
    // Strip HTML, collapse whitespace
    const text = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.substring(0, 5000); // Cap at 5000 chars
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

// ── Per-API fetchers (each returns normalized headline array) ──

async function fetchNewsAPI(query, apiKey, fromDate) {
  const from = fromDate || daysAgo(3);
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
  // Map articles, then try scraping short ones in parallel
  const mapped = data.articles.map(a => ({
    title: a.title,
    description: (a.description || '').trim(),
    content: cleanContent(a.content),
    author: a.author || 'Staff Reporter',
    sourceName: a.source?.name || 'News',
    publishedAt: a.publishedAt,
    url: a.url,
  }));

  // Attempt to scrape full text for articles under 150 words
  const scrapePromises = mapped.map(async (article) => {
    const wc = wordCount(article.content);
    if (wc < 150 && article.url) {
      const scraped = await scrapeArticleText(article.url).catch(() => '');
      const scrapedWc = wordCount(scraped);
      if (scrapedWc > wc) {
        console.log(`[NewsAPI] Scraped "${article.title?.substring(0, 40)}" — ${wc} → ${scrapedWc} words`);
        article.content = scraped;
      }
    }
    const finalWc = wordCount(article.content || article.description);
    console.log(`[NewsAPI] "${(article.title || '').substring(0, 50)}" — ${finalWc} words`);
    return article;
  });

  return Promise.all(scrapePromises);
}

async function fetchGuardian(query, apiKey, fromDate) {
  if (!apiKey) return [];
  const params = new URLSearchParams({
    q: query,
    'api-key': apiKey,
    'show-fields': 'headline,trailText,standfirst,byline,bodyText,body',
    'page-size': '15',
    'order-by': 'newest',
    'from-date': fromDate || daysAgo(3),
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
    // Prefer bodyText (plain text), fall back to body (HTML stripped), then standfirst
    let rawBody = (r.fields?.bodyText || '').trim();
    if (!rawBody) {
      rawBody = (r.fields?.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const standfirst = (r.fields?.standfirst || '').replace(/<[^>]+>/g, '').trim();
    const description = r.fields?.trailText || standfirst || '';
    // Prepend standfirst if body doesn't already include it
    if (standfirst && rawBody && !rawBody.startsWith(standfirst.substring(0, 40))) {
      rawBody = standfirst + ' ' + rawBody;
    }
    const wc = wordCount(rawBody);
    console.log(`[Guardian] "${(r.fields?.headline || r.webTitle || '').substring(0, 50)}" — ${wc} words`);
    return {
      title: r.fields?.headline || r.webTitle || 'Untitled',
      description,
      content: rawBody,
      author: r.fields?.byline || 'Guardian Staff',
      sourceName: 'The Guardian',
      publishedAt: r.webPublicationDate,
      url: r.webUrl,
    };
  });
}

async function fetchGNews(query, apiKey, fromDate) {
  if (!apiKey) return [];
  const params = new URLSearchParams({
    q: query,
    apikey: apiKey,
    lang: 'en',
    max: '10',
    sortby: 'publishedAt',
    from: fromDate || daysAgo(3),
  });
  console.log(`[GNews] Fetching: q="${query.substring(0, 40)}…"`);
  const res = await fetch(`https://gnews.io/api/v4/search?${params}`);
  const data = await res.json();
  if (!data.articles) {
    console.log(`[GNews] No articles in response`);
    return [];
  }
  console.log(`[GNews] Got ${data.articles.length} articles`);
  return data.articles.map(a => {
    // GNews: prefer content field, fall back to description
    const content = (a.content || '').trim();
    const description = (a.description || '').trim();
    const best = content.length > description.length ? content : description;
    const wc = wordCount(best);
    console.log(`[GNews] "${(a.title || '').substring(0, 50)}" — ${wc} words`);
    return {
      title: a.title,
      description,
      content: best,
      author: '',
      sourceName: a.source?.name || 'News',
      publishedAt: a.publishedAt,
      url: a.url,
    };
  });
}

/** Classify text quality based on word count: 'full' (>=150), 'long' (>=80), or 'short'. */
function textQuality(hl) {
  const text = hl.content || hl.description || '';
  const wc = wordCount(text);
  if (wc >= 150) return 'full';
  if (wc >= 80) return 'long';
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
async function fetchNewsAPIForLean(query, apiKey, lean, fromDate) {
  if (!apiKey) return [];
  const targets = LEAN_SOURCES[lean];
  if (!targets || targets.length === 0) return [];
  const pick = targets[Math.floor(Math.random() * targets.length)];
  const from = fromDate || daysAgo(3);
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

  // Build combined required keywords for all selected topics
  const requiredKeywords = getRequiredKeywords(topics);

  // Phase 1: 3-day fetch across all topics × all APIs + RSS + NASA
  const from3 = daysAgo(3);
  const fetches = [];
  for (const topic of topics) {
    const query = getTopicQuery(topic);
    fetches.push(
      fetchNewsAPI(query, newsapiKey, from3).catch(err => { console.error('[NewsAPI error]', err.message); return []; }),
      fetchGuardian(query, guardianKey, from3).catch(err => { console.error('[Guardian error]', err.message); return []; }),
      fetchGNews(query, gnewsKey, from3).catch(err => { console.error('[GNews error]', err.message); return []; }),
    );
  }

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

  console.log(`[multi-api] Raw API pool (3-day): ${pool.length}, RSS: ${rssArticles.length}, NASA: ${nasaArticles.length}`);

  // For unicorns, RSS results go first so they get priority after dedup
  const rssPool = [...rssArticles, ...nasaArticles];
  if (isUnicorn) {
    pool = [...rssPool, ...pool];
  } else {
    pool = [...pool, ...rssPool];
  }

  // Deduplicate by lowercased title
  const seen = new Set();
  pool = pool.filter(hl => {
    if (!hl.title) return false;
    const key = hl.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Attach lean/short/textQuality metadata
  pool = pool.map(hl => {
    if (!hl.lean || !hl.short) {
      const { lean, short } = lookupLean(hl.sourceName);
      return { ...hl, lean, short, textQuality: textQuality(hl) };
    }
    return { ...hl, textQuality: hl.textQuality || textQuality(hl) };
  });

  // ── Strict relevance filter ──
  let beforeFilter = pool.length;
  pool = pool.filter(hl => {
    if (passesRelevanceFilter(hl, requiredKeywords)) return true;
    console.log(`[relevance] DROPPED: "${(hl.title || '').substring(0, 60)}" (${hl.sourceName})`);
    return false;
  });
  console.log(`[relevance] ${pool.length} passed / ${beforeFilter - pool.length} dropped`);

  // Filter out articles with fewer than 50 words
  pool = pool.filter(hl => {
    const text = hl.content || hl.description || '';
    const wc = wordCount(text);
    hl.wordCount = wc;
    if (wc < 50) {
      console.log(`[filter] DROPPED (<50 words): "${(hl.title || '').substring(0, 50)}" (${hl.sourceName}) — ${wc} words`);
      return false;
    }
    return true;
  });
  console.log(`[multi-api] After filters (3-day): ${pool.length} headlines`);

  // ── Phase 1b: If fewer than 3 articles, widen to 7 days ──
  if (pool.length < 3) {
    console.log(`[multi-api] Only ${pool.length} articles from 3-day window — widening to 7 days`);
    const from7 = daysAgo(7);
    const widerFetches = [];
    for (const topic of topics) {
      const query = getTopicQuery(topic);
      widerFetches.push(
        fetchNewsAPI(query, newsapiKey, from7).catch(() => []),
        fetchGuardian(query, guardianKey, from7).catch(() => []),
        fetchGNews(query, gnewsKey, from7).catch(() => []),
      );
    }
    const widerResults = await Promise.allSettled(widerFetches);
    let widerPool = [];
    for (const r of widerResults) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) widerPool.push(...r.value);
    }
    // Dedup against existing pool
    widerPool = widerPool.filter(hl => {
      if (!hl.title) return false;
      const key = hl.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Attach metadata + relevance filter
    widerPool = widerPool.map(hl => {
      if (!hl.lean || !hl.short) {
        const { lean, short } = lookupLean(hl.sourceName);
        return { ...hl, lean, short, textQuality: textQuality(hl) };
      }
      return { ...hl, textQuality: hl.textQuality || textQuality(hl) };
    }).filter(hl => passesRelevanceFilter(hl, requiredKeywords))
      .filter(hl => wordCount(hl.content || hl.description || '') >= 50);
    pool.push(...widerPool);
    console.log(`[multi-api] After 7-day fallback: ${pool.length} total headlines`);
  }

  // Phase 2: Check lean balance — if any lean has < 3 articles, do targeted fetches
  const leanCounts = { left: 0, center: 0, right: 0 };
  pool.forEach(hl => { if (leanCounts[hl.lean] !== undefined) leanCounts[hl.lean]++; });
  console.log(`[multi-api] Lean balance: L=${leanCounts.left}, C=${leanCounts.center}, R=${leanCounts.right}`);

  const balanceFetches = [];
  const query0 = getTopicQuery(topics[0]);
  for (const lean of ['left', 'center', 'right']) {
    if (leanCounts[lean] < 3) {
      balanceFetches.push(
        fetchNewsAPIForLean(query0, newsapiKey, lean, daysAgo(7))
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
            const enriched = { ...hl, lean, short, textQuality: textQuality(hl) };
            if (passesRelevanceFilter(enriched, requiredKeywords)) {
              pool.push(enriched);
            }
          }
        }
      }
    }
    console.log(`[multi-api] After balance: ${pool.length} headlines`);
  }

  // Sort by publication date — newest first
  pool.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });

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

  const query = getTopicQuery(topic);
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
