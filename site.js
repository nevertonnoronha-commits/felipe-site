/* ============================================================
   UPTEC ELEVADORES - site.js
   Multi-page SPA controller for the dark/light rebuild.
   - SPA routing (.page / [data-page] / hash) like the legacy app.js
   - IntersectionObserver reveals with a hard failsafe (content never
     stays hidden if observers/GSAP fail)
   - Count-up counters driven by IntersectionObserver (NOT GSAP-only)
   - Nav pill scroll-state, mobile drawer, magnetic buttons
   - Shared quote modal (opens from any [data-open-quote])
   - NO Lenis. Native scroll only. Respects prefers-reduced-motion.
   ============================================================ */

(function () {
  'use strict';

  /* ALWAYS-ON: client explicitly wants all animations regardless of OS setting.
     reduce is forced false so the animated path runs for everyone. The a11y
     media query is still respected in effects.js for the cursor ring (no harm). */
  var reduce = false; /* was: window.matchMedia('(prefers-reduced-motion: reduce)').matches */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = function () { return typeof window.gsap !== 'undefined'; };

  /* ============================================================
     FEATURE 1 - PAGE TRANSITION OVERLAY
     showOverlay(cb): fade-in, call cb(), fade-out.
     - On the very first page load (isFirstLoad=true) we skip it.
     - Respects prefers-reduced-motion: cb() fires instantly.
     ============================================================ */
  var ptOverlay = document.getElementById('page-transition');
  var ptBarFill = ptOverlay ? ptOverlay.querySelector('.pt-bar-fill') : null;
  var isFirstLoad = true;

  function showOverlay(callback) {
    /* First load: skip overlay entirely */
    if (isFirstLoad || !ptOverlay) {
      if (callback) callback();
      return;
    }
    /* prefers-reduced-motion: call cb immediately, no animation */
    if (reduce) {
      if (callback) callback();
      return;
    }

    /* Reset bar to 0 before showing */
    if (ptBarFill) ptBarFill.style.transition = 'none';
    if (ptBarFill) ptBarFill.style.width = '0%';

    /* Fade overlay in */
    ptOverlay.classList.add('is-entering');

    /* After one frame restore bar transition so CSS class kicks in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (ptBarFill) ptBarFill.style.transition = '';
        /* Let CSS drive bar width (is-entering triggers it) */
        /* Wait for fade-in (~350ms), call callback to switch page */
        setTimeout(function () {
          if (callback) callback();
          /* Small pause so new page content is ready (allow one paint) */
          requestAnimationFrame(function () {
            /* Fade overlay out */
            ptOverlay.classList.remove('is-entering');
          });
        }, 380);
      });
    });
  }

  var VALID_PAGES = ['home', 'servicos', 'licitacoes', 'condominios', 'elevadores', 'contato'];

  /* ============================================================
     REVEAL (IntersectionObserver + failsafe)
     Elements start at opacity 0 / translateY via .panel [data-reveal]
     in CSS; this adds .in-view to play the transition. A timed
     failsafe forces visibility if anything goes wrong.
     ============================================================ */
  var revealObserver = null;

  function revealNow(el) {
    el.classList.add('in-view');
  }

  /* rAF-throttled scroll+resize reveal: catches any element that enters
     the viewport and hasn't received .in-view yet. GUARANTEE: nothing
     stays at opacity:0 after being scrolled to. */
  var _revealScrollTicking = false;
  function _revealOnScroll() {
    if (_revealScrollTicking) return;
    _revealScrollTicking = true;
    requestAnimationFrame(function () {
      _revealScrollTicking = false;
      var active = Array.prototype.find
        ? Array.prototype.find.call(pages, function (p) { return p.classList.contains('is-active'); })
        : (function () { for (var i = 0; i < pages.length; i++) { if (pages[i].classList.contains('is-active')) return pages[i]; } }());
      if (active) _revealVisible(active);
    });
  }

  function _revealVisible(container) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    container.querySelectorAll('[data-reveal]:not(.in-view)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      /* Reveal if top edge is inside the viewport (entered the screen) */
      if (r.top < vh && r.bottom > 0) revealNow(el);
    });
  }

  window.addEventListener('scroll', _revealOnScroll, { passive: true });
  window.addEventListener('resize', _revealOnScroll, { passive: true });

  function observeReveals(container) {
    var els = container.querySelectorAll('[data-reveal]:not(.in-view)');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(revealNow);
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    }

    els.forEach(function (el) {
      revealObserver.observe(el);
    });

    /* Safety net 1: 900ms after page shows, force-reveal anything in or
       near the viewport (covers initial viewport content that the observer
       may have missed due to timing). */
    setTimeout(function () { forceVisibleInView(container); }, 900);

    /* Safety net 2: 2s — force-reveal everything in-viewport on this page */
    setTimeout(function () { _revealVisible(container); }, 2000);
  }

  function forceVisibleInView(container) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    container.querySelectorAll('[data-reveal]:not(.in-view)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 1.15 && r.bottom > -50) revealNow(el);
    });
  }

  /* Absolute last-resort failsafe: 2.5s after boot, reveal EVERYTHING
     that is currently visible on screen, in any page. */
  function revealAllEventually() {
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll('[data-reveal]:not(.in-view)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) revealNow(el);
      });
    }, 2500);
    /* Extra belt-and-suspenders: 5s force reveal EVERYTHING on active page,
       no matter what. Nothing ever stays hidden. */
    setTimeout(function () {
      var active = Array.prototype.find
        ? Array.prototype.find.call(pages, function (p) { return p.classList.contains('is-active'); })
        : (function () { for (var i = 0; i < pages.length; i++) { if (pages[i].classList.contains('is-active')) return pages[i]; } }());
      if (active) {
        active.querySelectorAll('[data-reveal]:not(.in-view)').forEach(function (el) {
          revealNow(el);
        });
      }
    }, 5000);
  }

  /* ============================================================
     COUNTERS (IntersectionObserver-driven count-up, robust)
     ============================================================ */
  function initCounters(container) {
    var nums = container.querySelectorAll('.counter__num');
    if (!nums.length) return;

    nums.forEach(function (el) {
      if (el.dataset.counted) return;

      var target = parseFloat(el.getAttribute('data-count') || '0');
      var suffix = el.getAttribute('data-suffix') || '';

      function setFinal() { el.textContent = target + suffix; }

      if (!('IntersectionObserver' in window)) {
        el.dataset.counted = '1';
        setFinal();
        return;
      }

      var obs = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        el.dataset.counted = '1';
        obs.disconnect();

        var dur = 1600;
        var start = null;
        function tick(now) {
          if (start === null) start = now;
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else setFinal();
        }
        requestAnimationFrame(tick);

        /* failsafe: guarantee final value even if rAF is throttled */
        setTimeout(function () {
          if (el.dataset.counted === '1') setFinal();
        }, dur + 600);
      }, { threshold: 0.35 });

      obs.observe(el);

      /* If the counter is already in view at init (e.g. landed via
         hash on the numbers section), the observer still fires; but
         add a short failsafe in case it does not. */
      setTimeout(function () {
        if (el.dataset.counted) return;
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top < vh && r.bottom > 0) {
          el.dataset.counted = '1';
          obs.disconnect();
          setFinal();
        }
      }, 2000);
    });
  }

  /* ============================================================
     MAGNETIC BUTTONS (desktop pointer only, GSAP optional)
     ============================================================ */
  var magneticBound = false;
  function initMagnetic() {
    if (magneticBound || reduce || !canHover || !hasGSAP()) return;
    magneticBound = true;
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        window.gsap.to(btn, { x: mx * 0.22, y: my * 0.3, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', function () {
        window.gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  /* ============================================================
     SPA ROUTING
     ============================================================ */
  var pages = document.querySelectorAll('.page');
  var pageLinks = document.querySelectorAll('[data-page]');
  var isTransitioning = false;

  function setActiveNav(pageId) {
    pageLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('data-page') === pageId);
    });
  }

  function activate(target, pageId) {
    pages.forEach(function (p) {
      if (p !== target) { p.classList.remove('is-active'); p.style.display = 'none'; }
    });
    target.style.display = 'block';
    target.classList.add('is-active');
    setActiveNav(pageId);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function afterShow(pageId) {
    var container = document.getElementById('page-' + pageId);
    if (!container) return;
    observeReveals(container);
    /* Immediately reveal anything already in the viewport */
    _revealVisible(container);
    initCounters(container);
    initMagnetic();
    if (hasGSAP() && window.ScrollTrigger) {
      try { window.ScrollTrigger.refresh(); } catch (e) {}
    }
    initScrollSpy(pageId);
    initSpyAdapt(pageId);
    window.dispatchEvent(new CustomEvent('uptec:pageshow', { detail: { pageId: pageId } }));
  }

  function showPage(pageId, opts) {
    opts = opts || {};
    if (VALID_PAGES.indexOf(pageId) === -1) pageId = 'home';
    var target = document.getElementById('page-' + pageId);
    if (!target) return;
    if (isTransitioning) return;

    var current = Array.prototype.find.call(pages, function (p) { return p.classList.contains('is-active'); });

    /* Mark that first load is done after first call */
    var skipOverlay = isFirstLoad;
    if (isFirstLoad) isFirstLoad = false;

    if (!skipOverlay && current && current !== target) {
      /* Use brand overlay transition */
      isTransitioning = true;
      closeDrawer();
      if (!opts.fromPop && ('#' + pageId) !== window.location.hash) {
        history.pushState({ page: pageId }, '', '#' + pageId);
      }
      showOverlay(function () {
        activate(target, pageId);
        /* Small GSAP fade-in of target underneath while overlay exits */
        if (hasGSAP()) {
          window.gsap.fromTo(target, { opacity: 0 }, {
            opacity: 1, duration: 0.22, ease: 'power2.out',
            onComplete: function () {
              target.style.opacity = '';
              isTransitioning = false;
              afterShow(pageId);
            }
          });
        } else {
          isTransitioning = false;
          afterShow(pageId);
        }
      });
    } else {
      /* First load or same page: skip overlay */
      activate(target, pageId);
      afterShow(pageId);
      if (!opts.fromPop && ('#' + pageId) !== window.location.hash) {
        history.pushState({ page: pageId }, '', '#' + pageId);
      }
      closeDrawer();
    }
  }

  pageLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var pageId = link.getAttribute('data-page');
      if (!pageId) return;
      e.preventDefault();
      showPage(pageId);
    });
  });

  window.addEventListener('popstate', function (e) {
    var pageId = (e.state && e.state.page) || (window.location.hash.slice(1)) || 'home';
    showPage(pageId, { fromPop: true });
  });

  function initRoute() {
    var hash = window.location.hash.slice(1);
    showPage(hash && VALID_PAGES.indexOf(hash) !== -1 ? hash : 'home', { fromPop: true });
  }

  /* ============================================================
     NAV: scroll state (pill shrink/solidify) + progress bar
     ============================================================ */
  var nav = document.getElementById('site-nav');
  var progressFill = document.getElementById('scroll-progress-fill');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-solid', y > 30);
    if (progressFill) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressFill.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
    /* reveal-on-scroll safety: catch anything observers missed */
    var active = Array.prototype.find.call(pages, function (p) { return p.classList.contains('is-active'); });
    if (active) forceVisibleInView(active);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============================================================
     MOBILE DRAWER
     ============================================================ */
  var burger = document.getElementById('nav-burger');
  var drawer = document.getElementById('mobile-drawer');
  var drawerCloseBtn = document.getElementById('drawer-close-btn');
  var drawerBackdrop = document.getElementById('mobile-drawer-backdrop');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });
  }
  /* Close button inside drawer */
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }
  /* Backdrop tap closes the drawer */
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }
  /* Escape key closes drawer */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ============================================================
     QUOTE MODAL (shared, focus-trapped)
     ============================================================ */
  var modal = document.getElementById('quote-modal');
  var dialog = modal ? modal.querySelector('.quote-modal__dialog') : null;
  var lastFocused = null;

  function getFocusable() {
    if (!modal) return [];
    return modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  }

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (hasGSAP()) {
      window.gsap.set(modal, { opacity: 0 });
      window.gsap.set(dialog, { opacity: 0, y: 40, scale: 0.96 });
      window.gsap.to(modal, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      window.gsap.to(dialog, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.05 });
    }
    var f = getFocusable();
    if (f.length) setTimeout(function () { f[0].focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    function done() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      modal.style.opacity = '';
      if (dialog) { dialog.style.opacity = ''; dialog.style.transform = ''; }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    if (hasGSAP()) {
      window.gsap.to(dialog, { opacity: 0, y: 30, scale: 0.97, duration: 0.22, ease: 'power2.in' });
      window.gsap.to(modal, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: done });
    } else { done(); }
  }

  document.querySelectorAll('[data-open-quote]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  document.querySelectorAll('[data-close-quote]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); closeModal(); });
  });
  document.addEventListener('keydown', function (e) {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.slice.call(getFocusable());
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ============================================================
     FAQ ACCORDION
     Toggles aria-expanded + removes/restores [hidden] on the body,
     closing siblings on each open. The CSS grid-template-rows
     trick animates height without JS measuremenents.
     ============================================================ */
  function initAccordion() {
    var triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        var bodyId = trigger.getAttribute('aria-controls');
        var body = bodyId ? document.getElementById(bodyId) : null;

        /* Close all siblings first */
        triggers.forEach(function (t) {
          var bId = t.getAttribute('aria-controls');
          var b = bId ? document.getElementById(bId) : null;
          t.setAttribute('aria-expanded', 'false');
          if (b) b.setAttribute('hidden', '');
        });

        /* Toggle the clicked one */
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          if (body) body.removeAttribute('hidden');
        }
      });
    });
  }

  /* ============================================================
     SEGMENTOS CARD ROUTING
     Cards in .segmentos-grid carry data-page on the article and
     on the inner link-arrow button. Handle clicks on the article
     itself (but not on a nested button, which site.js already
     handles via the pageLinks querySelectorAll above).
     ============================================================ */
  function initSegmentosCards() {
    var cards = document.querySelectorAll('.segmentos-grid [data-page]');
    cards.forEach(function (el) {
      if (el.tagName.toLowerCase() === 'article') {
        el.addEventListener('click', function (e) {
          /* If the actual click target is a button[data-page], let
             the main pageLinks handler on that button fire instead */
          if (e.target && e.target.closest('button[data-page]')) return;
          var pageId = el.getAttribute('data-page');
          if (pageId) showPage(pageId);
        });
        /* Keyboard: Enter/Space on the article */
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var pageId = el.getAttribute('data-page');
            if (pageId) showPage(pageId);
          }
        });
      }
    });
  }

  /* Deep-link: #orcamento opens the modal (shareable / testable) */
  function maybeOpenFromHash() { if (window.location.hash === '#orcamento') openModal(); }

  /* ============================================================
     IN-PAGE ANCHOR SMOOTH SCROLL
     Handles <a href="#srv-preventiva"> etc. inside inner pages.
     Only intercepts links whose hash points to an *existing*
     element that is NOT a [data-page] target (those go to the
     SPA router above). Works across all inner pages.
     ============================================================ */
  function initInPageAnchors() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      /* Let SPA router handle data-page links */
      if (link.hasAttribute('data-page')) return;
      /* Let #orcamento go to modal */
      if (id === 'orcamento') return;
      /* Only scroll if the target element actually exists */
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ============================================================
     SCROLL-SPY INSTITUTIONAL SIDEBAR PANEL
     Desktop only (CSS hides it at <=1024px).
     Re-initializes on every SPA page change via afterShow().
     Uses IntersectionObserver to track the in-view section.
     Disconnects old observers on each page change to avoid leaks.
     ============================================================ */
  var spyRail = document.getElementById('scroll-spy-rail');
  var spyObserver = null;

  /* Pages that show the panel */
  var SPY_PAGES = ['servicos', 'licitacoes', 'condominios', 'elevadores'];

  /* Human-readable page labels for the panel header */
  var SPY_PAGE_LABELS = {
    servicos: 'Serviços',
    licitacoes: 'Licitações',
    condominios: 'Condomínios',
    elevadores: 'Elevadores'
  };

  function disconnectSpy() {
    if (spyObserver) { spyObserver.disconnect(); spyObserver = null; }
    /* Also tear down the adaptive-sidebar scroll listener */
    if (spyAdaptUnlisten) { spyAdaptUnlisten(); spyAdaptUnlisten = null; }
    if (spyRail) {
      spyRail.innerHTML = '';
      spyRail.classList.remove('is-visible');
      spyRail.classList.remove('is-on-light');
      spyRail.setAttribute('aria-hidden', 'true');
    }
  }

  function initScrollSpy(pageId) {
    disconnectSpy();
    if (!spyRail) return;
    if (SPY_PAGES.indexOf(pageId) === -1) return;

    var container = document.getElementById('page-' + pageId);
    if (!container) return;

    var sections = Array.prototype.slice.call(
      container.querySelectorAll('[data-spy]')
    );
    if (!sections.length) return;

    /* ---- Build institutional panel structure ---- */

    /* 1. Header with page name */
    var header = document.createElement('div');
    header.className = 'spy-rail__header';
    var pageName = document.createElement('span');
    pageName.className = 'spy-rail__page-name';
    pageName.textContent = SPY_PAGE_LABELS[pageId] || pageId;
    header.appendChild(pageName);
    spyRail.appendChild(header);

    /* 2. Scrollable section list body */
    var body = document.createElement('div');
    body.className = 'spy-rail__body';
    spyRail.appendChild(body);

    var items = sections.map(function (sec) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'spy-item';

      /* Dot kept for CSS compat (display:none in new CSS but harmless) */
      var dot = document.createElement('span');
      dot.className = 'spy-item__dot';
      dot.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'spy-item__label';
      label.textContent = sec.getAttribute('data-spy');

      btn.appendChild(dot);
      btn.appendChild(label);
      btn.setAttribute('aria-label', 'Ir para: ' + sec.getAttribute('data-spy'));

      btn.addEventListener('click', function () {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      body.appendChild(btn);
      return { btn: btn, sec: sec };
    });

    /* 3. CTA card at the bottom */
    var cta = document.createElement('div');
    cta.className = 'spy-rail__cta';

    var ctaTitle = document.createElement('span');
    ctaTitle.className = 'spy-rail__cta-title';
    ctaTitle.textContent = 'Precisa de orçamento?';

    var ctaSub = document.createElement('span');
    ctaSub.className = 'spy-rail__cta-sub';
    ctaSub.textContent = 'Nossa engenharia responde rápido.';

    var ctaBtn = document.createElement('button');
    ctaBtn.type = 'button';
    ctaBtn.className = 'spy-rail__cta-btn';
    ctaBtn.setAttribute('data-open-quote', '');
    ctaBtn.textContent = 'Solicitar orçamento';

    /* Wire the CTA button to the same quote-modal trigger the rest of the site uses.
       We click a pre-existing [data-open-quote] button so we hit the same handler
       registered at boot time, without needing openModal() to be publicly scoped. */
    ctaBtn.addEventListener('click', function () {
      var existing = document.querySelector('[data-open-quote]:not(.spy-rail__cta-btn)');
      if (existing) { existing.click(); }
    });

    cta.appendChild(ctaTitle);
    cta.appendChild(ctaSub);
    cta.appendChild(ctaBtn);
    spyRail.appendChild(cta);

    spyRail.classList.add('is-visible');
    spyRail.setAttribute('aria-hidden', 'false');

    /* ---- IntersectionObserver: active-section detection ---- */
    var activeIdx = 0;

    function setActive(idx) {
      activeIdx = idx;
      items.forEach(function (item, i) {
        item.btn.classList.toggle('is-active', i === idx);
      });
    }

    /* Start with the first item active */
    setActive(0);

    if (!('IntersectionObserver' in window)) return;

    /* Trigger when section crosses the upper quarter of the viewport */
    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = -1;
        for (var i = 0; i < items.length; i++) {
          if (items[i].sec === entry.target) { idx = i; break; }
        }
        if (idx !== -1) setActive(idx);
      });
    }, {
      rootMargin: '-15% 0px -70% 0px',
      threshold: 0
    });

    items.forEach(function (item) {
      spyObserver.observe(item.sec);
    });
  }

  /* ============================================================
     FEATURE 2 - ADAPTIVE SIDEBAR (dark/light per section)
     Detects which .panel--dark / .panel--light section occupies
     the sidebar vertical midpoint and toggles .is-on-light on
     the .spy-rail accordingly. Uses a scroll listener and a
     getBoundingClientRect scan (cheap + robust, no extra observers).
     Re-inits per SPA page change via afterShow().
     ============================================================ */
  var spyAdaptUnlisten = null; /* cleanup fn for previous page */

  function initSpyAdapt(pageId) {
    /* Tear down previous listener */
    if (spyAdaptUnlisten) { spyAdaptUnlisten(); spyAdaptUnlisten = null; }
    if (!spyRail) return;
    /* Only matters on desktop (rail hidden below 1200px) */
    if (!window.matchMedia('(min-width: 1200px)').matches) return;
    if (SPY_PAGES.indexOf(pageId) === -1) {
      spyRail.classList.remove('is-on-light');
      return;
    }

    var container = document.getElementById('page-' + pageId);
    if (!container) return;

    /* Collect all panels in this page */
    var panels = Array.prototype.slice.call(
      container.querySelectorAll('.panel--dark, .panel--light')
    );
    if (!panels.length) return;

    function checkPanelUnderSidebar() {
      /* Rail midpoint Y in the viewport */
      var railRect = spyRail.getBoundingClientRect();
      var midY = railRect.top + railRect.height / 2;

      var onLight = false;
      for (var i = 0; i < panels.length; i++) {
        var r = panels[i].getBoundingClientRect();
        if (r.top <= midY && r.bottom >= midY) {
          onLight = panels[i].classList.contains('panel--light');
          break;
        }
      }
      spyRail.classList.toggle('is-on-light', onLight);
    }

    /* Run once immediately, then on scroll */
    checkPanelUnderSidebar();
    window.addEventListener('scroll', checkPanelUnderSidebar, { passive: true });

    spyAdaptUnlisten = function () {
      window.removeEventListener('scroll', checkPanelUnderSidebar);
      if (spyRail) spyRail.classList.remove('is-on-light');
    };
  }

  /* ============================================================
     LOAD ENTRANCE ANIMATION (first page load only, home page only)
     Plays once: navbar pill slides down, hero elements stagger in.
     Skipped entirely on prefers-reduced-motion.
     Requires GSAP (polls for it if deferred). Failsafe clears
     hidden state after 1.5s even if GSAP never loads.
     ============================================================ */
  var entrancePlayed = false;

  function clearLoadingClass() {
    document.documentElement.classList.remove('js-loading');
  }

  function playLoadEntrance() {
    if (entrancePlayed) return;
    entrancePlayed = true;

    /* Immediately clear the loading class so GSAP can animate from
       its own gsap.set state (not the CSS opacity:0 layer). */
    clearLoadingClass();

    if (!hasGSAP()) return;

    var gsap = window.gsap;
    var pill     = document.querySelector('.site-nav__pill');
    var kicker   = document.querySelector('#hero .hero__kicker');
    var title    = document.querySelector('#hero .hero__title');
    var lead     = document.querySelector('#hero .hero__lead');
    var actions  = document.querySelector('#hero .hero__actions');
    var facts    = document.querySelector('#hero .hero__facts');

    /* Set initial states for the stagger animation */
    if (pill)    gsap.set(pill,    { opacity: 0, y: -22 });
    if (kicker)  gsap.set(kicker,  { opacity: 0, y: 18 });
    if (title)   gsap.set(title,   { opacity: 0, y: 28, clipPath: 'inset(0 0 30% 0)' });
    if (lead)    gsap.set(lead,    { opacity: 0, y: 20 });
    if (actions) gsap.set(actions, { opacity: 0, y: 16 });
    if (facts)   gsap.set(facts,   { opacity: 0, y: 14 });

    var ease = 'power3.out';

    var tl = gsap.timeline({ defaults: { ease: ease } });

    /* Navbar pill: slides down from y:-22 */
    if (pill) {
      tl.to(pill, { opacity: 1, y: 0, duration: 0.42 }, 0);
    }

    /* Hero stagger: kicker -> title (clip-path + y reveal) -> lead -> actions -> facts */
    var heroStart = 0.10;
    var stagger   = 0.08;

    if (kicker) {
      tl.to(kicker, { opacity: 1, y: 0, duration: 0.46 }, heroStart);
    }
    if (title) {
      tl.to(title, {
        opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.52
      }, heroStart + stagger);
    }
    if (lead) {
      tl.to(lead, { opacity: 1, y: 0, duration: 0.48 }, heroStart + stagger * 2);
    }
    if (actions) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.46 }, heroStart + stagger * 3);
    }
    if (facts) {
      tl.to(facts, { opacity: 1, y: 0, duration: 0.44 }, heroStart + stagger * 4);
    }

    /* After timeline: clean up inline styles so hover/scroll states work normally. */
    tl.call(function () {
      if (pill)    { gsap.set(pill,    { clearProps: 'opacity,y,transform' }); }
      if (title)   { gsap.set(title,   { clearProps: 'opacity,y,transform,clipPath,clip-path' }); }
      if (kicker)  { gsap.set(kicker,  { clearProps: 'opacity,y,transform' }); }
      if (lead)    { gsap.set(lead,    { clearProps: 'opacity,y,transform' }); }
      if (actions) { gsap.set(actions, { clearProps: 'opacity,y,transform' }); }
      if (facts)   { gsap.set(facts,   { clearProps: 'opacity,y,transform' }); }
    });
  }

  /* ============================================================
     BRAND LOADER / VINHETA
     Full-screen cinematic entrance on first load only.
     Uses the #brand-loader element (injected into DOM in HTML).
     ============================================================ */
  var brandLoader = document.getElementById('brand-loader');
  var brandLoaderPlayed = false;

  var _brandLoaderHidden = false;
  function hideBrandLoader(cb) {
    if (_brandLoaderHidden) { if (cb) cb(); return; }
    if (!brandLoader) { _brandLoaderHidden = true; if (cb) cb(); return; }
    brandLoader.classList.add('is-exiting');
    var fired = false;
    function done() {
      if (fired) return; fired = true;
      _brandLoaderHidden = true;
      brandLoader.style.display = 'none';
      if (cb) cb();
    }
    var t = setTimeout(done, 480);
    brandLoader.addEventListener('transitionend', function once() {
      brandLoader.removeEventListener('transitionend', once);
      clearTimeout(t);
      done();
    }, { once: true });
  }

  function showBrandLoader() {
    if (!brandLoader || brandLoaderPlayed) return;
    brandLoaderPlayed = true;
    brandLoader.classList.add('is-visible');
    /* Progress bar: animate to 100% then open */
    var bar = brandLoader.querySelector('.bl-bar-fill');
    if (bar) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.width = '100%';
        });
      });
    }
    /* Hide after ~0.7s then fire entrance */
    setTimeout(function () {
      hideBrandLoader(function () {
        /* Brand loader done — play the hero stagger */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            playLoadEntrance();
          });
        });
      });
    }, 700);
    /* Hard failsafe: force hide after 1.9s no matter what */
    setTimeout(function () {
      hideBrandLoader(null);
      clearLoadingClass();
      if (!entrancePlayed) { entrancePlayed = true; }
    }, 1900);
  }

  function setupLoadEntrance() {
    /* Apply loading class NOW (before initRoute) so there is no
       flash of full-opacity elements before GSAP sets hidden states. */
    document.documentElement.classList.add('js-loading');

    /* Start brand loader immediately (does not need GSAP) */
    showBrandLoader();

    /* Absolute failsafe: clear after 2.1s (gives brand loader 0.7s + 0.42s exit + margin). */
    var failsafeTimer = setTimeout(function () {
      clearLoadingClass();
      entrancePlayed = true;
      hideBrandLoader(null);
    }, 2100);

    /* tryPlay: GSAP is ready. Brand loader timing handles when entrance fires.
       Here we just clear the loading class so the CSS doesn't hide elements. */
    function tryPlay() {
      clearTimeout(failsafeTimer);
      clearLoadingClass();
    }

    if (hasGSAP()) {
      /* Schedule to run right after initRoute activates the home page. */
      setTimeout(tryPlay, 0);
    } else {
      /* GSAP not ready yet (deferred script): poll until it loads. */
      var pollTries = 0;
      var pollId = setInterval(function () {
        pollTries++;
        if (hasGSAP()) {
          clearInterval(pollId);
          tryPlay();
        } else if (pollTries > 60) {
          /* Give up after ~3s — failsafe timer above will have cleared already. */
          clearInterval(pollId);
          clearTimeout(failsafeTimer);
          clearLoadingClass();
          entrancePlayed = true;
        }
      }, 50);
    }
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    /* Signal JS is live: enables reveal-hiding CSS + SPA display rules.
       If this line never runs, content stays visible (failsafe). */
    document.documentElement.classList.add('js-ready');

    if (hasGSAP() && window.ScrollTrigger) {
      try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (e) {}
    }

    /* Set up the first-load entrance (adds js-loading class, waits for GSAP). */
    setupLoadEntrance();

    initRoute();
    onScroll();
    maybeOpenFromHash();
    revealAllEventually();
    initAccordion();
    initSegmentosCards();
    initInPageAnchors();

    /* GSAP may finish loading (defer) after this runs; rebind magnetic
       and refresh once it is present. */
    if (!hasGSAP()) {
      var tries = 0;
      var poll = setInterval(function () {
        tries++;
        if (hasGSAP()) {
          clearInterval(poll);
          initMagnetic();
          if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
        } else if (tries > 40) {
          clearInterval(poll);
        }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
