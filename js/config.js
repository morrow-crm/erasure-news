// API endpoint — Netlify redirects this to the serverless function.
export const API_ENDPOINT = '/api/fetch-article';

export const TOPIC_SEEDS = {
  climate:     'climate change OR extreme weather OR wildfire OR flooding OR carbon emissions',
  economy:     'inflation OR unemployment OR housing market OR interest rates OR recession',
  politics:    'Congress OR White House OR Senate OR election OR legislation OR political scandal',
  technology:  'artificial intelligence OR big tech OR data privacy OR social media regulation',
  war:         'military conflict OR war OR ceasefire OR troops OR bombing OR casualties',
  immigration: 'immigration OR migrants OR border OR asylum OR deportation',
  health:      'public health OR pandemic OR hospital OR drug prices OR mental health',
  justice:     'Supreme Court OR policing OR civil rights OR criminal justice OR protest',
  science:     'scientific discovery OR space OR biology OR physics OR research',
  culture:     'arts OR censorship OR museum OR literature OR film OR cultural policy',
};

export const SOURCE_STYLES = {
  'New York Times':      'measured, analytical, liberal establishment. Dense with named officials and expert quotes. Long sentences, careful attribution.',
  'The Guardian':        'urgent progressive moral framing. Human-centered, global perspective, environmental urgency. Emotive but factual.',
  'Washington Post':     'insider Washington. Investigative edge, political consequence, authoritative and detailed.',
  'AP':                  'wire-service neutral. Short sentences, heavy attribution, passive constructions, inverted pyramid. No opinion.',
  'Reuters':             'financial-wire precision. Global scope, dry passive voice, numbers and market impact.',
  'Wall Street Journal': 'business-conservative. Market implications, regulatory cost, economic framing. Policy seen through business lens.',
  'Fox News':            'populist right. Confrontational tone, government skepticism, emotive language, working-class appeal.',
  'New York Post':       'tabloid. Short punchy sentences, sensational verbs, bold claims, vernacular voice.',
};

// Line-break interval for poem display
export const POEM_LINE_LENGTH = 6;
