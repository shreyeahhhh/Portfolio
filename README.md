# Shreya Merin Mathew — Portfolio

**Live:** [portfolio-g9av.onrender.com](https://portfolio-g9av.onrender.com)

## Structure

```
index.html          markup for every section
css/style.css        theme tokens, claymorphism, layout, animation
js/script.js          cursor, reveal-on-scroll, counters, theme toggle, etc.
assets/               favicon, résumé PDF
server.js             tiny zero-dependency static server (local preview / optional host)
```

## Run locally

No install needed.

```bash
node server.js
```

Then open http://localhost:3000. (Opening `index.html` directly also works —
everything is relative paths and vanilla JS.)

## Deploy on Render

This is a fully static site, so the simplest option is a Render **Static Site**:

1. New → Static Site → connect this repo.
2. Build command: leave empty.
3. Publish directory: `.`
4. Deploy.

`render.yaml` in this repo configures exactly that automatically if you
deploy via a Render Blueprint instead of the manual dashboard flow.

Prefer a Web Service instead? `server.js` + `package.json` already respect
Render's `PORT` env var, so `npm start` works as the start command too.

## Editing content

Everything — copy, project cards, stats, links — lives directly in
`index.html`. There's no CMS or data file; it's a personal site, kept simple
on purpose.
