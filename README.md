# Erasure News

Erasure poetry from today's news. Choose your sources. Erase what you don't like.

## How It Works

1. **Choose** 1-3 news topics and 2-4 sources across the political spectrum
2. **Read** real, current articles generated in each outlet's authentic voice (via Claude + web search)
3. **Erase** — click or drag to black out words; Shift+click to circle keepers for your poem
4. **Share** your erasure poem to X, Mastodon, clipboard, or download as a newspaper-style image card

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Local Development

```bash
# Clone and install
git clone https://github.com/morrow-crm/erasure-news.git
cd erasure-news
npm install

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run locally (serves both frontend and API)
npm run dev
```

This starts Vercel's local dev server, which serves the static frontend and the serverless function at `/api/fetch-article`.

### Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard
4. Deploy — Vercel handles the serverless function automatically

## Project Structure

```
index.html              Static HTML shell (no inline JS/CSS)
css/style.css           All styles — newspaper broadsheet aesthetic
js/
  config.js             Constants: topics, sources, style descriptions
  api.js                Fetch articles via the serverless proxy
  ui.js                 Screen management, pill toggles, DOM helpers
  erasure.js            Word click/drag/blackout/keep, layer management
  poem.js               Kept-word collection, poem rendering
  share.js              Share modal, canvas card, export
  app.js                Entry point — wires everything together
api/
  fetch-article.js      Vercel serverless function (holds API key)
vercel.json             Vercel routing and CORS config
```

## Security

The Anthropic API key is never exposed to the browser. The frontend sends `{ source, topic, dateStr }` to the Vercel serverless function, which constructs the full API request server-side.
