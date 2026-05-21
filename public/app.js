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

  // Set up bare-mux transport using setManualTransport with a CDN import
  // This avoids needing to self-host the .mjs epoxy transport file
  try {
    const conn = new BareMux.BareMuxConnection("/bare-mux/worker.js");
    await conn.setManualTransport(
      `
        const { EpoxyClient } = await import("https://unpkg.com/@mercuryworkshop/epoxy-transport@3/dist/index.mjs");
        return [EpoxyClient, "https://unpkg.com/@mercuryworkshop/epoxy-transport@3/dist/index.mjs"];
      `,
      [{ wisp: "wss://wisp.mercurywork.shop/" }]
    );
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