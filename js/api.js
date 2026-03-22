import { API_ENDPOINT } from './config.js';

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
  return data.headlines;
}
