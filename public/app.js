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
      console.error("[dd-web] Service worker registration failed:", err);
    }
  }

  // Init Scramjet controller
  let scramjet = null;
  try {
    const { ScramjetController } = $scramjetLoadController();
    scramjet = new ScramjetController({
      prefix: "/scramjet/",
      files: {
        wasm: "/scramjet/scramjet.wasm.wasm",
        all:  "/scramjet/scramjet.all.js",
        sync: "/scramjet/scramjet.sync.js",
      },
      flags: {
        captureErrors: true,
        strictRewrites: true,
      },
    });
    await scramjet.init();
  } catch (err) {
    console.error("[dd-web] Scramjet init failed:", err);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = normalizeUrl(urlInput.value.trim());
    if (!target) return;

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