# Silktide CMS Integration Overview (static site)

This folder contains a static, deployable mini-site that:
- lists CMS platforms and their integration posture,
- highlights Silktide support status and edit-link strategy,
- surfaces editor context and integration notes for each CMS,
- lets you copy a summary or the raw JSON for any entry.

## What’s inside

- `index.html` + `app.js` + `styles.css` — the web UI
- `cms-data.json` — the CMS “database”

## How to run locally

Because the site fetches JSON + Markdown files, open it via a local server (not `file://`).

### Option A: Python
```bash
cd silktide-cms-integration-site
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option B: Node
```bash
npx serve .
```

## Editing the “database”

Update `cms-data.json`.
The UI is data-driven — no build step needed.
