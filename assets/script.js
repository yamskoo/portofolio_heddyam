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

  // ---- Autoplay horizontal pour la galerie (mobile-friendly) ----
  (function autoplayGallery(){
    const g = document.querySelector('.about-gallery');
    if (!g) return;
  
    // Respecte l’accessibilité
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
  
    // ⚙️ Réglages
    const PX_PER_TICK = 1.2;       // vitesse ~ px par tick
    const TICK_MS     = 16;        // ~60fps
    const RESUME_MS   = 2500;      // reprise après inactivité
    const CLONE_COUNT = 2;         // éléments clonés pour boucle lisse
  
    // Clone quelques items pour une boucle sans “saut”
    const originalWidthBefore = g.scrollWidth;
    Array.from(g.children).slice(0, Math.min(CLONE_COUNT, g.children.length))
      .forEach(n => g.appendChild(n.cloneNode(true)));
  
    let timer = null;
    let raf   = null;
    let isAuto = true;
    let interacting = false;   // 👈 ne pause que si vrai
    let resumeTimer = null;
  
    function loopStep(){
      if (!isAuto || interacting) return;
      g.scrollLeft += PX_PER_TICK;
  
      // Boucle fluide
      if (g.scrollLeft >= originalWidthBefore - 1) {
        g.scrollLeft -= originalWidthBefore;
      }
    }
  
    function start(){
      if (timer) return;
      // Intervalle “fiable” sur mobile
      timer = setInterval(()=>{
        // petit polissage via rAF quand dispo
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loopStep);
      }, TICK_MS);
    }
  
    function stop(){
      if (timer){ clearInterval(timer); timer = null; }
      if (raf){ cancelAnimationFrame(raf); raf = null; }
    }
  
    function pauseDuringInteraction(){
      interacting = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    }
    function maybeResumeAfter(){
      // relâchement → planifie reprise
      interacting = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(()=>{ isAuto = true; }, RESUME_MS);
    }
  
    // 🖐️ Interaction utilisateur — pause seulement quand DOIGT EN CONTACT
    g.addEventListener('pointerdown', pauseDuringInteraction, {passive:true});
    g.addEventListener('pointerup',   maybeResumeAfter,       {passive:true});
    g.addEventListener('pointercancel', maybeResumeAfter,     {passive:true});
    g.addEventListener('touchstart',  pauseDuringInteraction, {passive:true});
    g.addEventListener('touchend',    maybeResumeAfter,       {passive:true});
    g.addEventListener('wheel',       ()=>{ isAuto=false; maybeResumeAfter(); }, {passive:true});
  
    // Les flèches mettent aussi en pause et déclenchent la reprise différée
    document.querySelectorAll('.g-nav').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        isAuto = false;
        maybeResumeAfter();
      });
    });
  
    // Pause quand onglet caché
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden) stop(); else start();
    });
  
    // Pause quand la galerie n’est pas visible à l’écran (économie batterie)
    let onScreen = true;
    const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries)=>{
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else stop();
    }, {threshold: 0.1}) : null;
    if (io) io.observe(g);
  
    // Démarrage
    start();
  })();
  
  
  
  
  