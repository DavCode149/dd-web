function normalizeUrl(input) {
  if (!input) return null;
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

async function boot() {
  const form = document.getElementById("proxy-form");
  const urlInput = document.getElementById("url");
  if (!form || !urlInput) return;

  // Register service worker
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
    } catch (err) {
      console.error("[dd-web] SW registration failed:", err);
    }
  }

  // Configure bare-mux transport using the public Wisp server
  // (required for scramjet to actually proxy requests)
  try {
    const conn = new BareMux.BareMuxConnection("/bare-mux/worker.js");
    await conn.setTransport("/epoxy/index.mjs", [
      { wisp: "wss://wisp.mercurywork.shop/" }
    ]);
  } catch (err) {
    console.error("[dd-web] bare-mux transport setup failed:", err);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = normalizeUrl(urlInput.value.trim());
    if (!target) return;

    const scramjet = window.__scramjet;
    if (scramjet) {
      try {
        window.location.href = scramjet.encodeUrl(target);
        return;
      } catch (err) {
        console.error("[dd-web] encodeUrl failed, falling back:", err);
      }
    }
    window.location.href = target;
  });
}

boot().catch((err) => console.error("[dd-web] Boot failed:", err));