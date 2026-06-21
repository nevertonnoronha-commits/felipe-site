/* ============================================================
   UPTEC ELEVADORES — Motion Layer (motion.js)
   Purely ADDITIVE to app.js — does NOT touch SPA routing,
   .reveal IntersectionObserver, .stat-number counters,
   accordion, .btn-magnetic, or the contact form.

   Dependencies (loaded BEFORE this file via CDN tags):
     window.gsap          — GSAP 3 core
     window.ScrollTrigger — registered gsap plugin
     window.Splitting     — Splitting.js
     window.Lenis         — @studio-freight/lenis

   All four are checked with typeof guards and each feature
   degrades gracefully when a library is absent.

   Respects prefers-reduced-motion: if the user prefers
   reduced motion we skip Lenis and every animation, leaving
   content fully visible.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     ENVIRONMENT CHECKS
  ---------------------------------------------------------- */
  var HAS_GSAP     = typeof window.gsap         !== 'undefined';
  var HAS_ST       = typeof window.ScrollTrigger !== 'undefined';
  var HAS_SPLIT    = typeof window.Splitting     !== 'undefined';
  var HAS_LENIS    = typeof window.Lenis         !== 'undefined';
  var REDUCED      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Register ScrollTrigger with GSAP if both are present */
  if (HAS_GSAP && HAS_ST) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* already registered */ }
  }

  /* ----------------------------------------------------------
     1. LENIS SMOOTH SCROLL
     Driven by gsap.ticker for perfect sync with GSAP animations.
     Exposed globally so the SPA can call uptecScrollTop().
  ---------------------------------------------------------- */
  window.uptecLenis  = null;
  window.uptecScrollTop = function () {
    if (window.uptecLenis) {
      window.uptecLenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  function initLenis() {
    if (!HAS_LENIS || !HAS_GSAP || REDUCED) return;

    var lenis = new Lenis({
      duration:   1.1,
      easing:     function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false   /* touch devices use native momentum */
    });

    /* Sync Lenis with GSAP ticker for frame-perfect animations */
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* Keep ScrollTrigger in sync with Lenis scroll position */
    if (HAS_ST) {
      lenis.on('scroll', function () {
        ScrollTrigger.update();
      });
    }

    window.uptecLenis = lenis;
  }

  /* ----------------------------------------------------------
     2. HEADLINE TEXT-REVEAL via Splitting.js + GSAP
     Targets elements with class .anim-split.
     Wraps each Splitting 'line' in an overflow:hidden mask,
     then animates words rising from yPercent 110 to 0.
     Runs on DOMContentLoaded and on 'uptec:pageshow'.
  ---------------------------------------------------------- */
  function initSplitReveal() {
    if (!HAS_GSAP || !HAS_SPLIT || REDUCED) return;

    var elements = document.querySelectorAll('.anim-split:not([data-split-done])');
    if (!elements.length) return;

    elements.forEach(function (el) {
      /* Mark to avoid double-processing */
      el.setAttribute('data-split-done', '1');

      /* Run Splitting on lines + words */
      var results = Splitting({ target: el, by: 'lines' });
      if (!results || !results.length) return;

      var result = results[0];
      var lines  = result.lines;
      if (!lines || !lines.length) return;

      /* Wrap each array of word elements in a mask div */
      lines.forEach(function (wordNodes) {
        if (!wordNodes || !wordNodes.length) return;

        /* Create the overflow-hidden wrapper */
        var mask = document.createElement('div');
        mask.className = 'split-line-mask';

        /* Insert the mask before the first word of this line */
        var firstWord = wordNodes[0];
        if (!firstWord || !firstWord.parentNode) return;
        firstWord.parentNode.insertBefore(mask, firstWord);

        /* Move all words of this line into the mask */
        wordNodes.forEach(function (word) {
          mask.appendChild(word);
        });
      });

      /* Collect all word elements to animate */
      var words = el.querySelectorAll('.word');
      if (!words.length) return;

      /* Set initial hidden state */
      gsap.set(words, { yPercent: 110, opacity: 0 });

      /* ScrollTrigger reveal — fires once per element */
      if (HAS_ST) {
        ScrollTrigger.create({
          trigger: el,
          start:   'top 85%',
          toggleActions: 'play none none none',
          once:    true,
          onEnter: function () {
            gsap.to(words, {
              yPercent: 0,
              opacity:  1,
              duration: 0.85,
              stagger:  0.04,
              ease:     'power3.out'
            });
          }
        });
      } else {
        /* Fallback without ScrollTrigger: animate immediately */
        gsap.to(words, {
          yPercent: 0,
          opacity:  1,
          duration: 0.85,
          stagger:  0.04,
          ease:     'power3.out',
          delay:    0.1
        });
      }
    });
  }

  /* ----------------------------------------------------------
     3. PARALLAX via ScrollTrigger scrub
     Elements with class .anim-parallax shift vertically as
     they travel through the viewport.
     data-speed sets the yPercent range (default -12).
     Negative = moves up as you scroll down (classic parallax).
  ---------------------------------------------------------- */
  function initParallax() {
    if (!HAS_GSAP || !HAS_ST || REDUCED) return;

    var elements = document.querySelectorAll('.anim-parallax:not([data-parallax-done])');
    if (!elements.length) return;

    elements.forEach(function (el) {
      el.setAttribute('data-parallax-done', '1');

      var speed = parseFloat(el.dataset.speed);
      if (isNaN(speed)) speed = -12;

      gsap.fromTo(el,
        { yPercent: speed * -0.5 },
        {
          yPercent: speed * 0.5,
          ease:     'none',
          scrollTrigger: {
            trigger:    el,
            start:      'top bottom',
            end:        'bottom top',
            scrub:      true
          }
        }
      );
    });
  }

  /* ----------------------------------------------------------
     4. BRAND MARQUEE — infinite horizontal scroll
     For each .brand-marquee containing a .brand-marquee-track,
     the track is cloned for seamless looping and driven by
     a repeating GSAP tween. Pauses on hover / focus-within.
  ---------------------------------------------------------- */
  function initMarquees() {
    if (!HAS_GSAP || REDUCED) return;

    var marquees = document.querySelectorAll('.brand-marquee:not([data-marquee-done])');
    if (!marquees.length) return;

    marquees.forEach(function (marquee) {
      marquee.setAttribute('data-marquee-done', '1');

      var track = marquee.querySelector('.brand-marquee-track');
      if (!track) return;

      /* Clone the track once so the loop is seamless.
         The animation moves exactly one track-width left,
         then repeats — the clone fills the gap. */
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);

      /* Measure after clone is in the DOM */
      var trackWidth = track.scrollWidth;

      /* Speed: pixels per second — 60 px/s is a gentle drift */
      var seconds = trackWidth / 60;

      /*
       * Classic two-track seamless loop:
       *   - original track starts at x:0,       ends at x:-trackWidth
       *   - clone      starts at x:trackWidth,  ends at x:0
       * Both share the same duration so they move in lockstep.
       * When original reaches -trackWidth it snaps back to 0 (repeat -1),
       * and the clone, already at 0, takes over visually.
       */
      gsap.set(clone, { x: trackWidth });

      var tl = gsap.timeline({ repeat: -1 });
      tl.to(track, { x: -trackWidth, duration: seconds, ease: 'none' }, 0);
      tl.to(clone,  { x: 0,          duration: seconds, ease: 'none' }, 0);

      /* Pause on hover / resume on leave */
      marquee.addEventListener('mouseenter', function () { tl.pause(); });
      marquee.addEventListener('mouseleave', function () { tl.resume(); });
      /* Accessibility: pause when focus is inside */
      marquee.addEventListener('focusin',  function () { tl.pause();  });
      marquee.addEventListener('focusout', function () { tl.resume(); });
    });
  }

  /* ----------------------------------------------------------
     5. STAGGER GROUP REVEAL
     Containers with [data-anim-group] have their direct
     children fade-up on ScrollTrigger enter (once).
     Distinct from app.js .reveal which uses IntersectionObserver.
  ---------------------------------------------------------- */
  function initGroupReveal() {
    if (!HAS_GSAP || REDUCED) return;

    var groups = document.querySelectorAll('[data-anim-group]:not([data-group-done])');
    if (!groups.length) return;

    groups.forEach(function (group) {
      group.setAttribute('data-group-done', '1');

      var children = Array.prototype.slice.call(group.children);
      if (!children.length) return;

      /* Signal CSS to set initial hidden state */
      group.classList.add('anim-group-ready');

      var trigger = HAS_ST ? ScrollTrigger : null;

      if (trigger) {
        ScrollTrigger.create({
          trigger: group,
          start:   'top 82%',
          toggleActions: 'play none none none',
          once:    true,
          onEnter: function () {
            gsap.to(children, {
              y:        0,
              opacity:  1,
              duration: 0.6,
              stagger:  0.1,
              ease:     'power2.out',
              onComplete: function () {
                /* Release will-change budget */
                group.classList.remove('anim-group-ready');
                children.forEach(function (c) {
                  c.style.willChange = 'auto';
                });
              }
            });
          }
        });
      } else {
        /* No ScrollTrigger: reveal after a short delay */
        gsap.to(children, {
          y:        0,
          opacity:  1,
          duration: 0.6,
          stagger:  0.1,
          ease:     'power2.out',
          delay:    0.2,
          onComplete: function () {
            group.classList.remove('anim-group-ready');
          }
        });
      }
    });
  }

  /* ----------------------------------------------------------
     ORCHESTRATOR — runs all inits
  ---------------------------------------------------------- */
  function initMotionLayer() {
    /* Lenis only inits once (guard against repeat calls on page change) */
    if (!window.uptecLenis && HAS_LENIS && HAS_GSAP && !REDUCED) {
      initLenis();
    }

    /* These re-run on every page show so newly visible
       elements get picked up */
    initSplitReveal();
    initParallax();
    initMarquees();
    initGroupReveal();
  }

  /* ----------------------------------------------------------
     ENTRY POINTS
  ---------------------------------------------------------- */

  /* 1) Initial page load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionLayer);
  } else {
    /* DOMContentLoaded already fired (e.g. script is deferred) */
    initMotionLayer();
  }

  /* 2) SPA page changes — listen for the custom event
        the orchestrator fires as 'uptec:pageshow'.
        We re-run split / parallax / group init so elements
        in the newly visible page get animated. */
  window.addEventListener('uptec:pageshow', function (e) {
    /* Reset split-done markers on elements that belong to
       the page that just became visible so they are processed
       fresh (they may have been hidden during first init). */
    var pageId = e && e.detail && e.detail.pageId;
    var scope  = pageId
      ? document.getElementById('page-' + pageId)
      : document;

    if (scope) {
      scope.querySelectorAll('[data-split-done]').forEach(function (el) {
        el.removeAttribute('data-split-done');
      });
      scope.querySelectorAll('[data-parallax-done]').forEach(function (el) {
        el.removeAttribute('data-parallax-done');
      });
      scope.querySelectorAll('[data-marquee-done]').forEach(function (el) {
        el.removeAttribute('data-marquee-done');
      });
      scope.querySelectorAll('[data-group-done]').forEach(function (el) {
        el.removeAttribute('data-group-done');
      });
    }

    /* Refresh ScrollTrigger layout, then re-init */
    if (HAS_GSAP && HAS_ST) {
      ScrollTrigger.refresh();
    }

    initSplitReveal();
    initParallax();
    initMarquees();
    initGroupReveal();
  }, { passive: true });

  /* 3) Also catch if the SPA dispatches the event on document
        instead of window. We forward it to our window handler
        once, guarding against re-entry with a flag. */
  document.addEventListener('uptec:pageshow', function (e) {
    if (e._motionForwarded) return;
    try { e._motionForwarded = true; } catch (_) { /* read-only in some browsers */ }
    /* Re-dispatch on window so the single window handler above runs */
    window.dispatchEvent(new CustomEvent('uptec:pageshow', { detail: e.detail }));
  }, { passive: true });

})();
