// API endpoint — Netlify redirects this to the serverless function.
export const API_ENDPOINT = '/api/fetch-article';

export const TOPIC_SEEDS = {
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
