(function () {
  'use strict';

  /* ── Ticker symbols ─────────────────────────────────────── */
  function initTicker() {
    var bar = document.getElementById('tickerBar');
    if (!bar) return;
    var descript = document.body.classList.contains('mc-descript');
    var symbols = [
      { proName: 'NASDAQ:NVDA', title: 'NVIDIA' },
      { proName: 'NASDAQ:AMD',  title: 'AMD' },
      { proName: 'NYSE:SMR',    title: 'SMR' },
      { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
      { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
    ];
    bar.innerHTML = '';
    var wrap  = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrap.appendChild(inner);
    var scr = document.createElement('script');
    scr.type = 'text/javascript';
    scr.src  = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    scr.async = true;
    scr.textContent = JSON.stringify({
      symbols: symbols,
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: descript ? 'regular' : 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    });
    wrap.appendChild(scr);
    bar.appendChild(wrap);
  }

  /* ── TradingView chart ──────────────────────────────────── */
  function toolbarBgFromTheme() {
    var c = getComputedStyle(document.body).backgroundColor;
    return c && c !== 'rgba(0, 0, 0, 0)' ? c : '';
  }

  function normalizeSymbol(raw) {
    var s = String(raw || '').trim().toUpperCase();
    if (!s) return null;
    return s.indexOf(':') >= 0 ? s : 'NASDAQ:' + s;
  }

  function initTradingView() {
    var container = document.getElementById('tv_chart_container');
    var input     = document.getElementById('symbolInput');
    var apply     = document.getElementById('symbolApply');
    if (!container || typeof TradingView === 'undefined' || !TradingView.widget) return;

    var widget = new TradingView.widget({
      container_id: 'tv_chart_container',
      autosize: true,
      symbol: 'NASDAQ:NVDA',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: toolbarBgFromTheme() || undefined,
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      allow_symbol_change: true,
    });
    window.__tvWidget = widget;

    function applySymbol() {
      var sym = normalizeSymbol(input && input.value);
      if (!sym || typeof widget.setSymbol !== 'function') return;
      widget.setSymbol(sym, '1D', function () {});
    }

    if (apply) apply.addEventListener('click', applySymbol);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); applySymbol(); }
      });
    }
  }

  /* ── Mosaic tile expand / collapse ─────────────────────── */
  function initMosaic() {
    document.querySelectorAll('.mosaic-grid').forEach(function (grid) {
      grid.querySelectorAll('.mosaic-tile').forEach(function (tile) {
        tile.addEventListener('click', function (e) {
          var isOpen = tile.classList.contains('is-open');

          /* Clicking inside the body doesn't toggle */
          if (isOpen && !e.target.closest('.mosaic-tile__face')) return;

          /* Close any currently open tile in this grid */
          grid.querySelectorAll('.mosaic-tile.is-open').forEach(function (t) {
            t.classList.remove('is-open');
            t.style.gridColumn = '';
          });

          if (!isOpen) {
            tile.style.gridColumn = '1 / -1';
            tile.classList.add('is-open');
            /* Scroll tile into view if needed */
            tile.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
      });
    });
  }

  /* ── Star field ─────────────────────────────────────────── */
  function initStars() {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx   = canvas.getContext('2d');
    var stars = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      var n = Math.floor((canvas.width * canvas.height) / 5000);
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() + 0.2,
          a: Math.random() * 0.5 + 0.1,
          s: Math.random() * 0.0003 + 0.0001,
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var tw = 0.15 * Math.sin(t * st.s * 800) + 0.85;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,190,220,' + st.a * tw + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  /* ── Descript layout mode ───────────────────────────────── */
  function initDescriptLayout() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('descript') === '1' || localStorage.getItem('mc_descript') === '1') {
        document.body.classList.add('mc-descript');
      }
    } catch (e) {}
  }

  /* ── Carousel ───────────────────────────────────────────── */
  var _carCur   = 0;
  var _carTotal = 0;

  function initCarousel() {
    var track   = document.getElementById('carouselTrack');
    var dotsEl  = document.getElementById('carDots');
    var prevBtn = document.getElementById('carPrev');
    var nextBtn = document.getElementById('carNext');
    if (!track) return;

    var slides = track.querySelectorAll('.slide');
    _carTotal  = slides.length;
    if (_carTotal === 0) return;

    for (var i = 0; i < _carTotal; i++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.className = 'car-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', slides[idx].getAttribute('data-label') || ('Slide ' + (idx + 1)));
        dot.addEventListener('click', function () { carGo(idx); });
        if (dotsEl) dotsEl.appendChild(dot);
      })(i);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { carGo(_carCur - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { carGo(_carCur + 1); });

    var swipeX = 0;
    var stage  = document.getElementById('carouselStage');
    if (stage) {
      stage.addEventListener('touchstart', function (e) {
        swipeX = e.touches[0].clientX;
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - swipeX;
        if (Math.abs(dx) > 48) carGo(dx < 0 ? _carCur + 1 : _carCur - 1);
      }, { passive: true });
    }

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); carGo(_carCur + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); carGo(_carCur - 1); }
    });

    carGo(0);
  }

  function carGo(n) {
    var track   = document.getElementById('carouselTrack');
    var dotsEl  = document.getElementById('carDots');
    var prevBtn = document.getElementById('carPrev');
    var nextBtn = document.getElementById('carNext');
    var counter = document.getElementById('slideCounter');
    if (!track) return;

    var slides = track.querySelectorAll('.slide');
    if (n < 0 || n >= slides.length) return;
    _carCur = n;

    track.style.transform = 'translateX(calc(' + (-n) + ' * 100vw))';

    for (var i = 0; i < slides.length; i++) {
      if (i === n) {
        slides[i].classList.remove('is-active');
        void slides[i].offsetWidth;
        slides[i].classList.add('is-active');
        slides[i].scrollTop = 0;
      } else {
        slides[i].classList.remove('is-active');
      }
    }

    if (dotsEl) {
      var dots = dotsEl.querySelectorAll('.car-dot');
      for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('active', d === n);
    }

    if (prevBtn) prevBtn.disabled = (n === 0);
    if (nextBtn) nextBtn.disabled = (n === slides.length - 1);
    if (counter) counter.textContent = (n + 1) + ' / ' + slides.length;
  }

  /* ── Boot ───────────────────────────────────────────────── */
  function boot() {
    initDescriptLayout();
    initStars();
    initTicker();
    initMosaic();
    initCarousel();
    if (document.readyState === 'complete') {
      initTradingView();
    } else {
      window.addEventListener('load', initTradingView);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
