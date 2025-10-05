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

  // Expose la hauteur de la barre catégories via --cat-h (utile pour .uni-head sticky)
  (function(){
    const bar = document.querySelector('.category-nav');
    if(!bar) return;
    const set = () => {
      const h = bar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--cat-h', h + 'px');
    };
    set();
    window.addEventListener('resize', set, {passive:true});
    window.addEventListener('orientationchange', set, {passive:true});
    window.addEventListener('pageshow', set, {passive:true});
    window.addEventListener('load', set, {passive:true});
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

  // Année du footer (sécurité si ton global ne l'a pas déjà fait)
  (function(){
    var y = document.getElementById('y');
    if (y) y.textContent = new Date().getFullYear();
  })();

  /**
   * MODE FILTRAGE :
   * - Une seule section visible (is-active) à la fois
   * - Par défaut on montre #robafis (ou le hash si présent)
   * - Les chips ne scrollent plus vers une ancre : elles filtrent l'affichage
   * - Le menu catégories se cache quand on descend, réapparaît quand on remonte
   */

  (function(){
    const chips = Array.from(document.querySelectorAll('.category-nav a.chip'));
    const catNav = document.querySelector('.category-nav');
    const allSections = Array.from(document.querySelectorAll('.uni-section'));
    if (!chips.length || !catNav || !allSections.length) return;

    // Map id -> section
    const sectionsById = new Map(allSections.map(s => [s.id, s]));

    // Utilitaires
    const setActiveChip = (hash) => {
      chips.forEach(c => c.classList.toggle('is-active', c.getAttribute('href') === hash));
    };

    const showOnly = (id, pushHash=true) => {
      allSections.forEach(s => s.classList.toggle('is-active', s.id === id));
      setActiveChip('#' + id);
      if (pushHash) {
        // On met à jour l'URL sans recharger
        if (history.replaceState) history.replaceState(null, '', '#' + id);
        else location.hash = id;
      }
      // On remonte en haut de page pour bien voir le header + début de la section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Initial : hash prioritaire, sinon robafis
    const initialId = (location.hash && sectionsById.has(location.hash.slice(1)))
      ? location.hash.slice(1)
      : 'robafis';
    showOnly(initialId, /*pushHash*/ false);

    // Click sur chips -> filtrage (pas d'ancre)
    chips.forEach(c => {
      c.addEventListener('click', (e) => {
        e.preventDefault();
        const id = (c.getAttribute('href') || '').replace('#', '');
        if (!sectionsById.has(id)) return;
        showOnly(id, /*pushHash*/ true);
      });
    });
  })();

  // Auto-hide du menu catégories (mobile-friendly)
  (function(){
    if (document.body.classList.contains('page-universitaire')) return;
    const catNav = document.querySelector('.category-nav');
    if (!catNav) return;

    // ✅ lire le scroll sur le vrai root (fiable iOS/Android)
    const root = document.scrollingElement || document.documentElement;
    const getY  = () => (root.scrollTop || window.scrollY || 0);

    let lastY  = getY();
    let baseY  = lastY;
    let hidden = false;

    // Seuils plus réactifs sur mobile
    const DOWN_HIDE_AFTER = 20;  // ne cache pas tant qu'on n'a pas dépassé 20px
    const DOWN_TRAVEL     = 40;  // distance à parcourir en descendant avant hide
    const UP_TRAVEL       = 25;  // distance à remonter avant show
    const DELTA_MIN       = 2;   // ignore micro-mouvements

    const show = () => { catNav.classList.remove('category-nav--hidden'); hidden = false; };
    const hide = () => { catNav.classList.add('category-nav--hidden');    hidden = true;  };

    const onScroll = () => {
      const y  = getY();
      const dy = y - lastY;

      // Toujours visible près du haut de page
      if (y < DOWN_HIDE_AFTER){
        show(); baseY = y; lastY = y; return;
      }

      // Descente franche -> hide
      if (dy > DELTA_MIN && !hidden){
        if (y - baseY > DOWN_TRAVEL){
          hide(); baseY = y;
        }
      }

      // Remontée franche -> show
      if (dy < -DELTA_MIN && hidden){
        if (baseY - y > UP_TRAVEL){
          show(); baseY = y;
        }
      }

      lastY = y;
    };

    // RAF + passive pour perf
    let ticking = false;
    const handler = () => {
      if (!ticking){
        requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    };

    // 👇 attache sur window ET sur le root (certains mobiles ne déclenchent que l’un des deux)
    window.addEventListener('scroll', handler, { passive:true });
    root.addEventListener('scroll', handler, { passive:true });

    // Remet au propre sur resize/orientation
    ['resize','orientationchange','pageshow','visibilitychange'].forEach(ev=>{
      window.addEventListener(ev, () => {
        show(); baseY = getY(); lastY = baseY;
      }, { passive:true });
    });
  })();

  /* ===============================
   Landing (index) — page-only JS
   S'exécute uniquement si body.page-landing est présent
   =============================== */
  (function(){
    if (!document.body.classList.contains('page-landing')) return;

    // Petit feedback visuel au tap (optionnel, non intrusif)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.985)';
        setTimeout(() => { btn.style.transform = ''; }, 120);
      }, { passive: true });
    });
  })();

