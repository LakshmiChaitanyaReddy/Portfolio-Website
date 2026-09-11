/* ==========================================================================
   core.js — the shared foundation. Load this first.

   Everything hangs off one global, PF. Each module calls PF.provide(name, api)
   to register itself, so index.html and admin.html can check at boot that every
   file actually arrived and name the missing one — instead of silently
   half-working, which is what happened when themes.js wasn't pushed.

   Contents
     PF.provide / PF.need   module registry + load check
     PF.dom                 el / append / clear / has — optional-safe builders
     PF.fmt                 dates, durations, {{tokens}}, **bold**, slugs
     PF.b64                 UTF-8 safe base64 both ways
     PF.util                download, same-origin check, filename from URL
   ========================================================================== */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  PF.modules = PF.modules || {};
  PF.provide = PF.provide || function (name, api) { PF[name] = api; PF.modules[name] = true; };
  PF.need = function (names) { return names.filter(function (n) { return !PF.modules[n]; }); };
  PF.FILE_OF = {
    core: "js/core.js", icons: "js/icons.js", themes: "js/themes.js",
    layouts: "js/layouts.js", resume: "js/resume.js", render: "js/render.js",
    site: "js/site.js", admin: "js/admin.js"
  };

  /* ====================================================================
     DOM — the optional-safe builder used everywhere.
     `has(x) && el(...)` is the standard pattern: a false/null child is
     dropped, so a missing field renders nothing rather than "undefined".
     ==================================================================== */
  function has(v) {
    if (v == null || v === false) return false;
    if (Array.isArray(v)) return v.filter(has).length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return String(v).trim() !== "";
  }

  function append(node, children) {
    children.forEach(function add(child) {
      if (child == null || child === false || child === "" || child === true) return;
      if (Array.isArray(child)) return child.forEach(add);
      node.appendChild(child.nodeType ? child : node.ownerDocument.createTextNode(String(child)));
    });
  }

  function el(tag, attrs) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    append(node, Array.prototype.slice.call(arguments, 2));
    return node;
  }

  const clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); };
  const arr = function (v) { return Array.isArray(v) ? v.filter(Boolean) : []; };

  PF.provide("dom", { el: el, append: append, clear: clear, has: has, arr: arr });

  /* ====================================================================
     FORMATTING
     ==================================================================== */
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  let TOTAL_MONTHS = 0, TOTAL_YEARS = "";

  function parseYM(value) {
    if (!has(value)) return null;
    const m = String(value).trim().match(/^(\d{4})(?:-(\d{1,2}))?/);
    if (!m) return null;
    return { y: +m[1], m: m[2] ? Math.min(12, Math.max(1, +m[2])) : null };
  }

  const ymIndex = function (d) { return d.y * 12 + ((d.m || 1) - 1); };

  function fmtYM(value, short) {
    const d = parseYM(value);
    if (!d) return has(value) ? String(value).trim() : "";   // pass odd formats through untouched
    return d.m ? (short ? SHORT : MONTHS)[d.m - 1] + " " + d.y : String(d.y);
  }

  /* A missing/null end means "Present". */
  function fmtRange(start, end, short) {
    const s = fmtYM(start, short);
    const e = has(end) ? fmtYM(end, short) : "Present";
    if (!s) return has(end) ? e : "";
    return s + " – " + e;
  }

  /* Inclusive month count, the way a CV counts it (May–Sep = 5 mo). */
  function monthsBetween(start, end) {
    const s = parseYM(start);
    if (!s) return 0;
    const now = new Date();
    const e = has(end) ? parseYM(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
    if (!e) return 0;
    return Math.max(0, ymIndex(e) - ymIndex(s)) + 1;
  }

  function fmtDuration(months) {
    if (!months) return "";
    const y = Math.floor(months / 12), m = months % 12, out = [];
    if (y) out.push(y + " yr");
    if (m) out.push(m + " mo");
    return out.join(" ");
  }

  /* Total experience from the earliest start date, so it never goes stale.
     One decimal, floored (52 mo → "4.3"). For a whole number, swap the
     marked line for Math.floor(TOTAL_MONTHS / 12). */
  function useTotals(experience) {
    const starts = arr(experience).map(function (j) { return parseYM(j.startDate); }).filter(Boolean);
    if (!starts.length) { TOTAL_MONTHS = 0; TOTAL_YEARS = ""; return { months: 0, years: "" }; }
    const earliest = starts.reduce(function (a, b) { return ymIndex(a) <= ymIndex(b) ? a : b; });
    TOTAL_MONTHS = monthsBetween(earliest.m ? earliest.y + "-" + earliest.m : String(earliest.y), null);
    TOTAL_YEARS = TOTAL_MONTHS
      ? (Math.floor((TOTAL_MONTHS / 12) * 10) / 10).toFixed(1).replace(/\.0$/, "")   // ← rounding
      : "";
    return { months: TOTAL_MONTHS, years: TOTAL_YEARS };
  }

  const totals = function () { return { months: TOTAL_MONTHS, years: TOTAL_YEARS }; };

  function tokens(str) {
    return String(str)
      .replace(/\{\{\s*years\s*\}\}/g, TOTAL_YEARS)
      .replace(/\{\{\s*months\s*\}\}/g, String(TOTAL_MONTHS));
  }

  /* **bold** → <strong>, as real nodes. No innerHTML anywhere in this app. */
  function rich(str, doc) {
    if (!has(str)) return [];
    const d = doc || document;
    return tokens(str).split(/\*\*([^*]+)\*\*/g).map(function (part, i) {
      if (!part) return null;
      if (i % 2 === 0) return d.createTextNode(part);
      const strong = d.createElement("strong");
      strong.textContent = part;
      return strong;
    });
  }

  const plain = function (str) { return has(str) ? tokens(str).replace(/\*\*/g, "") : ""; };

  const slug = function (s) {
    return String(s || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  };

  /* Sort a copy, newest first; undated entries fall to the end, in order. */
  function byStartDesc(list, key) {
    return arr(list).slice().sort(function (a, b) {
      const A = parseYM(a[key]), B = parseYM(b[key]);
      if (!A && !B) return 0;
      if (!A) return 1;
      if (!B) return -1;
      return ymIndex(B) - ymIndex(A);
    });
  }

  PF.provide("fmt", {
    MONTHS: MONTHS, SHORT: SHORT,
    parseYM: parseYM, ymIndex: ymIndex, fmtYM: fmtYM, fmtRange: fmtRange,
    monthsBetween: monthsBetween, fmtDuration: fmtDuration,
    useTotals: useTotals, totals: totals,
    tokens: tokens, rich: rich, plain: plain, slug: slug, byStartDesc: byStartDesc
  });

  /* ====================================================================
     BASE64 — UTF-8 safe, chunked so large images don't blow the stack
     ==================================================================== */
  function bytesToBase64(bytes) {
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }
  const encode = function (str) { return bytesToBase64(new TextEncoder().encode(str)); };
  function decode(b64) {
    const bin = atob(String(b64).replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  PF.provide("b64", { encode: encode, decode: decode, bytes: bytesToBase64 });

  /* ====================================================================
     MISC
     ==================================================================== */
  function download(filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function sameOrigin(url) {
    try { return new URL(url, window.location.href).origin === window.location.origin; }
    catch (e) { return false; }
  }

  function fileNameFrom(url, fallback) {
    try {
      const last = new URL(url, window.location.href).pathname.split("/").filter(Boolean).pop();
      return last ? decodeURIComponent(last) : (fallback || "download");
    } catch (e) { return fallback || "download"; }
  }

  PF.provide("util", { download: download, sameOrigin: sameOrigin, fileNameFrom: fileNameFrom });
  PF.modules.core = true;
})();
