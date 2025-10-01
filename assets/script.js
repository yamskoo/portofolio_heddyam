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
  
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
  
      const hash = a.getAttribute('href'); // ex: "#racines"
      if (!hash || hash === '#') return;
  
      const target = document.querySelector(hash);
      if (!target) return;
  
      e.preventDefault();
  
      // grâce à ton CSS: .about-section[id]{scroll-margin-top: calc(var(--nav-h) + 12px);}
      // l'offset du header sticky est déjà géré
      target.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest'
      });
  
      // met à jour l’URL proprement
      if (history.pushState) history.pushState(null, '', hash);
  
      // ferme le menu mobile si ouvert
      const menu = document.getElementById('main-menu');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        const btn = document.querySelector('.hamburger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
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
