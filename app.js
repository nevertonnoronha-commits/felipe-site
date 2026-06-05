/* ============================================================
   UPTEC ELEVADORES — App JS
   SPA routing, interactions, accessibility
   ============================================================ */

(function () {
  'use strict';

  // ---- SPA ROUTING ----
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');

  function showPage(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    navLinks.forEach(l => {
      if (l.dataset.page === pageId) l.classList.add('active');
    });

    // Update URL hash for back/forward support
    history.pushState({ page: pageId }, '', '#' + pageId);

    // Close mobile drawer
    closeMobileMenu();

    // Re-run reveal observer
    setTimeout(observeReveal, 50);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) showPage(page);
    });
  });

  // Handle hash on load
  function initRoute() {
    const hash = window.location.hash.slice(1);
    const validPages = ['home', 'servicos', 'licitacoes', 'condominios', 'blog', 'contato'];
    if (hash && validPages.includes(hash)) {
      showPage(hash);
    } else {
      showPage('home');
    }
  }

  window.addEventListener('popstate', e => {
    if (e.state && e.state.page) showPage(e.state.page);
  });

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  const scrollHandler = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });

  // ---- MOBILE MENU ----
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('nav-drawer');

  function closeMobileMenu() {
    if (!hamburger || !drawer) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // ---- ACCORDION (FAQ) ----
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const body = document.getElementById(trigger.getAttribute('aria-controls'));

      // Close all others in same accordion
      const accordion = trigger.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-trigger').forEach(t => {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            const b = document.getElementById(t.getAttribute('aria-controls'));
            if (b) b.classList.remove('open');
          }
        });
      }

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) body.classList.toggle('open', !expanded);
    });
  });

  // ---- COUNT-UP ----
  function countUp(el) {
    const target = parseFloat(el.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 1600;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + (el.dataset.suffix || '');
    };
    requestAnimationFrame(update);
  }

  // ---- INTERSECTION OBSERVER (reveal + count-up) ----
  let revealObserver, countObserver;

  function observeReveal() {
    const revealEls = document.querySelectorAll('.reveal:not(.in-view)');
    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // Count-up
    document.querySelectorAll('[data-target]:not(.counted)').forEach(el => {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.classList.add('counted');
          countUp(el);
          observer.unobserve(el);
        }
      }, { threshold: 0.5 });
      observer.observe(el);
    });
  }

  // ---- FORM VALIDATION ----
  document.querySelectorAll('.uptec-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
        if (!field.value.trim()) {
          field.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
          valid = false;
        } else {
          field.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      if (valid) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
        }
        setTimeout(() => {
          form.style.display = 'none';
          const success = form.parentNode.querySelector('.form-success');
          if (success) success.classList.add('visible');
        }, 800);
      }
    });

    // Clear errors on input
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
        if (errorEl) errorEl.classList.remove('visible');
      });
    });
  });

  // ---- INIT ----
  initRoute();
  setTimeout(observeReveal, 100);

})();
