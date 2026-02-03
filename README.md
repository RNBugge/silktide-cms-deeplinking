# Silktide CMS Deep-Link Playbook (static site)

This folder contains a static, deployable mini-site that:
- lists 50 common CMS platforms,
- indicates whether Silktide has a built-in integration,
- recommends an edit-link strategy (built-in / meta tag / URL transform / depends / not feasible),
- provides a ready-to-share Markdown template for each CMS.

## What’s inside

- `index.html` + `app.js` + `styles.css` — the web UI
- `cms-data.json` — the CMS “database”
- `guides/*.md` — Notion-friendly deep-link templates (one per CMS)

## How to run locally

Because the site fetches JSON + Markdown files, open it via a local server (not `file://`).

### Option A: Python (recommended)
```bash
cd silktide-cms-integration-site
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option B: Node
```bash
npx serve .
```

## How to deploy

This is a static site — you can deploy to:
- Netlify (drag-and-drop the folder)
- Vercel (static)
- GitHub Pages (commit the folder and serve it)

## Notion import workflow

Each `guides/*.md` file can be:
- imported into Notion as a page, or
- pasted into Notion (Markdown paste).

## Editing the “database”

Update `cms-data.json` and/or `guides/*.md`.
The UI is data-driven — no build step needed.
