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
  