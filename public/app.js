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

  // Set up bare-mux transport using the epoxy client loaded from /epoxy.js
  // EpoxyTransport is the global set by epoxy's UMD bundle
  try {
    const conn = new BareMux.BareMuxConnection("/bare-mux/worker.js");
    const EpoxyClient = EpoxyTransport.EpoxyClient;
    await conn.setRemoteTransport(
      new EpoxyClient({ wisp: "wss://wisp.mercurywork.shop/" }),
      "wss://wisp.mercurywork.shop/"
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