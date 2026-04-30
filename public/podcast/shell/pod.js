(function () {
  'use strict';

  /* ── Configuration ───────────────────────────────────────── */
  var EPISODE = {
    number: 'OP009',
    title: 'The Signal Stack',
    date: '2026-04-28',
  };

  var SLIDES = [
    { id: 'slide-cold', label: 'Cold open' },
    { id: 'slide-market', label: 'Market' },
    { id: 'slide-numbers', label: 'Key numbers' },
    { id: 'slide-events', label: 'Current events' },
    { id: 'slide-hardware', label: 'Hardware' },
    { id: 'slide-ai', label: 'AI field' },
    { id: 'slide-bench', label: 'Benchmarks' },
    { id: 'slide-stratum', label: 'Stratum' },
    { id: 'slide-perplex', label: 'Perplexity' },
    { id: 'slide-signal', label: 'Live signal' },
    { id: 'slide-sources', label: 'Sources' },
  ];

  /* ── Data ──────────────────────────────────────────────────── */
  var HEADLINES = [
    { title: 'SpaceX signs Cursor as primary AI dev environment across engineering teams', sourceLabel: 'The Verge', sourceUrl: 'https://www.theverge.com', context: 'SpaceX adopted Cursor — the AI code editor powered by Sonnet — across its engineering teams. This is the highest-profile enterprise validation of AI-assisted coding to date. It directly ties into the local model vs. cloud model debate this episode covers.' },
    { title: 'Samsung moves 1,000 staff to Taylor, Texas fab — operational late 2026', sourceLabel: 'Korea Herald', sourceUrl: 'https://koreaherald.com/article/10617705', context: "Samsung's Taylor campus spans 4.85M m² and will produce advanced AI chips by late 2026. This is part of the broader US semiconductor reshoring push, accelerated by tariff policy and CHIPS Act incentives." },
    { title: 'Utah bets on Holtec for up to 10 SMR-300 reactors — 4GW target', sourceLabel: 'NucNet', sourceUrl: 'https://www.nucnet.org/news/utah-announces-plans-to-deploy-up-to-10-holtec-small-modular-reactors-11-2-2025', context: "After the NuScale/UAMPS Carbon Free Power Project collapsed, Utah pivoted to Holtec International's SMR-300 design. The plan targets up to 4 GW across the Mountain West, positioning Utah as a nuclear energy hub." },
    { title: 'Valar Atomics Ward250 airlifted to Utah — July 4, 2026 first power target', sourceLabel: 'NPR', sourceUrl: 'https://www.npr.org/2026/02/21/nx-s1-5721761/us-military-airlifts-small-reactor', context: 'The Ward250 is a 5MW microreactor small enough to fit in a military cargo plane. It was airlifted to the San Rafael Energy Lab in Utah and is targeting first power generation on July 4, 2026 — a deliberate symbolic date.' },
    { title: 'Nick Shirley daycare fraud video hits 135M views — Trump admin halts MN funding', sourceLabel: 'NPR', sourceUrl: 'https://www.npr.org/2025/12/31/nx-s1-5662600/nick-shirley-minnesota-daycare-fraud', context: 'A 23-year-old YouTuber released a 42-minute video alleging fraud at Somali-run daycares in Minnesota. It went viral at 135M views on X. The Trump administration halted child care funding for Minnesota in response, though state investigators found no evidence of fraud at the specific sites visited.' },
    { title: "California bill nicknamed 'Stop Nick Shirley Act' raises First Amendment concerns", sourceLabel: 'WBFF', sourceUrl: 'https://foxbaltimore.com/news/nation-world/ca-bill-nicknamed-stop-nick-shirley-act-raises-concerns-about-limiting-journalism-fraud', context: 'California lawmakers introduced a bill Republicans dubbed the "Stop Nick Shirley Act" aimed at restricting certain styles of viral investigative content. Critics argue it targets journalism and could chill free speech.' },
    { title: "Shots fired outside White House Correspondents' Dinner — Trump evacuated", sourceLabel: 'NYT', sourceUrl: 'https://www.nytimes.com/2026/04/26/business/media/white-house-correspondents-dinner-shooting.html', context: 'President Trump attended the WHCD for the first time as president on April 26, 2026. Shortly after 8:30 PM, gunshots rang outside the Washington Hilton ballroom. Secret Service rushed the stage and evacuated Trump, Vance, and Melania. The dinner was postponed.' },
    { title: 'Perplexity launches Personal Computer on Mac — Opus 4.7 default orchestrator', sourceLabel: 'Perplexity Changelog', sourceUrl: 'https://www.perplexity.ai/changelog/personal-computer-on-mac-launch-and-computer-updates---april-17-2026', context: "Perplexity's Personal Computer feature launched on Mac with local file editing, Comet browser integration, and voice orchestration. Opus 4.7 is now the default model for orchestrating multi-step computer tasks." },
    { title: 'Perplexity Personal CFO: link bank accounts via Plaid, track net worth + portfolio', sourceLabel: 'Perplexity Changelog', sourceUrl: 'https://www.perplexity.ai/changelog/', context: 'Perplexity now integrates directly with Plaid to connect bank accounts, credit cards, and loans. Users get a unified net worth dashboard and portfolio tracker inside the Perplexity interface.' },
    { title: 'Perplexity Deep Research now creates presentations, spreadsheets, and websites', sourceLabel: 'Perplexity Changelog', sourceUrl: 'https://www.perplexity.ai/changelog/', context: 'Deep Research went beyond text — it can now output full deliverables: slide decks, Excel-compatible spreadsheets, dashboards, and deployable websites from a single research prompt.' },
  ];

  var STRATUM_LINES = [
    { flag: '+', text: 'CodeRabbit AI PR reviews — reads luke-agents standards on every pull request' },
    { flag: '+', text: 'Bartlett Server nightly auto-deploy — 2AM cron, 24-section test suite, Docker' },
    { flag: '+', text: 'Nanobot (Zulip bot) — container health monitor, alerts to #Server-Alerts channel' },
    { flag: '+', text: 'Grafana + Loki centralized logging — 30-day retention across Docker Swarm' },
    { flag: '+', text: 'Sentry error tracking — FastAPI backend + React frontend, release-linked' },
    { flag: '+', text: 'Testing pyramid formalized — unit / integration / E2E, 80%+ coverage target' },
    { flag: '+', text: 'TOOLS_OPERATIONS.md — canonical ops source of truth in luke-agents repo' },
    { flag: '+', text: 'Playwright E2E tests — user-flow tests run against staging environment' },
    { flag: '+', text: 'make lint / make format — ruff + mypy enforced pre-commit' },
    { flag: '~', text: 'GitHub Actions CI — paused (free tier exhausted), manual fly deploy for now' },
    { flag: '~', text: 'Staging: stratum-engine-staging.fly.dev' },
    { flag: '~', text: 'Production: stratumhq.app' },
  ];

  var PERPLEX = [
    { date: 'APR 17 2026', title: 'Personal Computer on Mac', body: 'Local file editing, Comet browsing, voice orchestration. Opus 4.7 default.' },
    { date: 'APR 17 2026', title: 'Computer in Spaces', body: 'Collaborative AI workspace. Persistent memory per Space.' },
    { date: 'APR 17 2026', title: 'Personal CFO (Plaid)', body: 'Link bank/credit/loans. Net worth + portfolio dashboard.' },
    { date: 'MAR 27 2026', title: 'Comet iOS', body: 'Inline editing, task controls, live credit tracking.' },
    { date: 'MAR 13 2026', title: 'Deep Research -> Deliverables', body: 'Outputs presentations, spreadsheets, dashboards, websites from one prompt.' },
    { date: 'MAR 6 2026', title: 'Custom Skills + Model Council', body: 'Automate repeating tasks. Run parallel frontier models simultaneously.' },
    { date: 'FEB 13 2026', title: 'Opus 4.6 + Kimi K2.5', body: 'Enhanced memory, lower latency open-source reasoning.' },
    { date: 'FEB 6 2026', title: 'Memory Engine v2', body: 'State-of-the-art recall benchmarks. 95% memory accuracy.' },
  ];

  var SOURCES = [
    { title: 'Korea Herald — Samsung Taylor fab', url: 'https://koreaherald.com/article/10617705' },
    { title: 'NucNet — Utah Holtec SMR', url: 'https://www.nucnet.org/news/utah-announces-plans-to-deploy-up-to-10-holtec-small-modular-reactors-11-2-2025' },
    { title: 'Latitude Media — Utah SMR ambitions', url: 'https://www.latitudemedia.com/news/utah-bets-on-a-new-developer-to-revive-its-small-modular-reactor-ambitions/' },
    { title: 'NPR — Ward250 airlifted', url: 'https://www.npr.org/2026/02/21/nx-s1-5721761/us-military-airlifts-small-reactor' },
    { title: 'NPR — Nick Shirley daycare fraud', url: 'https://www.npr.org/2025/12/31/nx-s1-5662600/nick-shirley-minnesota-daycare-fraud' },
    { title: 'Wikipedia — Nick Shirley', url: 'https://en.wikipedia.org/wiki/Nick_Shirley' },
    { title: 'WBFF — Stop Nick Shirley Act', url: 'https://foxbaltimore.com/news/nation-world/ca-bill-nicknamed-stop-nick-shirley-act-raises-concerns-about-limiting-journalism-fraud' },
    { title: 'NYT — WHCD shooting', url: 'https://www.nytimes.com/2026/04/26/business/media/white-house-correspondents-dinner-shooting.html' },
    { title: 'YouTube — WHCD coverage', url: 'https://www.youtube.com/watch?v=lgku06ZdpZw' },
    { title: 'Perplexity Changelog — Apr 17 2026', url: 'https://www.perplexity.ai/changelog/personal-computer-on-mac-launch-and-computer-updates---april-17-2026' },
    { title: 'Perplexity Changelog — full', url: 'https://www.perplexity.ai/changelog/' },
    { title: 'HumanEval Leaderboard', url: 'https://pricepertoken.com/leaderboards/benchmark/humaneval' },
    { title: 'Exxact — BERT explained', url: 'https://www.exxactcorp.com/blog/Deep-Learning/how-do-bert-transformers-work' },
    { title: 'Flexday AI — BERT simple', url: 'https://flexday.ai/bert/' },
  ];

  /* ── Helpers ───────────────────────────────────────────────── */
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  /* ── Carousel ──────────────────────────────────────────────── */
  var currentSlide = 0;
  var isScrollMode = false;

  function initCarousel() {
    var track = $('.carousel__track');
    if (!track) return;

    // Build dot nav
    var dotsContainer = $('.car-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      SLIDES.forEach(function (s, i) {
        var btn = document.createElement('button');
        btn.className = 'car-dot' + (i === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', s.label);
        btn.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        btn.addEventListener('click', function () { goToSlide(i); });
        dotsContainer.appendChild(btn);
      });
    }

    // Prev/next
    var prev = $('.car-prev');
    var next = $('.car-next');
    if (prev) prev.addEventListener('click', function () { goToSlide(currentSlide - 1); });
    if (next) next.addEventListener('click', function () { goToSlide(currentSlide + 1); });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (isScrollMode) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goToSlide(currentSlide + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentSlide - 1); }
    });

    updateCarousel();
  }

  function goToSlide(idx) {
    if (idx < 0) idx = 0;
    if (idx >= SLIDES.length) idx = SLIDES.length - 1;
    if (idx === currentSlide) return;
    currentSlide = idx;
    updateCarousel();
  }

  function updateCarousel() {
    if (isScrollMode) return;

    var track = $('.carousel__track');
    if (track) {
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }

    $$('.slide').forEach(function (s, i) {
      s.classList.toggle('is-active', i === currentSlide);
    });

    $$('.car-dot').forEach(function (d, i) {
      d.classList.toggle('is-active', i === currentSlide);
      d.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
    });

    var prev = $('.car-prev');
    var next = $('.car-next');
    if (prev) prev.disabled = currentSlide === 0;
    if (next) next.disabled = currentSlide === SLIDES.length - 1;

    // Resize TradingView if market slide
    if (SLIDES[currentSlide].id === 'slide-market' && window.__tvWidget) {
      try { window.__tvWidget.resize(); } catch (e) {}
    }
  }

  /* ── Scroll mode check ─────────────────────────────────────── */
  function checkScrollMode() {
    isScrollMode = document.body.classList.contains('ep-scroll');
    if (isScrollMode) {
      var track = $('.carousel__track');
      if (track) track.style.transform = '';
      $$('.slide').forEach(function (s) { s.classList.add('is-active'); });
    }
  }

  /* ── Stars ─────────────────────────────────────────────────── */
  function initStars() {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var stars = [];

    function resize() {
      canvas.width = window.innerWidth;
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

  /* ── Ticker ────────────────────────────────────────────────── */
  function initTicker() {
    var bar = document.getElementById('tickerBar');
    if (!bar) return;
    var descript = document.body.classList.contains('mc-descript');
    var symbols = [
      { proName: 'NASDAQ:NVDA', title: 'NVIDIA' },
      { proName: 'NASDAQ:AMD', title: 'AMD' },
      { proName: 'NYSE:SMR', title: 'NuScale / SMR basket' },
      { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
      { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
    ];
    bar.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrap.appendChild(inner);
    var scr = document.createElement('script');
    scr.type = 'text/javascript';
    scr.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
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

  /* ── TradingView Chart ─────────────────────────────────────── */
  function toolbarBgFromTheme() {
    var c = getComputedStyle(document.body).backgroundColor;
    return c && c !== 'rgba(0, 0, 0, 0)' ? c : '';
  }

  function normalizeSymbol(raw) {
    var s = String(raw || '').trim().toUpperCase();
    if (!s) return null;
    if (s.indexOf(':') >= 0) return s;
    return 'NASDAQ:' + s;
  }

  function initTradingView() {
    var container = document.getElementById('tv_chart_container');
    var input = document.getElementById('symbolInput');
    var apply = document.getElementById('symbolApply');
    if (!container || typeof TradingView === 'undefined' || !TradingView.widget) return;

    var toolbarBg = toolbarBgFromTheme();

    var widget = new TradingView.widget({
      container_id: 'tv_chart_container',
      autosize: true,
      symbol: 'NASDAQ:NVDA',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: toolbarBg || undefined,
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      allow_symbol_change: true,
    });
    window.__tvWidget = widget;

    function applySymbol() {
      var sym = normalizeSymbol(input && input.value);
      if (!sym || !widget || typeof widget.setSymbol !== 'function') return;
      widget.setSymbol(sym, '1D', function () {});
    }

    if (apply) apply.addEventListener('click', applySymbol);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); applySymbol(); }
      });
    }
  }

  /* ── Headlines ─────────────────────────────────────────────── */
  function renderHeadlines() {
    var root = document.getElementById('hlStack');
    if (!root) return;
    var html = '';
    for (var i = 0; i < HEADLINES.length; i++) {
      var h = HEADLINES[i];
      var id = 'hl-ctx-' + i;
      html += '<article class="glass-card hl-card" data-hl-card>' +
        '<div class="glass-card__inner">' +
        '<h3 class="hl-card__title">' + esc(h.title) + '</h3>' +
        '<p class="hl-card__src"><a href="' + esc(h.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(h.sourceLabel) + '</a></p>' +
        '<button type="button" class="hl-card__toggle" data-ctx-toggle aria-expanded="false" aria-controls="' + id + '">&#9654; CONTEXT</button>' +
        '<div class="hl-card__ctx" id="' + id + '" role="region" aria-hidden="true">' + esc(h.context) + '</div>' +
        '</div></article>';
    }
    root.innerHTML = html;
  }

  function bindHeadlineToggles() {
    document.querySelectorAll('[data-ctx-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('[data-hl-card]');
        var id = btn.getAttribute('aria-controls');
        var pane = id ? document.getElementById(id) : null;
        var open = btn.getAttribute('aria-expanded') === 'true';
        var next = !open;
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
        if (card) card.classList.toggle('is-open', next);
        btn.innerHTML = next ? '&#9660; CONTEXT' : '&#9654; CONTEXT';
        if (pane) pane.setAttribute('aria-hidden', next ? 'false' : 'true');
      });
    });
  }

  /* ── Stratum ───────────────────────────────────────────────── */
  function renderStratum() {
    var el = document.getElementById('stmBlock');
    if (!el) return;
    var lines = STRATUM_LINES.map(function (row) {
      var sym = row.flag === '+' ? '[+]' : '[~]';
      var cls = row.flag === '+' ? 'shipped' : 'progress';
      return '<div class="stm-line"><span class="' + cls + '">' + sym + ' ' + esc(row.text) + '</span></div>';
    });
    el.innerHTML = lines.join('');
  }

  /* ── Perplexity ──────────────────────────────────────────── */
  function renderPerplex() {
    var root = document.getElementById('perplexGrid');
    if (!root) return;
    var html = '';
    for (var i = 0; i < PERPLEX.length; i++) {
      var p = PERPLEX[i];
      html += '<article class="glass-card perplex-card"><div class="glass-card__inner">' +
        '<span class="perplex-card__date">' + esc(p.date) + '</span>' +
        '<h3 class="perplex-card__title">' + esc(p.title) + '</h3>' +
        '<p class="perplex-card__body">' + esc(p.body) + '</p>' +
        '</div></article>';
    }
    root.innerHTML = html;
  }

  /* ── Sources ─────────────────────────────────────────────── */
  function renderSources() {
    var list = document.getElementById('srcList');
    if (!list) return;
    var html = '';
    for (var i = 0; i < SOURCES.length; i++) {
      var s = SOURCES[i];
      html += '<li>' + (i + 1) + '. ' + esc(s.title) + ' — <a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.url) + '</a></li>';
    }
    list.innerHTML = html;
  }

  function initSourcesToggle() {
    var panel = document.getElementById('srcPanel');
    var btn = document.getElementById('srcToggle');
    var list = document.getElementById('srcList');
    if (!panel || !btn || !list) return;
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      list.setAttribute('aria-hidden', open ? 'false' : 'true');
      btn.textContent = open ? '[ SOURCES ↑ ]' : '[ SOURCES ↓ ]';
    });
  }

  /* ── Market Toggle ───────────────────────────────────────── */
  function initMarketToggle() {
    var sec = document.querySelector('.ep-section--market');
    var btn = document.getElementById('epMarketToggle');
    var panel = document.getElementById('epMarketPanel');
    if (!sec || !btn || !panel) return;
    var collapsed = sessionStorage.getItem('ep009_chart_collapsed') === '1';
    function apply() {
      sec.classList.toggle('is-chart-collapsed', collapsed);
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.textContent = collapsed ? 'Show chart' : 'Hide chart';
      if (window.__tvWidget && typeof window.__tvWidget.resize === 'function') {
        try { window.__tvWidget.resize(); } catch (e) {}
      }
    }
    if (collapsed) apply();
    btn.addEventListener('click', function () {
      collapsed = !collapsed;
      sessionStorage.setItem('ep009_chart_collapsed', collapsed ? '1' : '0');
      apply();
    });
  }

  /* ── Descript Layout ─────────────────────────────────────── */
  function initDescriptLayout() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('descript') === '1' || localStorage.getItem('mc_descript') === '1') {
        document.body.classList.add('mc-descript');
      }
    } catch (e) {}
  }

  /* ── Broadcast Mode ──────────────────────────────────────── */
  function initBroadcastMode() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('broadcast') === '1' || q.get('descript') === '1') {
        document.body.classList.add('broadcast');
      }
    } catch (e) {}
  }

  function autoExpandBroadcastContent() {
    if (!document.body.classList.contains('broadcast')) return;

    // Expand all headline context
    document.querySelectorAll('[data-hl-card]').forEach(function (card) {
      card.classList.add('is-open');
      var btn = card.querySelector('[data-ctx-toggle]');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = '&#9660; CONTEXT';
      }
      var pane = card.querySelector('.hl-card__ctx');
      if (pane) {
        pane.setAttribute('aria-hidden', 'false');
      }
    });

    // Expand sources panel
    var srcPanel = document.getElementById('srcPanel');
    var srcToggle = document.getElementById('srcToggle');
    var srcList = document.getElementById('srcList');
    if (srcPanel && srcToggle && srcList) {
      srcPanel.classList.add('is-open');
      srcToggle.setAttribute('aria-expanded', 'true');
      srcList.setAttribute('aria-hidden', 'false');
      srcToggle.textContent = '[ SOURCES ↑ ]';
    }

    // Expand market chart if collapsed
    var marketSec = document.querySelector('.ep-section--market');
    if (marketSec) {
      marketSec.classList.remove('is-chart-collapsed');
    }
  }

  /* ── Social bar ──────────────────────────────────────────── */
  function initSocialBar() {
    var bar = document.getElementById('socialBar');
    if (!bar) return;
    var links = [
      { href: 'https://twitter.com/luketheduke', label: 'X / Twitter', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>' },
      { href: 'https://github.com/duketopceo', label: 'GitHub', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/></svg>' },
      { href: 'https://www.youtube.com/@lukethe-duke', label: 'YouTube', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z"/><path d="M10 9l5 3l-5 3z"/></svg>' },
    ];
    bar.innerHTML = links.map(function (l) {
      return '<a href="' + esc(l.href) + '" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="' + esc(l.label) + '">' + l.svg + '</a>';
    }).join('');
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function boot() {
    initDescriptLayout();
    initBroadcastMode();
    checkScrollMode();
    initStars();
    initTicker();
    initSocialBar();
    initCarousel();
    renderHeadlines();
    bindHeadlineToggles();
    renderStratum();
    renderPerplex();
    renderSources();
    initSourcesToggle();
    initMarketToggle();
    autoExpandBroadcastContent();
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
