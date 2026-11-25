(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#yr').textContent = new Date().getFullYear();

  /* Navegación */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });
  burger.onclick = () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  $$('a', menu).forEach(a => a.onclick = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  const links = $$('a', menu);
  $$('main > section[id]').forEach(s => new IntersectionObserver(es => es.forEach(e => e.isIntersecting &&
    links.forEach(l => l.classList.toggle('act', l.getAttribute('href') === '#' + s.id))), { rootMargin: '-45% 0px -50%' }).observe(s));

  /* Reveal al hacer scroll (por posición: fiable con cualquier efecto) */
  let pend = $$('.reveal'), tick = false;
  const reveal = () => { tick = false; pend = pend.filter(el => { const r = el.getBoundingClientRect();
    if (r.top < innerHeight * .92 && r.bottom > 0) { el.classList.add('in'); return false; } return true; }); };
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(reveal); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); addEventListener('load', req); reveal();

  /* Parallax del hero: ratón + scroll, suavizado */
  const hero = $('.hero'), layers = $$('[data-depth]', hero);
  let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0;
  if (!reduce) {
    hero.addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
    addEventListener('deviceorientation', e => { if (e.gamma != null) { tx = Math.max(-.5, Math.min(.5, e.gamma / 60)); ty = Math.max(-.5, Math.min(.5, (e.beta - 45) / 90)); } });
    addEventListener('scroll', () => sy = Math.min(scrollY, innerHeight), { passive: true });
    (function loop() {
      cx += (tx - cx) * .05; cy += (ty - cy) * .05;
      layers.forEach(l => { const d = +l.dataset.depth;
        l.style.transform = `translate3d(${-cx * d * 1.6}px,${-cy * d + sy * d * .012 * 4}px,0)`; });
      requestAnimationFrame(loop);
    })();
  }

  /* Partículas ambientales (motas de polvo / luz) */
  const cv = $('#particles'), ctx = cv.getContext('2d');
  let W, H, P = [];
  const size = () => { const r = devicePixelRatio > 1.5 ? 1.5 : 1; W = cv.width = hero.clientWidth * r; H = cv.height = hero.clientHeight * r;
    P = Array.from({ length: Math.round(W * H / 22000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4, s: Math.random() * .25 + .05, a: Math.random() * Math.PI * 2, o: Math.random() * .5 + .15 })); };
  size(); addEventListener('resize', size);
  let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(hero);
  (function draw(t = 0) {
    if (vis && !reduce) {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.x += p.s * 1.4 + Math.sin(t / 3000 + p.a) * .15; p.y -= p.s * .6;
        if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5;
        const tw = p.o * (.6 + .4 * Math.sin(t / 900 + p.a));
        ctx.beginPath(); ctx.fillStyle = `rgba(255,214,170,${tw})`; ctx.shadowColor = 'rgba(255,170,90,.8)'; ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      });
    }
    requestAnimationFrame(draw);
  })();

  /* ===== Cámara Nikon → portafolio ===== */
  const CATS = {
    producto: { t: ['Fotografía', 'Productos'], d: 'Resaltamos la esencia de tu marca con iluminación y composición para catálogos y publicidad.', items: [['jam', 'Fotografía de producto'], ['perfume', 'Marcas'], ['taza', 'Productos comerciales'], ['waffle', 'Fotografía gastronómica'], ['sundae', 'Fotografía gastronómica']] },
    eventos: { t: ['Fotografía', 'Eventos'], d: 'Capturamos la energía, emociones y momentos clave, festivales y celebraciones.', items: [['boda', 'Bodas'], ['quince', 'Celebraciones'], ['blanco', 'Retrato y celebración'], ['dueto', 'Festivales'], ['sudadera', 'Conciertos'], ['cantante', 'Conciertos'], ['cabalgata', 'Eventos empresariales']] },
    paisajes: { t: ['Fotografía', 'Paisajes'], d: 'Inmortalizamos la belleza del entorno natural con perspectivas únicas e iluminación perfecta.', items: [['atardecer', 'Atardecer en el mar'], ['lago', 'Paisajes urbanos'], ['calle', 'Naturaleza y calles'], ['valle', 'Exteriores']] }
  };
  const pf = $('#pf'), mas = $('#mas'), cam = $('#cam'), hot = $('#hot'), lb = $('#lb'), li = $('img', lb);
  let cat = 'producto', cur = 0, busy = false;
  const list = () => CATS[cat].items;

  cam.addEventListener('pointermove', e => {
    const r = cam.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    cam.style.setProperty('--mx', x * 100 + '%'); cam.style.setProperty('--my', y * 100 + '%');
    if (!reduce) cam.style.transform = `perspective(1100px) rotateX(${(.5 - y) * 14}deg) rotateY(${(x - .5) * 18}deg)`;
  });
  cam.addEventListener('pointerleave', () => cam.style.transform = '');

  function showCat(c) {
    cat = c; const d = CATS[c];
    $('#pfTitle').innerHTML = `${d.t[0]} <em>${d.t[1]}</em>`; $('#pfDesc').textContent = d.d;
    $$('#tabs button').forEach(b => { b.classList.toggle('on', b.dataset.c === c); b.setAttribute('aria-selected', b.dataset.c === c); });
    mas.innerHTML = d.items.map(([f, t], i) => `<button class="ph-item" style="--i:${i}" data-i="${i}" aria-label="Ampliar: ${t}"><img src="assets/img/g-${f}.webp" alt="${t}" decoding="async"><span>${t}</span></button>`).join('');
  }
  function openPf() {
    showCat('producto'); pf.hidden = false; document.body.style.overflow = 'hidden'; pf.scrollTop = 0;
    if (!reduce) pf.animate([{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.2,.7,.2,1)' });
    $('#pfBack').focus({ preventScroll: true });
  }
  function closePf() {
    const done = a => { pf.hidden = true; a && a.cancel(); document.body.style.overflow = ''; hot.focus({ preventScroll: true }); };
    if (reduce) return done();
    const a = pf.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.97)' }], { duration: 500, fill: 'forwards' }); a.onfinish = () => done(a);
  }
  function enter() {            // zoom al interior del lente y apertura del portafolio
    if (busy || !pf.hidden) return;
    if (reduce) return openPf();
    busy = true;
    const r = hot.getBoundingClientRect(), s = r.width, k = Math.hypot(innerWidth, innerHeight) / s * 1.3;
    const dim = document.createElement('div'); dim.className = 'zoomdim';
    const z = document.createElement('img'); z.className = 'zoomlens'; z.src = 'assets/img/lens-zoom.webp'; z.alt = '';
    Object.assign(z.style, { left: r.left + r.width / 2 - s / 2 + 'px', top: r.top + r.height / 2 - s / 2 + 'px', width: s + 'px', height: s + 'px' });
    document.body.append(dim, z);
    dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
    z.animate([{ transform: 'scale(1)' }, { transform: `scale(${k})` }], { duration: 1300, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = () => {
      openPf(); setTimeout(() => { dim.remove(); z.remove(); busy = false; }, 850);
    };
  }
  cam.addEventListener('click', enter); hot.addEventListener('click', e => { e.stopPropagation(); enter(); });
  $('#pfBack').onclick = closePf;
  $('#tabs').onclick = e => { const b = e.target.closest('button'); if (b) showCat(b.dataset.c); };
  mas.onclick = e => { const b = e.target.closest('.ph-item'); if (b) openLb(+b.dataset.i); };

  /* Visor (lightbox): flechas, ESC, swipe y zoom */
  function openLb(i) { const n = list().length; cur = (i + n) % n; li.classList.remove('big'); li.src = `assets/img/g-${list()[cur][0]}.webp`; li.alt = list()[cur][1]; lb.hidden = false; }
  const closeLb = () => { lb.hidden = true; li.classList.remove('big'); };
  $('.x', lb).onclick = closeLb; $('.pv', lb).onclick = () => openLb(cur - 1); $('.nx', lb).onclick = () => openLb(cur + 1);
  lb.onclick = e => e.target === lb && closeLb(); li.onclick = e => { e.stopPropagation(); li.classList.toggle('big'); };
  addEventListener('keydown', e => {
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') openLb(cur - 1); if (e.key === 'ArrowRight') openLb(cur + 1); }
    else if (!pf.hidden && e.key === 'Escape') closePf();
  });
  let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) openLb(cur + (dx < 0 ? 1 : -1)); });

  /* Carrusel de testimonios (manual + automático) */
  const cards = $$('.t-card'), dots = $$('.car-ctl .dot'), car = $('#car'); let ti = 0, hold = false;
  function lay() {
    cards.forEach((c, k) => { let o = (k - ti + cards.length) % cards.length; if (o > cards.length / 2) o -= cards.length;
      c.style.transform = `translateX(${o * 58}%) scale(${o ? 0.8 : 1}) rotateY(${-o * 18}deg)`; c.style.opacity = o ? 0.35 : 1; c.style.filter = o ? 'blur(2px)' : 'none';
      c.style.zIndex = 5 - Math.abs(o); c.setAttribute('aria-hidden', o !== 0); });
    dots.forEach((d, k) => d.classList.toggle('on', k === ti));
  }
  const goT = n => { ti = (n + cards.length) % cards.length; lay(); };
  lay(); $('#tPrev').onclick = () => goT(ti - 1); $('#tNext').onclick = () => goT(ti + 1);
  dots.forEach((d, k) => d.onclick = () => goT(k)); cards.forEach((c, k) => c.onclick = () => goT(k));
  car.addEventListener('keydown', e => { if (e.key === 'ArrowRight') goT(ti + 1); if (e.key === 'ArrowLeft') goT(ti - 1); });
  ['mouseenter', 'focusin'].forEach(v => car.addEventListener(v, () => hold = true)); ['mouseleave', 'focusout'].forEach(v => car.addEventListener(v, () => hold = false));
  setInterval(() => { if (!hold && !document.hidden) goT(ti + 1); }, 6000);

  /* Formulario de contacto: compone el mensaje y abre WhatsApp o el correo */
  const msgEl = $('#cmsg');
  const data = () => ({ n: $('#fn').value.trim(), e: $('#fe').value.trim(), s: $('#fs').value, m: $('#fm').value.trim() });
  const text = d => `Hola Jotha, soy ${d.n}. Me interesa: ${d.s}.\n${d.m}\nMi correo: ${d.e}`;
  const ok = d => { const v = d.n.length > 1 && /^\S+@\S+\.\S+$/.test(d.e); msgEl.className = 'cmsg'; if (!v) msgEl.textContent = 'Escribe tu nombre y un correo válido.'; return v; };
  $('#cform').onsubmit = e => { e.preventDefault(); const d = data(); if (!ok(d)) return;
    open(`https://wa.me/573160561257?text=${encodeURIComponent(text(d))}`, '_blank', 'noopener'); msgEl.className = 'cmsg ok'; msgEl.textContent = '¡Listo! Se abrió WhatsApp con tu mensaje; solo falta enviarlo.'; };
  $('#fmail').onclick = () => { const d = data(); if (!ok(d)) return;
    location.href = `mailto:jotaph218@gmail.com?subject=${encodeURIComponent('Solicitud de cotización – ' + d.s)}&body=${encodeURIComponent(text(d))}`; msgEl.className = 'cmsg ok'; msgEl.textContent = 'Se abrió tu correo con el mensaje listo.'; };
})();
