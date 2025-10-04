/* ===============================
   Yamine Portfolio — script.js
   =============================== */

  // Reveal on scroll (Intersection Observer) — n'anime pas les sections cibles d'ancres
  (function(){
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
  
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
  
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          const tl = e.target.closest('.timeline--rail');
          if (tl) tl.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });
  
    els.forEach(el => {
      // Si l'élément a un id (cible d'ancre), on l'affiche directement -> pas de translateY qui “saute”
      if (el.id) {
        el.classList.add('in');
        return;
      }
      io.observe(el);
    });
  })();

  (function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.scrollingElement || document.documentElement;
    const header = document.querySelector('.nav');
  
    const getOffset = () =>
      (header ? header.getBoundingClientRect().height : 0) + 12;
  
    const getScrollTop = () =>
      root.scrollTop || document.body.scrollTop || 0;
  
    const setScrollTop = (y) => {
      root.scrollTop = y;            // standard
      document.body.scrollTop = y;   // fallback Safari/iOS
    };
  
    // easing douce
    const ease = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2);
  
    const animateTo = (toY, duration) => {
      const startY = getScrollTop();
      const diff = toY - startY;
      if (Math.abs(diff) < 1) return;
  
      document.documentElement.classList.add('is-scrolling');

      let start;
      const step = (ts) => {
        if (!start) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        setScrollTop(startY + diff * ease(t));
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          document.documentElement.classList.remove('is-scrolling');
        }
      };
      requestAnimationFrame(step);
    };
  
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
  
      const hash = a.getAttribute('href');   // ex: "#racines"
      if (!hash || hash === '#') return;
  
      const target = document.querySelector(hash);
      if (!target) return;
  
      e.preventDefault();
  
      // Ferme le menu mobile (important avant de mesurer l’offset)
      const menu = document.getElementById('main-menu');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        const btn = document.querySelector('.hamburger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
  
      // Désactive temporairement tout smooth CSS pour éviter les conflits
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
  
      const y = target.getBoundingClientRect().top + getScrollTop() - getOffset();
  
      if (prefersReduced) {
        setScrollTop(y);
      } else {
        const dist = Math.abs(y - getScrollTop());
        const dur = Math.max(300, Math.min(900, dist * 0.6));
        // Petit délai = fiabilise iOS juste après fermeture du menu
        setTimeout(() => animateTo(y, dur), 0);
      }
  
      if (history.pushState) history.pushState(null, '', hash);
  
      // Restaure le comportement CSS
      setTimeout(() => { html.style.scrollBehavior = prevBehavior || ''; }, 50);
    }, { passive: false });
  })();

  // Expose la hauteur réelle du header sticky à CSS via --nav-h
  (function(){
    const nav = document.querySelector('.nav');
    if(!nav) return;
    const set = () => {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    };
    set();
    window.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
    window.addEventListener('pageshow', set);
    window.addEventListener('visibilitychange', set);
    window.addEventListener('load', set);
  })();
   
  // Mobile menu toggle (hamburger)
  (function(){
    const btn = document.querySelector('.hamburger');
    const menu = document.getElementById('main-menu');
    if(!btn || !menu) return;
    btn.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  })();
  
  // Optional: highlight current nav link
  (function(){
    const path = location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.menu a[href]').forEach(a=>{
      const href = a.getAttribute('href');
      try{
        const url = new URL(href, location.origin);
        if(url.pathname.replace(/\/$/,'') === path){
          a.style.opacity = '1';
          a.style.fontWeight = '600';
        }
      }catch(e){}
    });
  })();

  // Parallax léger pour les éléments décoratifs / médias (data-speed)
  (function(){
    const els = document.querySelectorAll('.parallax');
    if(!els.length) return;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const onScroll = () => {
      if (document.documentElement.classList.contains('is-scrolling')) return;
      const y = window.scrollY || window.pageYOffset;
      els.forEach(el=>{
        const sp = parseFloat(el.dataset.speed || '0.1');
        const t = clamp(y * sp, -120, 120);
        el.style.transform = `translateY(${t}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  })();
  
  // Contrôles galerie (flèches + hint)
  (function(){
    const g = document.querySelector('.about-gallery');
    const left = document.querySelector('.g-nav.left');
    const right = document.querySelector('.g-nav.right');
    const hint = document.querySelector('.gallery-hint');
    if(!g || !left || !right) return;
  
    const step = () => {
      const card = g.querySelector('figure');
      return card ? (card.offsetWidth + 12) : (g.clientWidth * 0.9);
    };
  
    left.addEventListener('click', ()=> g.scrollBy({left: -step(), behavior:'smooth'}));
    right.addEventListener('click',()=> g.scrollBy({left:  step(), behavior:'smooth'}));
  
    const update = () => {
      left.disabled  = g.scrollLeft <= 2;
      right.disabled = g.scrollLeft + g.clientWidth >= g.scrollWidth - 2;
    };
    update();
    g.addEventListener('scroll', update, {passive:true});
  
    // Cache le hint uniquement après un VRAI scroll (≥ 20px)
    if (hint){
        let last = g.scrollLeft;
        g.addEventListener('scroll', () => {
          const moved = Math.abs(g.scrollLeft - last);
          last = g.scrollLeft;
          if (moved >= 20) hint.style.display = 'none';
        }, {passive:true});
      }
  })();

  // Stagger: affecte une variable CSS --i à chaque enfant d'une .entry pour l'animation en cascade
  (function(){
    const containers = document.querySelectorAll('.fx-stagger .entry');
    containers.forEach(entry=>{
      let i = 0;
      Array.from(entry.children).forEach(el=>{
        // On peut ignorer certains éléments si tu veux (ex: ignorer .when/.where)
        // if(el.classList.contains('when') || el.classList.contains('where')) return;
        el.style.setProperty('--i', i++);
      });
    });
  })();

