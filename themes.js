/* ==========================================================================
   themes.js — presets, font catalogue, print layouts and section layouts.

   Loaded by BOTH index.html and admin.html as a plain <script>, so a theme
   is defined exactly once. No build step, no modules.

   HOW A THEME WORKS
   -----------------
   A theme is nothing but a bag of CSS custom properties, applied inline on
   <html> at runtime. The stylesheets in index.html/admin.html declare sane
   defaults for every one of them, so if this file fails to load the site
   still renders in the default Graphite look.

   Each theme declares only TEN colours per mode. Everything else is derived
   in CSS or in applyTheme():
     --accent-strong   accent mixed toward white (dark) / black (light)
     --accent-soft     accent at 12% alpha
     --header-bg       page background at 80% alpha
     --on-accent       black or white, picked by luminance for contrast

   ADDING YOUR OWN
   ---------------
   You don't need to edit this file — admin.html's Theme tab writes custom
   templates into data.json under theme.templates, in exactly the shape of
   the objects below. Editing here just gives everyone the new preset.
   ========================================================================== */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------
     FONT CATALOGUE — every family the theme builder can offer.
     `spec` is the exact Google Fonts css2 family string (weights matter:
     Space Mono has no 500, Instrument Serif has only 400).
     ------------------------------------------------------------------ */
  const FONTS = {
    "Space Grotesk":       { spec: "Space+Grotesk:wght@500;600;700", kind: "sans" },
    "Inter":               { spec: "Inter:wght@400;500;600;700", kind: "sans" },
    "Manrope":             { spec: "Manrope:wght@400;500;600;700", kind: "sans" },
    "Outfit":              { spec: "Outfit:wght@400;500;600;700", kind: "sans" },
    "Archivo":             { spec: "Archivo:wght@400;500;600;700", kind: "sans" },
    "Sora":                { spec: "Sora:wght@400;500;600;700", kind: "sans" },
    "Bricolage Grotesque": { spec: "Bricolage+Grotesque:wght@500;600;700", kind: "sans" },
    "Work Sans":           { spec: "Work+Sans:wght@400;500;600", kind: "sans" },
    "Karla":               { spec: "Karla:wght@400;500;600;700", kind: "sans" },
    "Figtree":             { spec: "Figtree:wght@400;500;600;700", kind: "sans" },
    "Source Sans 3":       { spec: "Source+Sans+3:wght@400;500;600;700", kind: "sans" },
    "IBM Plex Sans":       { spec: "IBM+Plex+Sans:wght@400;500;600", kind: "sans" },
    "Nunito Sans":         { spec: "Nunito+Sans:wght@400;500;600;700", kind: "sans" },

    "Fraunces":            { spec: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700", kind: "serif" },
    "Playfair Display":    { spec: "Playfair+Display:wght@500;600;700", kind: "serif" },
    "Instrument Serif":    { spec: "Instrument+Serif", kind: "serif" },
    "Newsreader":          { spec: "Newsreader:wght@400;500;600", kind: "serif" },
    "Lora":                { spec: "Lora:wght@400;500;600;700", kind: "serif" },

    "JetBrains Mono":      { spec: "JetBrains+Mono:wght@400;500", kind: "mono" },
    "IBM Plex Mono":       { spec: "IBM+Plex+Mono:wght@400;500;600", kind: "mono" },
    "Space Mono":          { spec: "Space+Mono:wght@400;700", kind: "mono" },
    "Fira Code":           { spec: "Fira+Code:wght@400;500", kind: "mono" },
    "Roboto Mono":         { spec: "Roboto+Mono:wght@400;500", kind: "mono" }
  };

  const STACKS = {
    sans:  'system-ui, -apple-system, "Segoe UI", sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono:  'ui-monospace, "SF Mono", Menlo, monospace'
  };

  /* Shorthand for the ten colours a mode needs, in a fixed order. */
  function mode(accent, bg, bgAlt, surface, surface2, text, textMid, textDim, border, border2, danger, warn) {
    return {
      "--accent": accent,
      "--bg": bg, "--bg-alt": bgAlt, "--surface": surface, "--surface-2": surface2,
      "--text": text, "--text-mid": textMid, "--text-dim": textDim,
      "--border": border, "--border-2": border2,
      "--danger": danger, "--warn": warn
    };
  }

  function shape(opts) {
    return Object.assign({
      "--maxw": "1080px",
      "--radius": "14px",
      "--radius-sm": "8px",
      "--chip-radius": "6px",
      "--gap": "1.1rem",
      "--section-y": "clamp(4.5rem, 10vw, 7.5rem)",
      "--fs-scale": "1",
      "--h-scale": "1",
      "--line-height": "1.7",
      "--h-weight": "600",
      "--h-tracking": "-0.02em"
    }, opts || {});
  }

  /* ------------------------------------------------------------------
     THE PRESETS
     ------------------------------------------------------------------ */
  const THEMES = [
    {
      id: "graphite",
      name: "Graphite",
      blurb: "The default. Mint accent on cool charcoal, geometric headings — quiet and engineer-credible.",
      fonts: { display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape(),
        dark:  mode("#5cc8a8", "#0d1117", "#10161f", "#151c26", "#1b2430", "#e8edf4", "#b3bdcb", "#7d8899", "#232d3b", "#303d4e", "#ff6b6b", "#e3b341"),
        light: mode("#0f8a6a", "#fbfbf9", "#f3f4f1", "#ffffff", "#f1f3f0", "#14181d", "#414a55", "#6b7480", "#e2e4e0", "#c9cdc7", "#c62828", "#8a6100")
      }
    },
    {
      id: "ink",
      name: "Ink",
      blurb: "Editorial. Warm paper, amber accent, Fraunces headings with real optical sizing.",
      fonts: { display: "Fraunces", body: "Inter", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "4px", "--radius-sm": "3px", "--chip-radius": "2px", "--maxw": "1000px", "--h-tracking": "-0.01em", "--h-scale": "1.04" }),
        dark:  mode("#e8b45c", "#14120f", "#191713", "#1f1c17", "#27231d", "#f2ece1", "#c4bcae", "#8a8275", "#2e2a23", "#403a30", "#f2777a", "#e3b341"),
        light: mode("#9a6b12", "#fdfbf6", "#f6f1e6", "#ffffff", "#f2ece0", "#1a1712", "#4a4438", "#756c5c", "#e6dfd0", "#cec4b0", "#a52a2a", "#8a6100")
      }
    },
    {
      id: "terminal",
      name: "Terminal",
      blurb: "Monospace everything, phosphor green, square corners. Unapologetically a developer's page.",
      fonts: { display: "IBM Plex Mono", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "2px", "--radius-sm": "2px", "--chip-radius": "2px", "--maxw": "980px", "--h-tracking": "0em", "--h-weight": "600", "--line-height": "1.65" }),
        dark:  mode("#4ade80", "#0a0f0c", "#0e140f", "#121a14", "#17211a", "#d8f0dd", "#a3bda9", "#6f8875", "#1e2b21", "#2c3d30", "#ff6b6b", "#e3b341"),
        light: mode("#15803d", "#f7faf7", "#eef4ef", "#ffffff", "#e9f0ea", "#0f1710", "#3d4a40", "#66756a", "#dbe5dc", "#bcc9be", "#c62828", "#7a5900")
      }
    },
    {
      id: "sapphire",
      name: "Sapphire",
      blurb: "Corporate-clean blue with soft, generous rounding. Reads well to non-technical reviewers.",
      fonts: { display: "Manrope", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "18px", "--radius-sm": "10px", "--chip-radius": "999px", "--maxw": "1120px", "--gap": "1.25rem" }),
        dark:  mode("#5b9dff", "#0b1020", "#0f1528", "#141b33", "#1b2440", "#e6ecff", "#b0bcd9", "#7885a8", "#212c4d", "#2f3d64", "#ff6b6b", "#e3b341"),
        light: mode("#1f5fd0", "#fbfcff", "#f1f4fb", "#ffffff", "#eef2fa", "#101528", "#414a63", "#6b7590", "#e0e6f2", "#c4cde0", "#c62828", "#8a6100")
      }
    },
    {
      id: "crimson",
      name: "Crimson",
      blurb: "Heavier headings, rust-red accent, tight corners. Loud without being a template.",
      fonts: { display: "Archivo", body: "Inter", mono: "Space Mono" },
      vars: {
        common: shape({ "--radius": "6px", "--radius-sm": "4px", "--chip-radius": "3px", "--maxw": "1040px", "--h-weight": "700", "--h-tracking": "-0.03em" }),
        dark:  mode("#ff6b5e", "#120e0e", "#171212", "#1d1616", "#251c1c", "#f5eae8", "#c8b6b3", "#8f7f7c", "#2c2120", "#3e2e2c", "#ff8a80", "#e3b341"),
        light: mode("#c33a2c", "#fdfaf9", "#f6efed", "#ffffff", "#f3eae8", "#1a1211", "#4d3f3d", "#7a6a67", "#ecdfdc", "#d4c2be", "#b3261e", "#8a6100")
      }
    },
    {
      id: "sage",
      name: "Sage",
      blurb: "Low-contrast olive and sand with a serif display face. Calm, slightly academic.",
      fonts: { display: "Instrument Serif", body: "Karla", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "10px", "--radius-sm": "6px", "--maxw": "980px", "--h-weight": "400", "--h-tracking": "0em", "--h-scale": "1.08", "--line-height": "1.75" }),
        dark:  mode("#a3b18a", "#14170f", "#191d13", "#1e2318", "#262c1f", "#eaeee0", "#bcc4ac", "#868e78", "#2a3120", "#3a432e", "#e08b7d", "#d9b45c"),
        light: mode("#55632f", "#faf9f4", "#f1f0e6", "#ffffff", "#eeece0", "#171a10", "#464b39", "#6f7560", "#e4e2d2", "#c9c7b4", "#a83a2a", "#7a5f10")
      }
    },
    {
      id: "slate",
      name: "Slate Mono",
      blurb: "No colour at all — square corners, mono display face, contrast doing all the work.",
      fonts: { display: "Space Mono", body: "Work Sans", mono: "Space Mono" },
      vars: {
        common: shape({ "--radius": "0px", "--radius-sm": "0px", "--chip-radius": "0px", "--maxw": "1000px", "--h-tracking": "-0.01em", "--h-weight": "700" }),
        dark:  mode("#cbd5e1", "#0b0f14", "#10151b", "#151b22", "#1c232b", "#e7ecf1", "#aab6c2", "#74808c", "#222a33", "#313c47", "#ff6b6b", "#e3b341"),
        light: mode("#334155", "#fafafa", "#f2f3f4", "#ffffff", "#eeeff1", "#0f1418", "#414a52", "#6b7480", "#e3e5e8", "#c8ccd1", "#c62828", "#8a6100")
      }
    },
    {
      id: "violet",
      name: "Violet",
      blurb: "Soft purple, big rounding, friendly geometric sans. Modern product-designer energy.",
      fonts: { display: "Outfit", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "20px", "--radius-sm": "12px", "--chip-radius": "999px", "--gap": "1.2rem" }),
        dark:  mode("#a78bfa", "#0f0d18", "#14111f", "#191527", "#211c33", "#ece9f7", "#bab3d0", "#857da0", "#272138", "#372f4e", "#ff7a90", "#e3b341"),
        light: mode("#6d28d9", "#fcfbff", "#f4f1fb", "#ffffff", "#f1edfa", "#150f22", "#453d5c", "#6f6688", "#e8e3f4", "#cfc6e4", "#c2185b", "#8a6100")
      }
    },
    {
      id: "frost",
      name: "Frost",
      blurb: "Nordic blue-grey. Lighter dark mode than most — easy on the eyes for long reads.",
      fonts: { display: "Inter", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "8px", "--radius-sm": "6px", "--maxw": "1040px", "--h-tracking": "-0.025em", "--h-weight": "700" }),
        dark:  mode("#88c0d0", "#2e3440", "#333a47", "#3b4252", "#434c5e", "#eceff4", "#d8dee9", "#a9b3c4", "#4c566a", "#5b667c", "#bf616a", "#ebcb8b"),
        light: mode("#2e6d80", "#f7f9fb", "#eceff4", "#ffffff", "#e5e9f0", "#2e3440", "#4c566a", "#6d788c", "#dde3ea", "#c3ccd8", "#a3313c", "#7a5c00")
      }
    },
    {
      id: "press",
      name: "Press",
      blurb: "Broadsheet. High-contrast Playfair headlines, hairline rules, no rounding anywhere.",
      fonts: { display: "Playfair Display", body: "Source Sans 3", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "0px", "--radius-sm": "0px", "--chip-radius": "0px", "--maxw": "940px", "--h-scale": "1.15", "--h-weight": "700", "--h-tracking": "-0.015em", "--line-height": "1.72" }),
        dark:  mode("#d4a373", "#101010", "#161616", "#1c1c1c", "#242424", "#f2f2f0", "#c0c0bc", "#8a8a86", "#2a2a2a", "#3b3b3b", "#e5726b", "#dcb45c"),
        light: mode("#8a5a2b", "#ffffff", "#f5f4f1", "#ffffff", "#f0efec", "#111111", "#444444", "#6f6f6f", "#e5e4e0", "#cccbc6", "#b3261e", "#7a5900")
      }
    }
  ];

  /* ------------------------------------------------------------------
     WHAT THE THEME BUILDER EXPOSES
     scope "mode"   → edited separately for dark and light
     scope "common" → shared by both modes
     ------------------------------------------------------------------ */
  const VAR_GROUPS = [
    {
      group: "Accent", scope: "mode",
      note: "Hover, tint and on-accent text colours are derived from this automatically.",
      vars: [{ key: "--accent", label: "Accent", type: "color" }]
    },
    {
      group: "Surfaces", scope: "mode",
      vars: [
        { key: "--bg", label: "Page", type: "color" },
        { key: "--bg-alt", label: "Alt band", type: "color" },
        { key: "--surface", label: "Card", type: "color" },
        { key: "--surface-2", label: "Chip / input", type: "color" }
      ]
    },
    {
      group: "Text", scope: "mode",
      vars: [
        { key: "--text", label: "Headings", type: "color" },
        { key: "--text-mid", label: "Body", type: "color" },
        { key: "--text-dim", label: "Muted", type: "color" }
      ]
    },
    {
      group: "Lines", scope: "mode",
      vars: [
        { key: "--border", label: "Border", type: "color" },
        { key: "--border-2", label: "Border (hover)", type: "color" }
      ]
    },
    {
      group: "Shape", scope: "common",
      vars: [
        { key: "--radius", label: "Card radius", type: "px", min: 0, max: 28, step: 1 },
        { key: "--radius-sm", label: "Button radius", type: "px", min: 0, max: 20, step: 1 },
        { key: "--chip-radius", label: "Chip radius", type: "px", min: 0, max: 999, step: 1 },
        { key: "--maxw", label: "Content width", type: "px", min: 820, max: 1400, step: 20 }
      ]
    },
    {
      group: "Type", scope: "common",
      vars: [
        { key: "--fs-scale", label: "Overall size", type: "ratio", min: 0.85, max: 1.25, step: 0.01 },
        { key: "--h-scale", label: "Heading size", type: "ratio", min: 0.85, max: 1.35, step: 0.01 },
        { key: "--line-height", label: "Line height", type: "ratio", min: 1.4, max: 2, step: 0.02 },
        { key: "--h-weight", label: "Heading weight", type: "select", options: ["400", "500", "600", "700", "800"] },
        { key: "--h-tracking", label: "Heading tracking", type: "em", min: -0.05, max: 0.04, step: 0.005 }
      ]
    },
    {
      group: "Density", scope: "common",
      vars: [
        { key: "--section-y", label: "Section padding", type: "raw" },
        { key: "--gap", label: "Grid gap", type: "raw" }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     PRINT / PDF LAYOUTS — CSS classes on the print root in index.html
     ------------------------------------------------------------------ */
  const PDF_TEMPLATES = [
    { id: "compact", name: "Compact", blurb: "One column, dense. The most content per page — good for a long history.",
      sketch: ["███████████████  name", "─────────────────", "EXPERIENCE", "▪ role ─────  date", "  • bullet", "  • bullet", "PROJECTS", "▪ title ────  tags"] },
    { id: "sidebar", name: "Sidebar", blurb: "Two columns. Contact, skills and certifications sit in a left rail.",
      sketch: ["████████  name", "┌────┬──────────┐", "│cont│EXPERIENCE│", "│skil│▪ role    │", "│cert│  • bullet│", "│edu │PROJECTS  │", "└────┴──────────┘"] },
    { id: "classic", name: "Classic", blurb: "Centred header, serif headings, roomy leading. The conventional choice.",
      sketch: ["    NAME", "  title · contact", "═════════════════", "   EXPERIENCE", "▪ role       date", "  • bullet"] },
    { id: "timeline", name: "Timeline", blurb: "Dates in a left gutter with a rule down the page. Reads as a career arc.",
      sketch: ["███████████  name", "2026 │ ▪ role", "     │   • bullet", "2022 │ ▪ role", "     │   • bullet"] },
    { id: "minimal", name: "Minimal", blurb: "No rules, no colour, no chips. Text and whitespace only — ATS-safest.",
      sketch: ["name", "title · contact", "", "EXPERIENCE", "role, company   date", "  bullet"] }
  ];

  /* ------------------------------------------------------------------
     LAYOUTS AVAILABLE TO CUSTOM SECTIONS
     ------------------------------------------------------------------ */
  const SECTION_LAYOUTS = [
    { id: "cards", name: "Cards", blurb: "Grid of cards. Talks, awards, side projects, open-source work." },
    { id: "timeline", name: "Timeline", blurb: "Dated vertical run, like Experience. Milestones, volunteering, roles." },
    { id: "list", name: "List", blurb: "Compact rows with the date on the right. Publications, mentions, courses." },
    { id: "prose", name: "Prose", blurb: "Plain paragraphs. A longer narrative or a statement." },
    { id: "gallery", name: "Gallery", blurb: "Image grid with captions. Screenshots, diagrams, certificates." }
  ];

  /* ------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------ */
  function themeById(id, custom) {
    const all = (Array.isArray(custom) ? custom : []).concat(THEMES);
    for (let i = 0; i < all.length; i++) if (all[i] && all[i].id === id) return all[i];
    return THEMES[0];
  }

  /* Merge a data.json theme block over its preset. Never mutates either. */
  function resolveTheme(cfg) {
    cfg = cfg && typeof cfg === "object" ? cfg : {};
    const base = themeById(cfg.preset, cfg.templates);
    const bv = base.vars || {};
    const cv = cfg.vars && typeof cfg.vars === "object" ? cfg.vars : {};
    return {
      id: base.id,
      name: base.name,
      blurb: base.blurb,
      fonts: Object.assign({ display: "Inter", body: "Inter", mono: "JetBrains Mono" }, base.fonts, cfg.fonts || {}),
      vars: {
        common: Object.assign({}, shape(), bv.common, cv.common || {}),
        dark: Object.assign({}, bv.dark, cv.dark || {}),
        light: Object.assign({}, bv.light, cv.light || {})
      }
    };
  }

  function fontStack(name) {
    const meta = FONTS[name];
    const fallback = STACKS[(meta && meta.kind) || "sans"];
    return name ? '"' + name + '", ' + fallback : fallback;
  }

  /* One <link> for all three families. */
  function fontHref(fonts) {
    const wanted = [];
    ["display", "body", "mono"].forEach(function (role) {
      const meta = FONTS[fonts[role]];
      if (meta && wanted.indexOf(meta.spec) === -1) wanted.push(meta.spec);
    });
    if (!wanted.length) return null;
    return "https://fonts.googleapis.com/css2?family=" + wanted.join("&family=") + "&display=swap";
  }

  /* WCAG relative luminance → black or white text on top of the accent. */
  function luminance(hex) {
    const m = String(hex || "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return 0;
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const channel = function (v) {
      const c = parseInt(v, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(h.slice(0, 2)) + 0.7152 * channel(h.slice(2, 4)) + 0.0722 * channel(h.slice(4, 6));
  }

  /* Black or white on top of the accent, whichever actually contrasts more.
     0.1791 is the crossover where the two are equal — it solves
     1.05 / (L + 0.05) == (L + 0.05) / 0.05. Guessing a threshold here is how
     you end up with white-on-olive at 2.3:1. */
  const CONTRAST_CROSSOVER = 0.1791;
  const onAccent = (accent) => (luminance(accent) > CONTRAST_CROSSOVER ? "#0a0f0d" : "#ffffff");

  /* Apply a resolved theme to a document. Inline styles on <html> beat the
     stylesheet defaults, so this wins without !important. Called again on
     every light/dark toggle. */
  function applyTheme(doc, resolved, themeMode) {
    if (!doc || !resolved) return;
    const el = doc.documentElement;
    const m = themeMode === "light" ? "light" : "dark";
    const vars = Object.assign({}, resolved.vars.common, resolved.vars[m] || {});

    vars["--font-display"] = fontStack(resolved.fonts.display);
    vars["--font-body"] = fontStack(resolved.fonts.body);
    vars["--font-mono"] = fontStack(resolved.fonts.mono);
    vars["--accent-lift"] = m === "dark" ? "#ffffff" : "#000000";
    vars["--on-accent"] = onAccent(vars["--accent"]);

    Object.keys(vars).forEach(function (k) {
      if (vars[k] == null || vars[k] === "") return;
      el.style.setProperty(k, String(vars[k]));
    });

    const href = fontHref(resolved.fonts);
    if (href) {
      let link = doc.getElementById("theme-fonts");
      if (!link) {
        link = doc.createElement("link");
        link.id = "theme-fonts";
        link.rel = "stylesheet";
        doc.head.appendChild(link);
      }
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    }
    return vars;
  }

  root.PortfolioThemes = {
    FONTS: FONTS,
    THEMES: THEMES,
    VAR_GROUPS: VAR_GROUPS,
    PDF_TEMPLATES: PDF_TEMPLATES,
    SECTION_LAYOUTS: SECTION_LAYOUTS,
    themeById: themeById,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    fontStack: fontStack,
    fontHref: fontHref,
    onAccent: onAccent,
    luminance: luminance,
    defaultShape: shape
  };
})(typeof window !== "undefined" ? window : this);
