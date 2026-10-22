// ── VERSIE-AANDUIDING IN DE HEADER ────────────────────────────────────────────
// Toont links van de naam-dropdown wanneer de geladen versie van de site gepubliceerd is.
// GitHub Pages geeft bij elke publicatie alle bestanden hetzelfde Last-Modified tijdstip,
// dus dat tijdstip ís de versie: geen nummer dat iemand moet bijhouden.
// Staat er online een nieuwere versie, dan wordt het oranje en herlaadt een klik de pagina.
(function () {
  const geladen = new Date(document.lastModified);
  const fmt = d => d.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

  function plaats() {
    const navWrap = document.querySelector('#header-top .nav-wrap');
    if (!navWrap || document.getElementById('site-versie')) return null;
    const el = document.createElement('span');
    el.id = 'site-versie';
    el.style.cssText = 'font-size:11px;color:#6b7280;white-space:nowrap;cursor:default;font-variant-numeric:tabular-nums';
    navWrap.parentNode.insertBefore(el, navWrap);
    return el;
  }

  function toon(el, nieuwer) {
    if (nieuwer) {
      el.textContent = '↻ Nieuwe versie';
      el.title = 'Er staat een nieuwere versie online (' + fmt(nieuwer) + '). Klik om te herladen.';
      el.style.color = '#f59e0b';
      el.style.fontWeight = '700';
      el.style.cursor = 'pointer';
      el.onclick = () => location.reload();
    } else {
      el.textContent = 'v ' + fmt(geladen);
      el.title = 'Versie van de site: gepubliceerd op ' + geladen.toLocaleString('nl-BE') + '. Up-to-date.';
    }
  }

  async function controleer(el) {
    try {
      const res = await fetch(location.pathname, { method: 'HEAD', cache: 'no-store' });
      const lm = res.headers.get('Last-Modified');
      const online = lm ? new Date(lm) : null;
      toon(el, online && online - geladen > 2000 ? online : null);
    } catch (e) { /* offline: gewoon de geladen versie blijven tonen */ }
  }

  function start() {
    const el = plaats();
    if (!el) return;
    toon(el, null);
    controleer(el);
    setInterval(() => controleer(el), 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) controleer(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
