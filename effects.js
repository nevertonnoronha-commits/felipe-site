/* ============================================================
   UPTEC ELEVADORES - effects.js
   Additive ambient effects — zero interference with site.js.
   All three effects are wrapped in a single IIFE (no global leaks).

   Snippet IDs used:
   (1) dea392d5-ab1f-4c8e-aadb-901bfcc2409e — Magnetic Cursor Follower
   (2) 92244a0c-e854-4178-903e-0cf2362eae58 — Strategic GlowCard
   (3) d9f0449f-4fdd-415b-9551-b3f50f2df6e7 — Executive Grid Ripple

   Guards:
   - (1) Cursor:    pointer:fine AND !prefers-reduced-motion
   - (2) GlowCard:  hover:hover AND pointer:fine (desktop only)
   - (3) GridRipple: !prefers-reduced-motion; pauses animation
             when reduced-motion is detected at runtime
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReducedMotion = reduceMotion.matches;
  var isPointerFine  = window.matchMedia('(pointer: fine)').matches;
  var canHover       = window.matchMedia('(hover: hover)').matches;

  // Update reduced-motion flag if the user changes OS preference at runtime
  reduceMotion.addEventListener('change', function (e) {
    isReducedMotion = e.matches;
  });

  /* =================================================================
     (1) MAGNETIC CURSOR FOLLOWER — dea392d5
     A small gold ring that eases toward the pointer on desktop.
     Guards: pointer:fine AND !prefers-reduced-motion.
     The native cursor is kept; this ring sits on top (pointer-events:none).
     Does NOT block clicks, hover, text selection, or the quote modal.
     ================================================================= */
  function initCursorFollower() {
    if (!isPointerFine) return; /* ALWAYS-ON: removed isReducedMotion check */

    var ring = document.createElement('div');
    ring.id = 'uptec-cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    var mouseX = -200;
    var mouseY = -200;
    var ringX  = -200;
    var ringY  = -200;
    var visible = false;
    var rafId  = null;
    var SPEED  = 0.12; // easing factor (lower = lazier, more cinematic)

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = '1';
      }

      // Expand when hovering interactive elements
      var target = e.target;
      var isInteractive = target && target.closest(
        'a, button, [data-open-quote], [data-close-quote], input, textarea, select, label, [tabindex]'
      );
      ring.classList.toggle('uptec-cursor-ring--hover', !!isInteractive);
    }

    function onMouseLeave() {
      visible = false;
      ring.style.opacity = '0';
    }

    function onMouseEnter() {
      visible = true;
      ring.style.opacity = '1';
    }

    document.addEventListener('mousemove',  onMouseMove,  { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });

    function tick() {
      ringX += (mouseX - ringX) * SPEED;
      ringY += (mouseY - ringY) * SPEED;
      // Centre the ring on the cursor: offset by half its current rendered size.
      // Default size is 28px (half = 14). When .uptec-cursor-ring--hover is active
      // the CSS transitions it to 40px (half = 20), so we use 14 as the static
      // base offset and let the CSS width transition handle the visual centering
      // smoothly (the 6px delta is subtle given the easing lag).
      ring.style.transform = 'translate3d(' + (ringX - 14) + 'px,' + (ringY - 14) + 'px,0)';
      rafId = requestAnimationFrame(tick);
    }

    tick();
  }

  /* =================================================================
     (2) STRATEGIC GLOWCARD — 92244a0c
     A gold radial glow that follows the mouse inside each card
     (.srv-card, .diff-card, .tile-card).
     Implemented via CSS custom props --mx/--my on mousemove +
     a ::before pseudo-element (defined in theme.css additions).
     Guards: hover:hover AND pointer:fine (desktop only).
     Coexists with existing hover border-color, translateY, box-shadow,
     and the gold ::after top-line — we only add ::before.
     ================================================================= */
  function initGlowCards() {
    if (!isPointerFine || !canHover) return;

    var CARD_SEL = '.srv-card, .diff-card, .tile-card';

    function attachCard(card) {
      if (card._glowBound) return;
      card._glowBound = true;

      card.addEventListener('mousemove', function (e) {
        /* ALWAYS-ON: isReducedMotion check removed */
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
        var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
        card.classList.add('glow-active');
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('glow-active');
      }, { passive: true });
    }

    // Attach to cards already in DOM
    document.querySelectorAll(CARD_SEL).forEach(attachCard);

    // Attach to cards revealed later (SPA page changes inject new DOM)
    window.addEventListener('uptec:pageshow', function () {
      document.querySelectorAll(CARD_SEL).forEach(attachCard);
    });
  }

  /* =================================================================
     (3) EXECUTIVE GRID RIPPLE — d9f0449f
     Animated gold-tinted grid background inside #diferenciais only.
     An aria-hidden decorative div is injected as the FIRST CHILD of
     that section, behind all content (z-index: 0; content z-index: 1).
     Guards: prefers-reduced-motion (freezes animation via CSS class).
     ================================================================= */
  function initGridRipple() {
    var section = document.getElementById('diferenciais');
    if (!section) return;

    // Inject decorative container as first child
    var bg = document.createElement('div');
    bg.id = 'uptec-grid-ripple';
    bg.setAttribute('aria-hidden', 'true');
    section.insertBefore(bg, section.firstChild);

    // Grid cell size in px (matches the diagonal-wave delay calc)
    var CELL = 52;
    var rows = 0;
    var cols = 0;
    var cells = [];

    function buildGrid() {
      bg.innerHTML = '';
      cells = [];
      rows = Math.ceil(bg.offsetHeight / CELL) + 1;
      cols = Math.ceil(bg.offsetWidth  / CELL) + 1;

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
          var cell = document.createElement('div');
          cell.className = 'uptec-grid-cell';
          // Diagonal delay: (i+j)*0.1s → cap at 6s so last cells don't
          // wait forever on large viewports
          var delay = Math.min((i + j) * 0.1, 6);
          cell.style.animationDelay = delay + 's';
          bg.appendChild(cell);
          cells.push(cell);
        }
      }
    }

    /* ALWAYS-ON: grid ripple plays regardless of reduced-motion setting */
    function applyReducedMotion() {
      bg.classList.remove('uptec-grid-ripple--paused');
    }

    reduceMotion.addEventListener('change', applyReducedMotion);
    applyReducedMotion();

    buildGrid();

    // Rebuild on significant resize (debounced, 300ms)
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildGrid, 300);
    }, { passive: true });
  }

  /* =================================================================
     BOOT — run after DOM is ready
     ================================================================= */
  function boot() {
    /* cursor magnetico removido a pedido */
    initGlowCards();
    initGridRipple();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
