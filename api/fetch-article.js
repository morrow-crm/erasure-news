const TOPIC_SEEDS = {
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

const SOURCE_STYLES = {
  'New York Times':      'measured, analytical, liberal establishment. Dense with named officials and expert quotes. Long sentences, careful attribution.',
  'The Guardian':        'urgent progressive moral framing. Human-centered, global perspective, environmental urgency. Emotive but factual.',
  'Washington Post':     'insider Washington. Investigative edge, political consequence, authoritative and detailed.',
  'AP':                  'wire-service neutral. Short sentences, heavy attribution, passive constructions, inverted pyramid. No opinion.',
  'Reuters':             'financial-wire precision. Global scope, dry passive voice, numbers and market impact.',
  'Wall Street Journal': 'business-conservative. Market implications, regulatory cost, economic framing. Policy seen through business lens.',
  'Fox News':            'populist right. Confrontational tone, government skepticism, emotive language, working-class appeal.',
  'New York Post':       'tabloid. Short punchy sentences, sensational verbs, bold claims, vernacular voice.',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { source, topic, dateStr } = req.body;
  if (!source || !topic || !dateStr) {
    return res.status(400).json({ error: 'Missing required fields: source, topic, dateStr' });
  }

  const seed = TOPIC_SEEDS[topic] || topic;
  const style = SOURCE_STYLES[source] || 'neutral journalistic prose';

  const prompt = `Today is ${dateStr}. Write a realistic news article as it would appear in ${source}.
Use your web_search tool to find a specific, real, current news story from the past week about: ${seed}
Write the article in the authentic voice of ${source}: ${style}
Requirements:
- Real event: specific names, places, organizations, figures, dates from actual current news
- Authentic voice — vocabulary, sentence structure, framing distinctive to ${source}
- ~400 words across exactly 5 paragraphs
- A strong journalistic headline
Return ONLY valid JSON (no markdown, no backticks):
{"headline":"...","byline":"By [Journalist Name] | ${source} | ${dateStr}","paragraphs":["...","...","...","...","..."]}`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: `Anthropic API error: ${errText}` });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(502).json({ error: 'No JSON in API response' });
    }

    const article = JSON.parse(match[0]);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(article);
  } catch (err) {
    console.error('Fetch article error:', err);
    return res.status(500).json({ error: err.message });
  }
}
