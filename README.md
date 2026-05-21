# dd-web

A Scramjet-based web proxy frontend that can be deployed on static hosting so many users can access it from a public domain.

## Local development

```bash
node server.js
```

Open `http://localhost:8080`.

## One-click-ish deployment options

### Option A: Vercel (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**.
4. Build command: _(leave empty)_
5. Output directory: `public`
6. Deploy.

This repo includes `vercel.json`, so deep links are rewritten to `index.html` and Scramjet routes stay usable.

### Option B: Netlify

1. Push this repo to GitHub.
2. Go to Netlify → **Add new site** → **Import from Git**.
3. Build command: _(empty)_
4. Publish directory: `public`
5. Deploy.

This repo includes `netlify.toml` with SPA-style redirects.

## Connect a custom domain

After deployment (Vercel or Netlify):

1. Open project/site settings → **Domains**.
2. Add your domain (for example `proxy.yourdomain.com`).
3. Copy provider DNS records (usually a CNAME for subdomains).
4. Add records at your DNS host (Cloudflare/Namecheap/etc.).
5. Wait for SSL provisioning and DNS propagation.

## Important production note

This starter currently loads Scramjet and bare-mux from jsDelivr for bootstrap convenience.
For production traffic, self-host Scramjet + transport assets and configure your preferred transport backend.


## Stability note

To avoid deployment failures when external CDN worker imports are blocked, `public/sw.js` is intentionally a minimal passthrough service worker. Scramjet is initialized from the page script with guarded error handling.
