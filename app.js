/* ============================================================
   UPTEC ELEVADORES — App JS
   SPA routing, GSAP transitions (graceful if GSAP fails to load),
   IntersectionObserver reveals, rAF counters, magnetic buttons,
   accordion, form -> WhatsApp. Respects prefers-reduced-motion.
   ============================================================ */

(function () {
  'use strict';

  var HAS_GSAP = typeof window.gsap !== 'undefined';
  if (HAS_GSAP && window.ScrollTrigger) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* noop */ }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- SPA ROUTING ----
  var pages = document.querySelectorAll('.page');
  var navLinks = document.querySelectorAll('[data-page]');
  var isTransitioning = false;

  function activate(target, pageId) {
    pages.forEach(function (p) {
      if (p !== target) { p.classList.remove('active'); p.style.display = 'none'; }
    });
    target.style.display = 'block';
    target.classList.add('active');
    navLinks.forEach(function (l) { l.classList.toggle('active', l.dataset.page === pageId); });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showPage(pageId) {
    if (isTransitioning) return;
    var target = document.getElementById('page-' + pageId);
    if (!target) return;
    var currentPage = Array.prototype.find.call(pages, function (p) { return p.classList.contains('active'); });

    if (HAS_GSAP && !reduceMotion && currentPage && currentPage !== target) {
      isTransitioning = true;
      gsap.to(currentPage, {
        opacity: 0, y: -10, duration: 0.2, ease: 'power2.in',
        onComplete: function () {
          activate(target, pageId);
          gsap.fromTo(target, { opacity: 0, y: 15 }, {
            opacity: 1, y: 0, duration: 0.3, ease: 'power2.out',
            onComplete: function () { isTransitioning = false; initPageAnimations(pageId); }
          });
        }
      });
    } else {
      activate(target, pageId);
      initPageAnimations(pageId);
    }

    if (window.location.hash.slice(1) !== pageId) {
      history.pushState({ page: pageId }, '', '#' + pageId);
    }
    closeMobileMenu();
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (link.dataset.page) showPage(link.dataset.page);
    });
  });

  function initRoute() {
    var hash = window.location.hash.slice(1);
    var valid = ['home', 'servicos', 'licitacoes', 'condominios', 'elevadores', 'contato'];
    showPage(hash && valid.indexOf(hash) !== -1 ? hash : 'home');
  }
  window.addEventListener('popstate', function (e) { if (e.state && e.state.page) showPage(e.state.page); });

  // ---- REVEAL ON SCROLL (no GSAP dependency) ----
  var revealObserver;
  function observeReveal(container) {
    var els = container.querySelectorAll('.reveal:not(.in-view)');
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.style.willChange = 'auto';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  // ---- COUNTERS (vanilla requestAnimationFrame) ----
  function animateCounters(container) {
    container.querySelectorAll('.stat-number').forEach(function (el) {
      if (el.dataset.counted) return;
      var target = parseFloat(el.dataset.target);
      var suffix = el.dataset.suffix || '';
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          el.dataset.counted = '1';
          obs.disconnect();
          if (reduceMotion) { el.textContent = target + suffix; return; }
          var dur = 1500, start = performance.now();
          (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
          })(start);
        }
      }, { threshold: 0.3 });
      obs.observe(el);
    });
  }

  // ---- PER-PAGE ENTRANCE ANIMATIONS ----
  function initPageAnimations(pageId) {
    var container = document.getElementById('page-' + pageId);
    if (!container) return;
    observeReveal(container);
    animateCounters(container);
    window.dispatchEvent(new CustomEvent('uptec:pageshow', { detail: { pageId: pageId } }));

    if (pageId === 'home' && HAS_GSAP && !reduceMotion) {
      var hero = container.querySelector('.hero');
      if (!hero) return;
      var lines = hero.querySelectorAll('.hero-title .line');
      var eyebrow = hero.querySelector('.hero-eyebrow');
      var desc = hero.querySelector('.hero-desc');
      var actions = hero.querySelectorAll('.hero-actions .btn');

      if (eyebrow) gsap.from(eyebrow, { opacity: 0, y: -12, duration: 0.5, ease: 'power2.out' });
      if (lines.length) gsap.from(lines, { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.08 });
      if (desc) gsap.from(desc, { opacity: 0, y: 14, duration: 0.5, delay: 0.4, ease: 'power2.out' });
      if (actions.length) gsap.from(actions, { opacity: 0, y: 10, duration: 0.5, delay: 0.55, stagger: 0.08, ease: 'power2.out' });

      // Subtle parallax on the hero blueprint as you scroll away
      if (window.ScrollTrigger) {
        gsap.to(hero, {
          backgroundPositionY: '40px', ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }
  }

  // ---- NAVBAR SCROLL STATE ----
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ---- MOBILE MENU ----
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('nav-drawer');

  function closeMobileMenu() {
    if (!hamburger || !drawer) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // ---- ACCORDION (FAQ) ----
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var body = document.getElementById(trigger.getAttribute('aria-controls'));
      var accordion = trigger.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-trigger').forEach(function (t) {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            var b = document.getElementById(t.getAttribute('aria-controls'));
            if (b) b.classList.remove('open');
          }
        });
      }
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) body.classList.toggle('open', !expanded);
    });
  });

  // ---- MAGNETIC BUTTONS (desktop pointer only) ----
  if (HAS_GSAP && !reduceMotion && canHover) {
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ---- CONTACT FORM -> WHATSAPP ----
  document.querySelectorAll('.uptec-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
        if (!field.value.trim()) {
          field.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
          valid = false;
        } else {
          field.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });
      if (!valid) return;

      var val = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var lines = ['Olá, UPTEC! Pedido de contato pelo site.', ''];
      lines.push('Nome: ' + val('cf-name'));
      lines.push('Telefone: ' + val('cf-phone'));
      if (val('cf-email')) lines.push('E-mail: ' + val('cf-email'));
      if (val('cf-service')) lines.push('Serviço: ' + val('cf-service'));
      if (val('cf-segment')) lines.push('Segmento: ' + val('cf-segment'));
      if (val('cf-message')) lines.push('Mensagem: ' + val('cf-message'));

      var url = 'https://wa.me/5571996526835?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener,noreferrer');

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Abrindo WhatsApp...'; }

      var showSuccess = function () {
        form.style.display = 'none';
        var success = form.parentNode.querySelector('.form-success');
        if (success) {
          success.classList.add('visible');
          if (HAS_GSAP && !reduceMotion) {
            gsap.fromTo(success, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
          }
        }
      };
      // Give the WhatsApp tab a moment to open before swapping in the confirmation
      setTimeout(function () {
        if (HAS_GSAP && !reduceMotion) {
          gsap.to(form, { opacity: 0, duration: 0.25, onComplete: showSuccess });
        } else {
          showSuccess();
        }
      }, 600);
    });

    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
        var errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
        if (errorEl) errorEl.classList.remove('visible');
      });
    });
  });

  // ---- INIT ----
  initRoute();

})();
