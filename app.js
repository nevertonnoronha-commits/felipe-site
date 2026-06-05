/* ============================================================
   UPTEC ELEVADORES — App JS
   SPA routing, GSAP animations, Lenis scroll, accessibility
   ============================================================ */

(function () {
  'use strict';

  // Add GSAP class to body to signal active GSAP transitions
  document.body.classList.add('gsap-enabled');

  // ---- LENIS SMOOTH SCROLL ----
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } catch (err) {
    console.error("Lenis failed to initialize:", err);
  }

  // ---- SPA ROUTING WITH GSAP TRANSITIONS ----
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');
  let isTransitioning = false;

  function showPage(pageId) {
    if (isTransitioning) return;

    const target = document.getElementById('page-' + pageId);
    if (!target) return;

    const currentPage = Array.from(pages).find(p => p.classList.contains('active'));

    if (currentPage && currentPage !== target) {
      isTransitioning = true;
      // Fade out current page
      gsap.to(currentPage, {
        opacity: 0,
        y: -15,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          currentPage.classList.remove('active');
          currentPage.style.display = 'none';

          // Switch active class on pages
          target.style.display = 'block';
          target.classList.add('active');

          // Scroll to top
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }

          // Update navigation links active class
          navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.page === pageId);
          });

          // Animate in new page
          gsap.fromTo(target,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
              onComplete: () => {
                isTransitioning = false;
                initGSAPAnimationsForPage(pageId);
              }
            }
          );
        }
      });
    } else {
      // First load page setup
      pages.forEach(p => {
        if (p !== target) {
          p.classList.remove('active');
          p.style.display = 'none';
        }
      });
      target.style.display = 'block';
      target.classList.add('active');

      navLinks.forEach(l => {
        l.classList.toggle('active', l.dataset.page === pageId);
      });

      // Animate on load
      gsap.fromTo(target,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => {
            initGSAPAnimationsForPage(pageId);
          }
        }
      );
    }

    // Update URL hash for back/forward support
    if (window.location.hash.slice(1) !== pageId) {
      history.pushState({ page: pageId }, '', '#' + pageId);
    }

    // Close mobile drawer
    closeMobileMenu();
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

  // ---- GSAP & SCROLLTRIGGER ANIMATIONS SYSTEM ----
  function initGSAPAnimationsForPage(pageId) {
    // Clean up existing triggers
    ScrollTrigger.getAll().forEach(t => t.kill());

    const pageContainer = document.getElementById('page-' + pageId);
    if (!pageContainer) return;

    // 1. General Reveal on scroll
    const reveals = pageContainer.querySelectorAll('.reveal');
    reveals.forEach(el => {
      // Setup initial styles
      gsap.set(el, { opacity: 0, y: 35 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform' // Avoid conflicts with hover transforms
          });
        },
        once: true
      });
    });

    // 2. Specific Page Tweens
    if (pageId === 'home') {
      // Hero staggered entrance
      const hero = pageContainer.querySelector('.hero');
      if (hero) {
        const eyebrow = hero.querySelector('.hero-eyebrow');
        const title = hero.querySelector('.hero-title');
        const desc = hero.querySelector('.hero-desc');
        const actions = hero.querySelectorAll('.hero-actions .btn');

        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
        if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: -25 }, { opacity: 1, y: 0 }, 0.15);
        if (title) tl.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=0.6');
        if (desc) tl.fromTo(desc, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.6');
        if (actions.length) tl.fromTo(actions, { opacity: 0, scale: 0.95, y: 10 }, { opacity: 1, scale: 1, y: 0, stagger: 0.1 }, '-=0.55');
      }

      // Stats animated count-up with GSAP
      pageContainer.querySelectorAll('.stat-number').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const obj = { val: 0 };

        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 2.0,
              ease: 'power3.out',
              onUpdate: () => {
                el.textContent = Math.floor(obj.val) + suffix;
              },
              onComplete: () => {
                el.textContent = target + suffix;
              }
            });
          },
          once: true
        });
      });

      // Special cards stagger (Services Overview)
      const serviceCards = pageContainer.querySelectorAll('.card-service');
      if (serviceCards.length) {
        gsap.set(serviceCards, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: serviceCards[0],
          start: 'top 85%',
          onEnter: () => {
            gsap.to(serviceCards, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: 'power3.out',
              clearProps: 'transform'
            });
          },
          once: true
        });
      }
    } else if (pageId === 'servicos') {
      // Services Inner Hero Title Anim
      const srvHero = pageContainer.querySelector('div[style*="background:var(--brand)"]');
      if (srvHero) {
        const breadcrumb = srvHero.querySelector('.breadcrumb');
        const h1 = srvHero.querySelector('h1');
        const p = srvHero.querySelector('p');

        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
        if (breadcrumb) tl.fromTo(breadcrumb, { opacity: 0, y: -10 }, { opacity: 1, y: 0 }, 0.1);
        if (h1) tl.fromTo(h1, { opacity: 0, y: 25 }, { opacity: 1, y: 0 }, '-=0.6');
        if (p) tl.fromTo(p, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.6');
      }
    }

    // Refresh ScrollTrigger calculations
    ScrollTrigger.refresh();
  }

  // ---- MAGNETIC BUTTONS EFFECT ----
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          scale: 1.03,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'power3.out'
        });
      });
    });
  }

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
          // Fade out form and fade in success panel
          gsap.to(form, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              form.style.display = 'none';
              const success = form.parentNode.querySelector('.form-success');
              if (success) {
                success.classList.add('visible');
                gsap.fromTo(success,
                  { opacity: 0, y: 15 },
                  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                );
              }
            }
          });
        }, 800);
      }
    });

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
  initMagneticButtons();

})();
