/**
 * Mission Control — paginated dashboard from /podcast/episodes/current.json
 * Optional #chartDock: one global Lightweight chart; in-page chart panels skipped (no duplicate).
 */
(function () {
  "use strict";

  var SOCIAL_SVG = {
    youtube:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.4 31.4 0 000 12a31.4 31.4 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.4 31.4 0 0024 12a31.4 31.4 0 00-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>',
    spotify:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    apple:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0zm6.525 2.568c4.992 0 8.352 3.226 8.352 6.611 0 3.016-1.647 5.15-4.118 5.15-1.424 0-2.467-.777-2.881-2.103h-.07c-.522 1.378-1.47 2.103-2.881 2.103-1.862 0-3.3-1.564-3.3-3.848 0-3.226 2.467-5.7 6.158-5.7.87 0 1.87.113 2.467.296l-.174 4.37c-.07 1.565.574 2.377 1.565 2.377 1.096 0 1.87-1.096 1.87-3.018 0-2.76-2.259-5.22-6.472-5.22-3.952 0-6.924 2.865-6.924 7.043 0 4.282 2.781 6.95 7.147 6.95 1.252 0 2.572-.226 3.387-.575l.435 1.496c-.974.4-2.537.679-3.952.679C6.56 21.576 3 18.15 3 13.044c0-5.218 3.7-9.104 8.865-9.104z"/></svg>',
  };

  var state = {
    episode: null,
    currentPage: 0,
    rotateTimer: null,
    rotatePaused: false,
    globalChartPanel: null,
    globalChartCleanup: null,
    chartDockExpanded: true,
    useDock: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function findFirstChartPanel(ep) {
    if (!ep || !ep.pages) return null;
    for (var p = 0; p < ep.pages.length; p++) {
      var panels = ep.pages[p].panels || [];
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].type === "chart" && panels[i].bars && panels[i].bars.length)
          return panels[i];
      }
    }
    return null;
  }

  function destroyGlobalChart() {
    if (typeof state.globalChartCleanup === "function") {
      state.globalChartCleanup();
      state.globalChartCleanup = null;
    }
    var host = $("globalChartHost");
    if (host) host.innerHTML = "";
  }

  function renderLightweightChart(panel, hostEl) {
    if (!hostEl || !window.LightweightCharts || !panel.bars || !panel.bars.length) {
      if (hostEl)
        hostEl.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(232,228,220,0.25);font-size:11px;font-family:monospace;">no data</div>';
      return function () {};
    }
    var chart = LightweightCharts.createChart(hostEl, {
      width: hostEl.offsetWidth,
      height: hostEl.offsetHeight,
      layout: {
        background: { type: "solid", color: "rgba(14,13,11,1)" },
        textColor: "rgba(232,228,220,0.45)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        textColor: "rgba(232,228,220,0.45)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });
    var series = chart.addCandlestickSeries({
      upColor: "#5a9e6f",
      downColor: "#b55555",
      borderUpColor: "#5a9e6f",
      borderDownColor: "#b55555",
      wickUpColor: "rgba(90,158,111,0.6)",
      wickDownColor: "rgba(181,85,85,0.6)",
    });
    series.setData(panel.bars);
    chart.timeScale().fitContent();
    var ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () {
        if (hostEl.offsetWidth && hostEl.offsetHeight)
          chart.resize(hostEl.offsetWidth, hostEl.offsetHeight);
      });
      ro.observe(hostEl);
    }
    return function () {
      if (ro) ro.disconnect();
      chart.remove();
    };
  }

  function chartLabel(panel) {
    var t = panel.symbol || "";
    return t.split(":").pop() || "chart";
  }

  function setupChartDock(panel) {
    var dock = $("chartDock");
    var host = $("globalChartHost");
    var label = $("chartDockLabel");
    var btn = $("chartDockToggle");
    if (!dock || !host || !panel) {
      document.body.classList.remove(
        "mc-has-chart-dock",
        "mc-chart-dock-expanded",
        "mc-chart-dock-collapsed"
      );
      state.useDock = false;
      return;
    }
    state.useDock = true;
    document.body.classList.add("mc-has-chart-dock");
    dock.style.display = "";
    if (label) label.textContent = "main chart · " + chartLabel(panel);
    destroyGlobalChart();
    requestAnimationFrame(function () {
      state.globalChartCleanup = renderLightweightChart(panel, host);
    });

    var collapsed =
      sessionStorage.getItem("mc_chart_dock_collapsed") === "1";
    state.chartDockExpanded = !collapsed;
    function applyDockClass() {
      dock.classList.toggle("is-collapsed", !state.chartDockExpanded);
      document.body.classList.toggle("mc-chart-dock-expanded", state.chartDockExpanded);
      document.body.classList.toggle("mc-chart-dock-collapsed", !state.chartDockExpanded);
      if (btn)
        btn.textContent = state.chartDockExpanded ? "Hide chart" : "Show chart";
    }
    applyDockClass();
    if (btn && !btn._mcBound) {
      btn._mcBound = true;
      btn.addEventListener("click", function () {
        state.chartDockExpanded = !state.chartDockExpanded;
        sessionStorage.setItem(
          "mc_chart_dock_collapsed",
          state.chartDockExpanded ? "0" : "1"
        );
        applyDockClass();
        requestAnimationFrame(function () {
          if (host && state.globalChartCleanup) {
            state.globalChartCleanup();
            state.globalChartCleanup = renderLightweightChart(panel, host);
          }
        });
      });
    }
  }

  function hideChartDock() {
    var dock = $("chartDock");
    if (dock) dock.style.display = "none";
    destroyGlobalChart();
    document.body.classList.remove(
      "mc-has-chart-dock",
      "mc-chart-dock-expanded",
      "mc-chart-dock-collapsed"
    );
    state.useDock = false;
  }

  function panelChart(panel) {
    var wrap = document.createElement("div");
    wrap.className = "panel";
    wrap.style.cssText = panel._style || "";
    var uid = "lc_" + Math.random().toString(36).slice(2);
    var label = chartLabel(panel);
    wrap.innerHTML =
      '<div class="panel__head"><span class="panel__tag panel__tag--accent">chart · ' +
      esc(label) +
      '</span></div><div class="panel__body panel__body--flush"><div id="' +
      uid +
      '" style="width:100%;height:100%;"></div></div>';
    requestAnimationFrame(function () {
      var el = document.getElementById(uid);
      wrap._lvCleanup = renderLightweightChart(panel, el);
    });
    return wrap;
  }

  function cleanupDashboardPage(dash) {
    var page = dash.querySelector(".page");
    if (!page) return;
    var panels = page.querySelectorAll(".panel");
    for (var i = 0; i < panels.length; i++) {
      if (panels[i]._lvCleanup) {
        panels[i]._lvCleanup();
        panels[i]._lvCleanup = null;
      }
    }
  }

  function panelHeadlines(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    el.style.cssText = panel._style || "";
    var html = "";
    var items = panel.items || panel;
    if (Array.isArray(items))
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        html +=
          '<div class="hl"><div class="hl__title">' +
          esc(it.title) +
          '</div><div class="hl__src">' +
          esc(it.source || "") +
          "</div></div>";
      }
    el.innerHTML =
      '<div class="panel__head"><span class="panel__tag">headlines</span></div><div class="panel__body">' +
      html +
      "</div>";
    return el;
  }

  function panelTiles(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    el.style.cssText = panel._style || "";
    var html = "";
    var items = panel.items || panel;
    if (Array.isArray(items))
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var c =
          it.delta === "up"
            ? " tile__val--up"
            : it.delta === "down"
              ? " tile__val--down"
              : "";
        html +=
          '<div class="tile"><div class="tile__lbl">' +
          esc(it.label) +
          '</div><div class="tile__val' +
          c +
          '">' +
          esc(it.value) +
          "</div>" +
          (it.note ? '<div class="tile__note">' + esc(it.note) + "</div>" : "") +
          "</div>";
      }
    el.innerHTML =
      '<div class="panel__head"><span class="panel__tag">data</span></div><div class="panel__body panel__body--flush"><div class="tiles">' +
      html +
      "</div></div>";
    return el;
  }

  function panelContent(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    el.style.cssText = panel._style || "";
    var html = "";
    var items = panel.items || panel;
    if (Array.isArray(items))
      for (var n = 0; n < items.length; n++) {
        var it = items[n];
        html += '<div class="cnt"><div class="cnt__h">' + esc(it.heading) + '</div><ul class="cnt__ul">';
        if (it.bullets)
          for (var l = 0; l < it.bullets.length; l++)
            html += "<li>" + esc(it.bullets[l]) + "</li>";
        html += "</ul></div>";
      }
    el.innerHTML =
      '<div class="panel__head"><span class="panel__tag">briefing</span></div><div class="panel__body">' +
      html +
      "</div>";
    return el;
  }

  function panelStratum(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    el.style.cssText = panel._style || "";
    var tags = "";
    if (panel.features)
      for (var s = 0; s < panel.features.length; s++)
        tags += '<span class="stm__tag">' + esc(panel.features[s]) + "</span>";
    el.innerHTML =
      '<div class="panel__head"><span class="panel__tag panel__tag--warm">stratum engine</span></div><div class="panel__body"><div class="stm"><div class="stm__status"><span class="stm__dot"></span><span class="stm__ver">' +
      esc(panel.version || "") +
      '</span><span class="stm__live">' +
      esc(panel.status || "Live") +
      '</span></div><div class="stm__tagline">' +
      esc(panel.tagline || "") +
      '</div><div class="stm__row"><span class="stm__row-k">Users</span><span class="stm__row-v">' +
      esc(panel.users || "") +
      "</span></div>" +
      (panel.mrr
        ? '<div class="stm__row"><span class="stm__row-k">MRR</span><span class="stm__row-v">' +
          esc(panel.mrr) +
          "</span></div>"
        : "") +
      (panel.calls
        ? '<div class="stm__row"><span class="stm__row-k">Calls Handled</span><span class="stm__row-v">' +
          esc(panel.calls) +
          "</span></div>"
        : "") +
      '<div class="stm__tags">' +
      tags +
      "</div></div></div>";
    return el;
  }

  function panelFeed(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    el.style.cssText = panel._style || "";
    el.innerHTML =
      '<div class="panel__head"><span class="panel__tag">feed · youtube</span></div><div class="panel__body" id="feedBody"><div style="color:var(--color-text-faint);font-size:var(--text-xs);">Loading feed...</div></div>';
    var channelId = panel.channelId || "UCBF9oq5Zm25so1vWYV5xIkQ";
    var count = panel.count || 4;
    var url =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(
        "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId
      );
    fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var body = el.querySelector(".panel__body");
        if (data.items && data.items.length) {
          var html = "";
          var slice = data.items.slice(0, count);
          for (var i = 0; i < slice.length; i++) {
            var item = slice[i];
            var thumb =
              item.thumbnail ||
              (item.enclosure && item.enclosure.thumbnail) ||
              "";
            var date = item.pubDate ? item.pubDate.split(" ")[0] : "";
            html +=
              '<a href="' +
              esc(item.link || "") +
              '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
              (thumb
                ? '<img class="feed-item__thumb" src="' +
                  esc(thumb) +
                  '" alt="" loading="lazy">'
                : "") +
              '<div class="feed-item__info"><div class="feed-item__title">' +
              esc(item.title || "") +
              '</div><div class="feed-item__date">' +
              esc(date) +
              "</div></div></a>";
          }
          body.innerHTML = html;
        } else
          body.innerHTML =
            '<div style="color:var(--color-text-faint);font-size:var(--text-xs);">No episodes found</div>';
      })
      .catch(function () {
        el.querySelector(".panel__body").innerHTML =
          '<div style="color:var(--color-text-faint);font-size:var(--text-xs);">Feed unavailable</div>';
      });
    return el;
  }

  function sameChart(a, b) {
    if (!a || !b) return false;
    return (
      (a.symbol || "") === (b.symbol || "") &&
      (a.interval || "") === (b.interval || "") &&
      (a.bars || []).length === (b.bars || []).length
    );
  }

  function buildPage(pageDef) {
    var page = document.createElement("div");
    var layout =
      state.useDock && state.globalChartPanel ? "page--stack" : pageDef.layout || "page--chart-sidebar";
    page.className = "page " + layout;
    var panels = pageDef.panels || [];
    for (var s = 0; s < panels.length; s++) {
      var n = panels[s];
      if (
        state.useDock &&
        state.globalChartPanel &&
        n.type === "chart" &&
        sameChart(n, state.globalChartPanel)
      )
        continue;
      var node = null;
      switch (n.type) {
        case "chart":
          node = panelChart(n);
          break;
        case "headlines":
          node = panelHeadlines(n);
          break;
        case "tiles":
          node = panelTiles(n);
          break;
        case "content":
          node = panelContent(n);
          break;
        case "stratum":
          node = panelStratum(n);
          break;
        case "feed":
          node = panelFeed(n);
          break;
      }
      if (node) {
        if (n.gridArea) node.style.gridArea = n.gridArea;
        page.appendChild(node);
      }
    }
    return page;
  }

  function goPage(idx) {
    var ep = state.episode;
    if (!ep || !ep.pages || !ep.pages[idx]) return;
    state.currentPage = idx;
    var dash = $("dashboard");
    cleanupDashboardPage(dash);
    dash.innerHTML = "";
    dash.classList.remove("dashboard--enter");
    void dash.offsetWidth;
    dash.classList.add("dashboard--enter");
    dash.appendChild(buildPage(ep.pages[idx]));
    var tabs = $("pageNav").querySelectorAll(".page-tab");
    for (var n = 0; n < tabs.length; n++) tabs[n].classList.toggle("active", n === idx);
    updateFooter();
  }

  function updateFooter() {
    var ep = state.episode;
    if (!ep) return;
    var el = $("footerStatus");
    var t = "LIVE · " + (ep.theme || "") + " · " + (ep.date || "");
    if (state.rotateTimer && ep.pages && ep.pages.length > 1)
      t +=
        " · AUTO " +
        (ep.pageRotateSec || 0) +
        "s" +
        (state.rotatePaused ? " · PAUSED" : "");
    el.textContent = t;
  }

  function mountTicker(ep) {
    var c = $("tickerBar");
    if (!ep.ticker || !ep.ticker.length) {
      c.style.display = "none";
      return;
    }
    var descript = document.body.classList.contains("mc-descript");
    var symbols = ep.ticker.map(function (x) {
      return typeof x === "string" ? { proName: x, title: x.split(":").pop() } : x;
    });
    c.innerHTML = "";
    c.style.display = "";
    var wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container";
    var inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    wrap.appendChild(inner);
    var scr = document.createElement("script");
    scr.type = "text/javascript";
    scr.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    scr.async = true;
    scr.textContent = JSON.stringify({
      symbols: symbols,
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: descript ? "regular" : "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    wrap.appendChild(scr);
    c.appendChild(wrap);
  }

  function mountSocial(links) {
    var o = $("socialBar");
    if (!links) return;
    var html = "";
    var keys = ["youtube", "x", "linkedin", "spotify", "apple"];
    for (var s = 0; s < keys.length; s++) {
      var k = keys[s];
      var href = links[k];
      if (href)
        html +=
          '<a href="' +
          esc(href) +
          '" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="' +
          k +
          '">' +
          SOCIAL_SVG[k] +
          "</a>";
    }
    o.innerHTML = html;
  }

  function loadEpisode(ep) {
    if (state.rotateTimer) {
      clearInterval(state.rotateTimer);
      state.rotateTimer = null;
    }
    state.rotatePaused = false;
    state.episode = ep;
    state.currentPage = 0;
    $("epBadge").textContent = "EP " + String(ep.number).padStart(2, "0");
    $("epTitle").textContent = ep.title || "";
    $("epDate").textContent = ep.date || "";
    var brand = ep.brand || "Dashboard";
    document.title = "EP" + ep.number + ": " + (ep.title || "") + " — " + brand;
    var bt = $("brandTitle");
    if (bt) bt.textContent = brand;

    var dockWanted =
      $("chartDock") &&
      ep.useGlobalChart !== false &&
      findFirstChartPanel(ep);
    state.globalChartPanel = dockWanted ? findFirstChartPanel(ep) : null;
    if (state.globalChartPanel && $("chartDock")) setupChartDock(state.globalChartPanel);
    else hideChartDock();

    mountTicker(ep);
    mountSocial(ep.links);

    var nav = $("pageNav");
    nav.innerHTML = "";
    if (ep.pages && ep.pages.length) {
      for (var t = 0; t < ep.pages.length; t++) {
        var b = document.createElement("button");
        b.className = "page-tab" + (t === 0 ? " active" : "");
        b.textContent = ep.pages[t].label || "Page " + (t + 1);
        b.setAttribute("data-page", t);
        b.addEventListener("click", function () {
          goPage(parseInt(this.getAttribute("data-page"), 10));
        });
        nav.appendChild(b);
      }
      goPage(0);
    }
    var ms = (ep.pageRotateSec || 0) * 1000;
    if (ms > 0 && ep.pages && ep.pages.length > 1) {
      state.rotateTimer = setInterval(function () {
        if (state.rotatePaused) return;
        goPage((state.currentPage + 1) % ep.pages.length);
      }, ms);
    }
    updateFooter();
  }

  function initDescriptLayout() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get("descript") === "1" || localStorage.getItem("mc_descript") === "1")
        document.body.classList.add("mc-descript");
    } catch (e) {}
  }

  function initStars() {
    var canvas = $("starsCanvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
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
        ctx.fillStyle = "rgba(180,190,220," + st.a * tw + ")";
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === " " && state.rotateTimer) {
      e.preventDefault();
      state.rotatePaused = !state.rotatePaused;
      updateFooter();
      return;
    }
    if (e.key === "k" || e.key === "K") {
      var btn = $("chartDockToggle");
      if (btn && state.useDock) {
        e.preventDefault();
        btn.click();
      }
      return;
    }
    var ep = state.episode;
    if (!ep || !ep.pages) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      if (state.currentPage < ep.pages.length - 1) goPage(state.currentPage + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      if (state.currentPage > 0) goPage(state.currentPage - 1);
    } else if (e.key >= "1" && e.key <= "9") {
      var n = parseInt(e.key, 10) - 1;
      if (n < ep.pages.length) goPage(n);
    }
  });

  function boot() {
    initDescriptLayout();
    initStars();
    var pre = window.__EPISODE__;
    if (pre) loadEpisode(pre);
    else
      fetch("/podcast/episodes/current.json")
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (data) {
          if (data) loadEpisode(data);
          else
            $("dashboard").innerHTML =
              '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-faint);font-size:var(--text-sm);">No episode loaded</div>';
        })
        .catch(function () {
          $("dashboard").innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-faint);font-size:var(--text-sm);">No episode loaded</div>';
        });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
