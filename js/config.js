// API endpoint — Netlify redirects this to the serverless function.
export const API_ENDPOINT = '/api/fetch-article';

// ── Strict keyword lists per topic ──
// query: used for API call query strings
// required: at least one must appear in title or description (case-insensitive)
export const TOPIC_KEYWORDS = {
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

// Legacy alias — TOPIC_SEEDS maps topic→query for backward compat
export const TOPIC_SEEDS = Object.fromEntries(
  Object.entries(TOPIC_KEYWORDS).map(([k, v]) => [k, v.query])
);

export const ALL_SOURCES = [
  { s: 'New York Times',      lean: 'left',   short: 'NYT' },
  { s: 'The Guardian',        lean: 'left',   short: 'Guardian' },
  { s: 'Washington Post',     lean: 'left',   short: 'WaPo' },
  { s: 'NPR',                 lean: 'left',   short: 'NPR' },
  { s: 'AP',                  lean: 'center', short: 'AP' },
  { s: 'Reuters',             lean: 'center', short: 'Reuters' },
  { s: 'Bloomberg',           lean: 'center', short: 'Bloomberg' },
  { s: 'Politico',            lean: 'center', short: 'Politico' },
  { s: 'Wall Street Journal', lean: 'right',  short: 'WSJ' },
  { s: 'Fox News',            lean: 'right',  short: 'Fox' },
  { s: 'New York Post',       lean: 'right',  short: 'NYPost' },
  { s: 'National Review',     lean: 'right',  short: 'NatRev' },
];

// Line-break interval for poem display
export const POEM_LINE_LENGTH = 6;
