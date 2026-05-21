function normalizeUrl(input) {
  if (!input) return null;
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

async function registerServiceWorkerSafely() {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js?v=2');
    await navigator.serviceWorker.ready;
    return Boolean(registration);
  } catch (error) {
    console.error('[dd-web] Service worker registration failed:', error);
    return false;
  }
}

async function boot() {
  const form = document.getElementById('proxy-form');
  const urlInput = document.getElementById('url');

  if (!form || !urlInput) return;

  await registerServiceWorkerSafely();

  let scramjet;
  try {
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
  } catch (error) {
    console.error('[dd-web] Scramjet controller init failed:', error);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const target = normalizeUrl(urlInput.value.trim());
    if (!target) return;

    if (!scramjet) {
      window.location.href = target;
      return;
    }

    try {
      const encoded = scramjet.encodeUrl(target);
      window.location.href = encoded;
    } catch (error) {
      console.error('[dd-web] Scramjet URL encode failed, falling back to direct nav:', error);
      window.location.href = target;
    }
  });
}

boot().catch((error) => {
  console.error('[dd-web] Boot failed:', error);
});
