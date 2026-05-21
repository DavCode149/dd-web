# dd-web

A starter web-based proxy shell that uses the Scramjet runtime from MercuryWorkshop.

## Run locally

```bash
node server.js
```

Then open `http://localhost:8080`.

## What this starter includes

- Browser-like landing page with URL bar
- Scramjet controller bootstrapping on the client
- Scramjet service worker (`public/sw.js`) using the official fetch interception pattern

## Important production note

This starter loads Scramjet and bare-mux from jsDelivr for convenience. For real deployments,
serve Scramjet and your transport locally, and configure `BareMuxConnection` + transport setup
based on the Scramjet docs.
