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
  
  // Smooth scroll for internal anchors
  (function(){
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const el = document.querySelector(a.getAttribute('href'));
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
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
    let last = g.scrollLeft;
    g.addEventListener('scroll', () => {
      if (!hint) return;
      const moved = Math.abs(g.scrollLeft - last);
      last = g.scrollLeft;
      if (moved >= 20) hint.style.display = 'none';
    }, {passive:true});
  })();
  // ---- Autoplay horizontal pour la galerie (pause on user interaction) ----
  (function autoplayGallery(){
    const g = document.querySelector('.about-gallery');
    if (!g) return;
  
    // Respecte les préférences d’accessibilité
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
  
    // ⚙️ Réglages
    const PX_PER_MS   = 0.12;   // vitesse (px par milliseconde)  -> ex: 0.12 = ~120px/s
    const RESUME_MS   = 2500;   // délai avant reprise après interaction
    const CLONE_COUNT = 2;      // nb d’items clonés en fin pour boucle fluide
  
    // Clone les premiers éléments pour une boucle sans “saut”
    const originalWidthBefore = g.scrollWidth;
    const children = Array.from(g.children);
    const toClone  = children.slice(0, Math.min(CLONE_COUNT, children.length));
    toClone.forEach(n => g.appendChild(n.cloneNode(true)));
  
    let raf = null, lastTs = 0, isAuto = true, resumeTimer = null;
  
    function maxLoopThreshold(){ 
      // Quand on dépasse la largeur initiale, on recule d’un tour
      return originalWidthBefore;
    }
  
    function tick(ts){
      if (!isAuto) { raf = null; return; }
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs; lastTs = ts;
  
      g.scrollLeft += PX_PER_MS * dt;
  
      // Boucle fluide
      if (g.scrollLeft >= maxLoopThreshold() - 1) {
        g.scrollLeft -= maxLoopThreshold();
      }
      raf = requestAnimationFrame(tick);
    }
  
    function start(){
      if (raf || !isAuto) return;
      lastTs = 0;
      raf = requestAnimationFrame(tick);
    }
  
    function stop(){
      isAuto = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
  
    function pauseAndMaybeResume(){
      // Pause immédiate et planifie la reprise après inactivité
      isAuto = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { isAuto = true; start(); }, RESUME_MS);
    }
  
    // Événements qui interrompent l’autoplay
    const pauseEventsTargeted = ['pointerdown','touchstart','wheel','keydown','pointermove','touchmove'];
    pauseEventsTargeted.forEach(ev => g.addEventListener(ev, pauseAndMaybeResume, {passive:true}));
  
    // Les flèches manuelles mettent aussi en pause
    document.querySelectorAll('.g-nav').forEach(btn => {
      btn.addEventListener('click', pauseAndMaybeResume);
    });
  
    // Visibilité onglet
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else { isAuto = true; start(); }
    });
  
    // Démarre
    start();
  })();
  
  
  