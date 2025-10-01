/* ===============================
   Yamine Portfolio — script.js
   =============================== */

  // Reveal on scroll (Intersection Observer)
  (function(){
    const els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window) || !els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.12});
    els.forEach(el=>io.observe(el));
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
  })();
  
  // Smooth scroll ultra fluide avec easing + durée selon la distance
  (function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.nav');
    const getOffset = () => (header ? header.getBoundingClientRect().height : 0) + 12;
  
    // easeInOutCubic
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  
    const animateScroll = (to, duration = 500) => {
      const start = window.pageYOffset;
      const diff = to - start;
      if (diff === 0) return;
  
      let startTime = null;
      const step = (ts) => {
        if (!startTime) startTime = ts;
        const t = Math.min(1, (ts - startTime) / duration);
        window.scrollTo(0, start + diff * ease(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
  
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
  
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
  
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
  
      e.preventDefault();
  
      const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
  
      if (prefersReduced) {
        window.scrollTo(0, y);
      } else {
        // durée proportionnelle à la distance, bornée
        const dist = Math.abs(y - window.pageYOffset);
        const dur = Math.max(280, Math.min(900, dist * 0.6));
        animateScroll(y, dur);
      }
  
      // met à jour l'URL sans re-saut
      if (history.pushState) history.pushState(null, '', hash);
  
      // ferme le menu mobile si besoin
      const menu = document.getElementById('main-menu');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        const btn = document.querySelector('.hamburger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
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

  
  
  
  
  