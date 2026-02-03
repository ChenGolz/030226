// Build: 2026-02-03-v24
// Shared layout injector (header + footer) for KBWG static pages
// Loads partials/header.html into #siteHeaderMount and partials/footer.html into #siteFooterMount
// IMPORTANT: Do NOT cache partials in sessionStorage; it causes stale menus/scripts after deploy.
(function () {
  const KBWG_LAYOUT_BUILD = '2026-02-03-v24';
  try { console.info('[KBWG] layout build', KBWG_LAYOUT_BUILD); } catch (e) {}

  const scriptEl = document.currentScript;
  const base = (scriptEl && scriptEl.dataset && scriptEl.dataset.base) ? scriptEl.dataset.base : '';

  const HEADER_URL = base + 'partials/header.html?v=' + encodeURIComponent(KBWG_LAYOUT_BUILD);
  const FOOTER_URL = base + 'partials/footer.html?v=' + encodeURIComponent(KBWG_LAYOUT_BUILD);

  function bust(url) {
    try {
      const u = String(url);
      const sep = u.indexOf('?') >= 0 ? '&' : '?';
      return u + sep + 't=' + Date.now();
    } catch (e) {
      return url;
    }
  }

  async function inject(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return false;

    try {
      const res = await fetch(bust(url), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      mount.innerHTML = html;
      return true;
    } catch (e) {
      try { console.warn('[KBWG] layout inject failed', mountSelector, e && e.message ? e.message : e); } catch(_){}
      return false;
    }
  }

  function fireReady() {
    try { window.dispatchEvent(new CustomEvent('kbwg:layout-ready')); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('kbwg:content-rendered')); } catch (e) {}
  }

  async function run() {
    await Promise.allSettled([
      inject(HEADER_URL, '#siteHeaderMount'),
      inject(FOOTER_URL, '#siteFooterMount')
    ]);
    fireReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
