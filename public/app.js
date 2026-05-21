function normalizeUrl(input) {
  if (!input) return null;
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

async function boot() {
  const form = document.getElementById('proxy-form');
  const urlInput = document.getElementById('url');

  if (!form || !urlInput) return;

  let scramjet;
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.error('[dd-web] Service worker registration failed:', error);
    }
    await navigator.serviceWorker.register('/sw.js');
  }

  if (window.$scramjetLoadController) {
    const { ScramjetController } = window.$scramjetLoadController();
    scramjet = new ScramjetController({
      files: {
        wasm: 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.0.2-dev/scramjet.wasm.wasm',
        all: 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.0.2-dev/scramjet.all.js',
        sync: 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.0.2-dev/scramjet.sync.js',
      },
    });

    await scramjet.init();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = normalizeUrl(urlInput.value.trim());
    if (!target) return;

    if (!scramjet) {
      window.location.href = target;
      return;
    }

    const encoded = scramjet.encodeUrl(target);
    window.location.href = encoded;
  });
}

boot();
