/* VELLORA cinematic reveal observer.
   Adds presentation-only classes; does not intercept navigation or app events. */
(() => {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const selector = [
    'body > .wrap > .top',
    'body > .wrap > header',
    '.wrap > header.hero',
    '.featured',
    '.bar',
    '.grid > .card',
    '.cont > .card',
    '.empty-state',
    '.admin-card > section',
    '.admin-card > form',
    '.admin-overview',
    '.submission-management',
    '.studio-heading',
    '.part-card',
    '.chapter-card',
    '.index-preview',
    '.upload-box',
    'body > .wrap > footer'
  ].join(',');

  const eligible = (el) => !el.closest('#landing, .reader, [data-reader], [hidden], [aria-hidden="true"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vm-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  const attach = (root = document) => {
    root.querySelectorAll(selector).forEach((el, index) => {
      if (!eligible(el) || el.classList.contains('vm-reveal')) return;
      el.classList.add('vm-reveal');
      if (index % 4 === 1) el.classList.add('vm-delay-1');
      else if (index % 4 === 2) el.classList.add('vm-delay-2');
      else if (index % 4 === 3) el.classList.add('vm-delay-3');
      observer.observe(el);
    });
  };

  document.body.classList.add('vm-motion-ready');
  attach();
  const mutations = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType !== 1 || !eligible(node)) return;
      if (node.matches && node.matches(selector)) attach(node.parentElement || document);
      else if (node.querySelectorAll) attach(node);
    }));
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', () => {
    mutations.disconnect();
    observer.disconnect();
  }, { once: true });
})();
