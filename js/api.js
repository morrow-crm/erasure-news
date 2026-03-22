import { API_ENDPOINT, TOPIC_KEYWORDS } from './config.js';

/**
 * Fetch an article from the serverless proxy.
 * The proxy holds the API key and constructs the full Anthropic request.
 */
export async function fetchArticle(source, topic, dateStr) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, topic, dateStr }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data; // { headline, byline, paragraphs }
}

/** Fetch headlines (individual articles) for browsing. */
export async function fetchHeadlines(source, topic, dateStr) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, topic, dateStr, mode: 'headlines' }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.headlines;
}

/**
 * Client-side relevance filter — mirrors the server-side check.
 * Returns true if title or description contains at least one required keyword.
 */
function passesRelevanceFilter(article, requiredKeywords) {
  if (!requiredKeywords || requiredKeywords.length === 0) return true;
  const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
  return requiredKeywords.some(kw => text.includes(kw.toLowerCase()));
}

/** Collect required keywords for the given topics. */
function getRequiredKeywords(topics) {
  const all = [];
  for (const t of topics) {
    if (TOPIC_KEYWORDS[t]?.required) all.push(...TOPIC_KEYWORDS[t].required);
  }
  return all;
}

/** Fetch headlines from all APIs (NewsAPI + Guardian + GNews) in one request. */
export async function fetchAllHeadlines(topics, dateStr) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics, dateStr, mode: 'headlines' }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  let headlines = data.headlines || [];

  // Client-side relevance filter — double-check server results
  const requiredKeywords = getRequiredKeywords(topics);
  if (requiredKeywords.length > 0) {
    headlines = headlines.filter(hl => passesRelevanceFilter(hl, requiredKeywords));
  }

  return headlines;
}
