/* ==========================================================================
   site.js — boots index.html. Load last.

   Responsibilities: check every module arrived, apply the theme, fetch
   data.json (or take it over postMessage in preview mode), wire the chrome,
   and build the printable resume on demand.
   ========================================================================== */
(function () {
  "use strict";

  const PF = window.PF;
  const REQUIRED = ["core", "icons", "themes", "layouts", "resume", "render"];

  /* ------------------------------------------------------------------
     0. Did every file actually load? A missing script used to degrade
        silently; now it says which file is missing, by name.
     ------------------------------------------------------------------ */
  function bootFailure(missing) {
    const main = document.getElementById("main");
    const status = document.getElementById("load-status");
    if (status) status.textContent = "The page could not start.";
    if (!main) return;
    while (main.firstChild) main.removeChild(main.firstChild);
    main.setAttribute("aria-busy", "false");

    const section = document.createElement("section");
    section.className = "hero";
    const box = document.createElement("div");
    box.className = "container";
    const panel = document.createElement("div");
    panel.className = "error-panel";
    panel.setAttribute("role", "alert");

    const h = document.createElement("h2");
    h.textContent = missing.length === 1 ? "A script file is missing" : missing.length + " script files are missing";
    const p = document.createElement("p");
    p.textContent = "The page loaded but these files didn't. Commit them next to index.html and redeploy:";
    const list = document.createElement("p");
    list.className = "error-detail";
    list.textContent = missing.map(function (m) { return (PF && PF.FILE_OF && PF.FILE_OF[m]) || m; }).join("\n");

    panel.appendChild(h); panel.appendChild(p); panel.appendChild(list);
    box.appendChild(panel); section.appendChild(box); main.appendChild(section);
  }

  if (!PF || !PF.need) { bootFailure(["core"]); return; }
  const missing = PF.need(REQUIRED);
  if (missing.length) { bootFailure(missing); return; }

  const D = PF.dom, F = PF.fmt, TH = PF.themes, R = PF.render, RES = PF.resume;
  const el = D.el, has = D.has, clear = D.clear;

  /* ------------------------------------------------------------------
     1. State + refs
     ------------------------------------------------------------------ */
  const PREVIEW = window.parent !== window &&
                  new URLSearchParams(window.location.search).has("preview");
  const DATA_URL = "data.json";

  let DATA = null;
  let themeMode = "dark";
  let revealObserver = null, sectionObserver = null;

  const refs = {
    doc: document,
    main: document.getElementById("main"),
    navList: document.getElementById("nav-links"),
    mobileList: document.getElementById("mobile-links"),
    footer: document.getElementById("contact"),
    brand: document.getElementById("brand"),
    guard: guardDownload
  };
  const loadStatus = document.getElementById("load-status");
  const resumeRoot = document.getElementById("resume-root");
  const toast = document.getElementById("toast");

  /* Inject the resume stylesheet once, from the module that owns it. */
  (function injectResumeCss() {
    if (document.getElementById("resume-css")) return;
    const style = el("style", { id: "resume-css" });
    style.textContent = RES.css();
    document.head.appendChild(style);
  })();

  /* ------------------------------------------------------------------
     2. Toast + guarded download
        A bare <a download> saves whatever bytes come back, including a
        404 page, under the .pdf name you asked for. Check first.
     ------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(msg, isError, ms) {
    if (!toast) return;
    if (toastTimer) { window.clearTimeout(toastTimer); toastTimer = null; }
    clear(toast);
    D.append(toast, [msg]);
    toast.classList.toggle("is-error", !!isError);
    toast.setAttribute("role", isError ? "alert" : "status");
    toast.hidden = false;
    if (ms) toastTimer = window.setTimeout(function () { toast.hidden = true; }, ms);
  }
  function hideToast() {
    if (!toast) return;
    if (toastTimer) { window.clearTimeout(toastTimer); toastTimer = null; }
    toast.hidden = true;
  }

  function guardDownload(anchor, url) {
    if (!PF.util.sameOrigin(url)) return anchor;   // cross-origin: `download` is ignored anyway
    anchor.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      showToast("Preparing the file…", false, 0);
      fetch(url, { cache: "no-store" }).then(function (res) {
        const type = (res.headers.get("content-type") || "").toLowerCase();
        if (!res.ok) {
          throw new Error("There's no file at " + url + " (HTTP " + res.status +
            "). It has to be committed to the repo at exactly that path — filenames are case-sensitive.");
        }
        if (type.indexOf("pdf") === -1 && /\.pdf($|\?)/i.test(url)) {
          throw new Error(url + " returned " + (type.split(";")[0] || "an unknown type") +
            " rather than a PDF. Check resumeUrl in data.json.");
        }
        return res.blob();
      }).then(function (blob) {
        PF.util.download(PF.util.fileNameFrom(url, "resume.pdf"), blob);
        hideToast();
      }).catch(function (err) {
        // A TypeError means the request never completed (offline, CORS,
        // file://) — not evidence the file is missing. Let the browser try.
        if (err && err.name === "TypeError") { hideToast(); window.location.href = url; return; }
        showToast(String((err && err.message) || err), true, 12000);
      });
    });
    return anchor;
  }

  /* ------------------------------------------------------------------
     3. Theme
     ------------------------------------------------------------------ */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", themeMode);
    const resolved = TH.resolveTheme((DATA && DATA.theme) || {});
    TH.applyTheme(document, resolved, themeMode);
    const meta = document.head.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", (resolved.vars[themeMode] || {})["--bg"] || "#0d1117");
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(themeMode === "light"));
      btn.setAttribute("aria-label", themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function setMode(next) {
    themeMode = next === "light" ? "light" : "dark";
    applyTheme();
  }

  /* ------------------------------------------------------------------
     4. Printable resume — built on demand, never left in the DOM
        (a second copy of the content would give the page two <h1>s)
     ------------------------------------------------------------------ */
  let printChoice = { template: "compact", paper: "a4" };

  function buildResume(template, paper) {
    if (!resumeRoot) return;
    clear(resumeRoot);
    printChoice = {
      template: template || printChoice.template,
      paper: paper === "letter" ? "letter" : (paper || printChoice.paper)
    };
    resumeRoot.appendChild(RES.build(DATA || {}, { template: printChoice.template }));
    let pageStyle = document.getElementById("page-size");
    if (!pageStyle) {
      pageStyle = el("style", { id: "page-size" });
      document.head.appendChild(pageStyle);
    }
    pageStyle.textContent = "@page { size: " + (printChoice.paper === "letter" ? "Letter" : "A4") + "; margin: 14mm; }";
  }

  window.addEventListener("beforeprint", function () {
    if (resumeRoot && !resumeRoot.firstChild) buildResume();
  });

  function setResumePreview(on, template, paper) {
    document.body.classList.toggle("resume-preview", !!on);
    document.body.classList.toggle("paper-letter", !!on && paper === "letter");
    if (on) buildResume(template, paper);
    else if (resumeRoot) clear(resumeRoot);
  }

  /* ------------------------------------------------------------------
     5. Render / error / load
     ------------------------------------------------------------------ */
  function draw(data) {
    DATA = R.normalise(data);
    themeMode = (DATA.theme && DATA.theme.mode) === "light" ? "light" : "dark";
    applyTheme();

    const pdf = DATA.pdf || {};
    printChoice = {
      template: has(pdf.template) ? pdf.template : "compact",
      paper: pdf.paper === "letter" ? "letter" : "a4"
    };

    if (revealObserver) revealObserver.disconnect();
    if (sectionObserver) sectionObserver.disconnect();

    const result = R.paint(data, refs);
    if (resumeRoot) clear(resumeRoot);

    refs.main.setAttribute("aria-busy", "false");
    if (loadStatus) loadStatus.textContent = "Portfolio loaded.";
    setupReveal();
    setupActiveNav(result.sections);
  }

  function showError(err) {
    clear(refs.main);
    refs.main.setAttribute("aria-busy", "false");
    if (loadStatus) loadStatus.textContent = "The portfolio content failed to load.";

    const isFile = window.location.protocol === "file:";
    refs.main.appendChild(el("section", { class: "hero", "aria-labelledby": "err-title" },
      el("div", { class: "container" },
        el("div", { class: "error-panel", role: "alert" },
          el("p", { class: "eyebrow", text: "Content unavailable" }),
          el("h2", { id: "err-title", text: "Couldn't load data.json" }),
          el("p", { text: "The page loaded, but the content file behind it didn't. Everything below is generated from that file." }),
          el("p", { class: "error-detail", text: String((err && err.message) || err) }),
          isFile
            ? el("p", null, "You opened this file directly from disk, and browsers block ",
                el("code", { text: "fetch()" }), " on ", el("code", { text: "file://" }),
                " URLs. Serve the folder over HTTP instead — for example ",
                el("code", { text: "python3 -m http.server" }), " — or view it on GitHub Pages.")
            : el("p", null, "Check that ", el("code", { text: "data.json" }), " sits next to this page and contains valid JSON."),
          el("div", { class: "hero-cta", style: "margin-top:1.5rem" },
            el("button", { class: "btn btn-primary", type: "button", onclick: load }, "Try again"))))));
  }

  function load() {
    if (loadStatus) loadStatus.textContent = "Loading portfolio…";
    refs.main.setAttribute("aria-busy", "true");
    fetch(DATA_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status + " " + (res.statusText || "") + " while fetching " + DATA_URL);
        return res.text();
      })
      .then(function (body) {
        let data;
        try { data = JSON.parse(body); }
        catch (e) { throw new Error("data.json is not valid JSON — " + e.message); }
        draw(data);
      })
      .catch(showError);
  }

  /* ------------------------------------------------------------------
     6. Preview bridge (admin.html's Preview tab)
     ------------------------------------------------------------------ */
  function onPreviewMessage(event) {
    if (event.source !== window.parent) return;
    const msg = event.data;
    if (!msg) return;

    if (msg.type === "portfolio:data") {
      try {
        draw(msg.data);
        if (msg.mode === "light" || msg.mode === "dark") setMode(msg.mode);
        setResumePreview(msg.view === "resume", msg.template, msg.paper);
      } catch (e) { showError(e); }
      return;
    }

    /* The admin drives PDF export through here so the print CSS only has
       to exist in one document. */
    if (msg.type === "portfolio:print") {
      try {
        buildResume(msg.template, msg.paper);
        window.setTimeout(function () { window.print(); }, 80);
      } catch (e) { /* nothing sensible to do in a preview frame */ }
    }
  }

  /* ------------------------------------------------------------------
     7. Chrome
     ------------------------------------------------------------------ */
  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("is-visible"); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(nodes, function (n) { revealObserver.observe(n); });
  }

  function setupActiveNav(sections) {
    const anchors = Array.prototype.slice.call(document.querySelectorAll("#nav-links a, #mobile-links a"));
    const targets = sections.map(function (s) { return document.getElementById(s.id); }).filter(Boolean);
    if (!("IntersectionObserver" in window) || !targets.length) return;
    const ratios = {};
    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { ratios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      let best = null, bestRatio = 0;
      Object.keys(ratios).forEach(function (id) { if (ratios[id] > bestRatio) { bestRatio = ratios[id]; best = id; } });
      anchors.forEach(function (a) {
        a.classList.toggle("is-active", !!best && a.getAttribute("href") === "#" + best);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] });
    targets.forEach(function (t) { sectionObserver.observe(t); });
  }

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    setMode(themeMode === "dark" ? "light" : "dark");
  });

  const menuBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation menu");
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      const open = mobileMenu.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
    mobileMenu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) { closeMenu(); menuBtn.focus(); }
    });
  }

  const header = document.getElementById("site-header");
  function onScroll() { if (header) header.classList.toggle("is-stuck", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  PF.icons.install();   // pinned Lucide build; brand marks are already inline
  document.addEventListener("DOMContentLoaded", function () { PF.icons.paint(); });
  window.addEventListener("load", function () { PF.icons.paint(); });

  /* ------------------------------------------------------------------
     8. Go
     ------------------------------------------------------------------ */
  applyTheme();   // so the loading skeleton is already themed

  if (PREVIEW) {
    window.addEventListener("message", onPreviewMessage);
    window.parent.postMessage({ type: "portfolio:preview-ready" }, "*");
    if (loadStatus) loadStatus.textContent = "Waiting for preview data…";
  } else {
    load();
  }
})();
