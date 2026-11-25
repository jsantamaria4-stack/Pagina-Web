/* Efectos de interacción: visor de cámara, progreso, parallax de marcas, tilt 3D, botones magnéticos */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prog = $('#prog'), marks = $$('[data-n]');
  const onScroll = () => {
    prog.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight || 1)})`;
    if (!reduce) marks.forEach(s => { const r = s.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) s.style.setProperty('--py', (-r.top * .16).toFixed(1) + 'px'); });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Tilt 3D y botones magnéticos */
  if (fine && !reduce) {
    $$('.card,.testi figure').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .15s'; el.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`; });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .6s'; el.style.transform = ''; });
    });
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* Contador */
  $$('.count').forEach(c => new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect();
    const to = +c.dataset.to; let n = 0; const id = setInterval(() => { c.textContent = ++n; if (n >= to) clearInterval(id); }, 220); c.textContent = 0; }).observe(c));
})();
