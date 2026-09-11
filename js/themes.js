/* ==========================================================================
   themes.js — the theme registry.

   A theme is a bag of CSS custom properties applied inline on <html> at
   runtime. index.html and admin.html both declare sane defaults for every
   property, so a missing theme degrades to the default Graphite look.

   Each preset authors only TEN colours per mode. Everything else derives:
     --accent-strong   accent mixed toward white (dark) / black (light)
     --accent-soft     accent at 12% alpha
     --header-bg       page background at 80% alpha
     --on-accent       black or white, chosen by luminance for contrast

   ADDING A PRESET: append one object to THEMES. Nothing else to touch —
   the admin's gallery, the var editor and the validator all read this list.
   ========================================================================== */
(function () {
  "use strict";
  const PF = (window.PF = window.PF || {});
  PF.modules = PF.modules || {};
  PF.provide = PF.provide || function (n, api) { PF[n] = api; PF.modules[n] = true; };

  /* ------------------------------------------------------------------
     FONT CATALOGUE — `spec` is the exact Google Fonts css2 family string.
     Weights matter: Space Mono has no 500, Instrument Serif only has 400.
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
    "DM Sans":             { spec: "DM+Sans:wght@400;500;700", kind: "sans" },

    "Fraunces":            { spec: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700", kind: "serif" },
    "Playfair Display":    { spec: "Playfair+Display:wght@500;600;700", kind: "serif" },
    "Instrument Serif":    { spec: "Instrument+Serif", kind: "serif" },
    "Newsreader":          { spec: "Newsreader:wght@400;500;600", kind: "serif" },
    "Lora":                { spec: "Lora:wght@400;500;600;700", kind: "serif" },
    "Source Serif 4":      { spec: "Source+Serif+4:wght@400;600;700", kind: "serif" },

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

  /* The ten colours a mode needs, in a fixed order. */
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

  const THEMES = [
    {
      id: "graphite", name: "Graphite",
      blurb: "The default. Mint accent on cool charcoal, geometric headings — quiet and engineer-credible.",
      fonts: { display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape(),
        dark:  mode("#5cc8a8", "#0d1117", "#10161f", "#151c26", "#1b2430", "#e8edf4", "#b3bdcb", "#7d8899", "#232d3b", "#303d4e", "#ff6b6b", "#e3b341"),
        light: mode("#0f8a6a", "#fbfbf9", "#f3f4f1", "#ffffff", "#f1f3f0", "#14181d", "#414a55", "#6b7480", "#e2e4e0", "#c9cdc7", "#c62828", "#8a6100")
      }
    },
    {
      id: "ink", name: "Ink",
      blurb: "Editorial. Warm paper, amber accent, Fraunces headings with real optical sizing.",
      fonts: { display: "Fraunces", body: "Inter", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "4px", "--radius-sm": "3px", "--chip-radius": "2px", "--maxw": "1000px", "--h-tracking": "-0.01em", "--h-scale": "1.04" }),
        dark:  mode("#e8b45c", "#14120f", "#191713", "#1f1c17", "#27231d", "#f2ece1", "#c4bcae", "#8a8275", "#2e2a23", "#403a30", "#f2777a", "#e3b341"),
        light: mode("#9a6b12", "#fdfbf6", "#f6f1e6", "#ffffff", "#f2ece0", "#1a1712", "#4a4438", "#756c5c", "#e6dfd0", "#cec4b0", "#a52a2a", "#8a6100")
      }
    },
    {
      id: "terminal", name: "Terminal",
      blurb: "Monospace everything, phosphor green, square corners. Unapologetically a developer's page.",
      fonts: { display: "IBM Plex Mono", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "2px", "--radius-sm": "2px", "--chip-radius": "2px", "--maxw": "980px", "--h-tracking": "0em", "--line-height": "1.65" }),
        dark:  mode("#4ade80", "#0a0f0c", "#0e140f", "#121a14", "#17211a", "#d8f0dd", "#a3bda9", "#6f8875", "#1e2b21", "#2c3d30", "#ff6b6b", "#e3b341"),
        light: mode("#15803d", "#f7faf7", "#eef4ef", "#ffffff", "#e9f0ea", "#0f1710", "#3d4a40", "#66756a", "#dbe5dc", "#bcc9be", "#c62828", "#7a5900")
      }
    },
    {
      id: "sapphire", name: "Sapphire",
      blurb: "Corporate-clean blue with soft, generous rounding. Reads well to non-technical reviewers.",
      fonts: { display: "Manrope", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "18px", "--radius-sm": "10px", "--chip-radius": "999px", "--maxw": "1120px", "--gap": "1.25rem" }),
        dark:  mode("#5b9dff", "#0b1020", "#0f1528", "#141b33", "#1b2440", "#e6ecff", "#b0bcd9", "#7885a8", "#212c4d", "#2f3d64", "#ff6b6b", "#e3b341"),
        light: mode("#1f5fd0", "#fbfcff", "#f1f4fb", "#ffffff", "#eef2fa", "#101528", "#414a63", "#5f6880", "#e0e6f2", "#c4cde0", "#c62828", "#8a6100")
      }
    },
    {
      id: "crimson", name: "Crimson",
      blurb: "Heavier headings, rust-red accent, tight corners. Loud without being a template.",
      fonts: { display: "Archivo", body: "Inter", mono: "Space Mono" },
      vars: {
        common: shape({ "--radius": "6px", "--radius-sm": "4px", "--chip-radius": "3px", "--maxw": "1040px", "--h-weight": "700", "--h-tracking": "-0.03em" }),
        dark:  mode("#ff6b5e", "#120e0e", "#171212", "#1d1616", "#251c1c", "#f5eae8", "#c8b6b3", "#8f7f7c", "#2c2120", "#3e2e2c", "#ff8a80", "#e3b341"),
        light: mode("#c33a2c", "#fdfaf9", "#f6efed", "#ffffff", "#f3eae8", "#1a1211", "#4d3f3d", "#7a6a67", "#ecdfdc", "#d4c2be", "#b3261e", "#8a6100")
      }
    },
    {
      id: "sage", name: "Sage",
      blurb: "Low-contrast olive and sand with a serif display face. Calm, slightly academic.",
      fonts: { display: "Instrument Serif", body: "Karla", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "10px", "--radius-sm": "6px", "--maxw": "980px", "--h-weight": "400", "--h-tracking": "0em", "--h-scale": "1.08", "--line-height": "1.75" }),
        dark:  mode("#a3b18a", "#14170f", "#191d13", "#1e2318", "#262c1f", "#eaeee0", "#bcc4ac", "#868e78", "#2a3120", "#3a432e", "#e08b7d", "#d9b45c"),
        light: mode("#55632f", "#faf9f4", "#f1f0e6", "#ffffff", "#eeece0", "#171a10", "#464b39", "#6f7560", "#e4e2d2", "#c9c7b4", "#a83a2a", "#7a5f10")
      }
    },
    {
      id: "slate", name: "Slate Mono",
      blurb: "No colour at all — square corners, mono display face, contrast doing all the work.",
      fonts: { display: "Space Mono", body: "Work Sans", mono: "Space Mono" },
      vars: {
        common: shape({ "--radius": "0px", "--radius-sm": "0px", "--chip-radius": "0px", "--maxw": "1000px", "--h-tracking": "-0.01em", "--h-weight": "700" }),
        dark:  mode("#cbd5e1", "#0b0f14", "#10151b", "#151b22", "#1c232b", "#e7ecf1", "#aab6c2", "#74808c", "#222a33", "#313c47", "#ff6b6b", "#e3b341"),
        light: mode("#334155", "#fafafa", "#f2f3f4", "#ffffff", "#eeeff1", "#0f1418", "#414a52", "#6b7480", "#e3e5e8", "#c8ccd1", "#c62828", "#8a6100")
      }
    },
    {
      id: "violet", name: "Violet",
      blurb: "Soft purple, big rounding, friendly geometric sans. Modern product-designer energy.",
      fonts: { display: "Outfit", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "20px", "--radius-sm": "12px", "--chip-radius": "999px", "--gap": "1.2rem" }),
        dark:  mode("#a78bfa", "#0f0d18", "#14111f", "#191527", "#211c33", "#ece9f7", "#bab3d0", "#857da0", "#272138", "#372f4e", "#ff7a90", "#e3b341"),
        light: mode("#6d28d9", "#fcfbff", "#f4f1fb", "#ffffff", "#f1edfa", "#150f22", "#453d5c", "#6f6688", "#e8e3f4", "#cfc6e4", "#c2185b", "#8a6100")
      }
    },
    {
      id: "frost", name: "Frost",
      blurb: "Nordic blue-grey. Lighter dark mode than most — easy on the eyes for long reads.",
      fonts: { display: "Inter", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "8px", "--radius-sm": "6px", "--maxw": "1040px", "--h-tracking": "-0.025em", "--h-weight": "700" }),
        dark:  mode("#88c0d0", "#2e3440", "#333a47", "#3b4252", "#434c5e", "#eceff4", "#d8dee9", "#a9b3c4", "#4c566a", "#5b667c", "#bf616a", "#ebcb8b"),
        light: mode("#2e6d80", "#f7f9fb", "#eceff4", "#ffffff", "#e5e9f0", "#2e3440", "#4c566a", "#616b7f", "#dde3ea", "#c3ccd8", "#a3313c", "#7a5c00")
      }
    },
    {
      id: "press", name: "Press",
      blurb: "Broadsheet. High-contrast Playfair headlines, hairline rules, no rounding anywhere.",
      fonts: { display: "Playfair Display", body: "Source Sans 3", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "0px", "--radius-sm": "0px", "--chip-radius": "0px", "--maxw": "940px", "--h-scale": "1.15", "--h-weight": "700", "--h-tracking": "-0.015em", "--line-height": "1.72" }),
        dark:  mode("#d4a373", "#101010", "#161616", "#1c1c1c", "#242424", "#f2f2f0", "#c0c0bc", "#8a8a86", "#2a2a2a", "#3b3b3b", "#e5726b", "#dcb45c"),
        light: mode("#8a5a2b", "#ffffff", "#f5f4f1", "#ffffff", "#f0efec", "#111111", "#444444", "#6f6f6f", "#e5e4e0", "#cccbc6", "#b3261e", "#7a5900")
      }
    },
    {
      id: "carbon", name: "Carbon",
      blurb: "Near-black with a single hot-orange accent. Industrial, high contrast, very little colour.",
      fonts: { display: "Sora", body: "Inter", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "6px", "--radius-sm": "4px", "--chip-radius": "4px", "--maxw": "1060px", "--h-weight": "700", "--h-tracking": "-0.028em" }),
        dark:  mode("#ff7b32", "#0c0c0d", "#121214", "#17181a", "#1f2023", "#f1f1f2", "#b8b9bd", "#7f8084", "#24252a", "#34353c", "#ff6b6b", "#e3b341"),
        light: mode("#c2410c", "#fcfcfc", "#f4f4f5", "#ffffff", "#f0f0f1", "#111113", "#44454a", "#6e6f75", "#e4e4e7", "#c9cace", "#c62828", "#8a6100")
      }
    },
    {
      id: "mint", name: "Mint",
      blurb: "Fresh and airy, tuned light-first. Rounded, generous, low-contrast without being washed out.",
      fonts: { display: "Figtree", body: "Figtree", mono: "Roboto Mono" },
      vars: {
        common: shape({ "--radius": "16px", "--radius-sm": "10px", "--chip-radius": "999px", "--maxw": "1080px", "--line-height": "1.72", "--h-tracking": "-0.022em" }),
        dark:  mode("#34d399", "#0c1512", "#101b17", "#14211c", "#1b2a24", "#e6f4ee", "#b0c8bf", "#7c9690", "#1f312a", "#2d4439", "#ff6b6b", "#e3b341"),
        light: mode("#047857", "#f8fcfa", "#eef7f3", "#ffffff", "#e9f4ef", "#0e1a15", "#3d4f48", "#5a716b", "#dceae4", "#bed4cb", "#c62828", "#8a6100")
      }
    },
    {
      id: "noir", name: "Noir",
      blurb: "Pure black and white, nothing else. Maximum contrast, zero decoration.",
      fonts: { display: "Bricolage Grotesque", body: "Inter", mono: "Space Mono" },
      vars: {
        common: shape({ "--radius": "0px", "--radius-sm": "0px", "--chip-radius": "0px", "--maxw": "960px", "--h-weight": "700", "--h-scale": "1.08", "--h-tracking": "-0.035em" }),
        dark:  mode("#ffffff", "#000000", "#0a0a0a", "#101010", "#1a1a1a", "#ffffff", "#bdbdbd", "#8a8a8a", "#242424", "#3a3a3a", "#ff6b6b", "#e3b341"),
        light: mode("#000000", "#ffffff", "#f4f4f4", "#ffffff", "#eeeeee", "#000000", "#3d3d3d", "#6b6b6b", "#e0e0e0", "#c4c4c4", "#c62828", "#8a6100")
      }
    },
    {
      id: "ocean", name: "Ocean",
      blurb: "Deep navy with a bright sky accent. Roomy line height, comfortable for long text.",
      fonts: { display: "DM Sans", body: "Nunito Sans", mono: "JetBrains Mono" },
      vars: {
        common: shape({ "--radius": "12px", "--radius-sm": "8px", "--maxw": "1100px", "--line-height": "1.75", "--gap": "1.2rem" }),
        dark:  mode("#38bdf8", "#071120", "#0b1728", "#0f1d33", "#16273f", "#e4eefb", "#aabed6", "#74889f", "#1c2d46", "#2a3f5d", "#ff6b6b", "#e3b341"),
        light: mode("#0369a1", "#f9fcff", "#eff6fc", "#ffffff", "#eaf3fa", "#0b1622", "#3c4b5c", "#5d6e7f", "#dde9f2", "#c0d2e0", "#c62828", "#8a6100")
      }
    },
    {
      id: "rose", name: "Rose",
      blurb: "Dusty rose over warm plum, Lora headings. Softer and more personal than the rest.",
      fonts: { display: "Lora", body: "Karla", mono: "IBM Plex Mono" },
      vars: {
        common: shape({ "--radius": "12px", "--radius-sm": "8px", "--maxw": "1000px", "--h-weight": "600", "--h-tracking": "-0.012em", "--line-height": "1.74" }),
        dark:  mode("#e8899f", "#170f12", "#1c1417", "#22181c", "#2b1f24", "#f6ebee", "#cbb6bc", "#947d84", "#2f2226", "#402f35", "#ff6b6b", "#e3b341"),
        light: mode("#a63d59", "#fffafb", "#f8eef1", "#ffffff", "#f5e9ed", "#1a1114", "#4c3b41", "#7a666d", "#eddde2", "#d6bfc6", "#b3261e", "#8a6100")
      }
    },
    {
      id: "solar", name: "Solar",
      blurb: "Solarized. Teal-slate surfaces, ochre accent, cream text — a classic terminal palette.",
      fonts: { display: "Work Sans", body: "Work Sans", mono: "Roboto Mono" },
      vars: {
        common: shape({ "--radius": "5px", "--radius-sm": "4px", "--chip-radius": "3px", "--maxw": "1020px", "--h-tracking": "-0.015em" }),
        dark:  mode("#b58900", "#002b36", "#003440", "#073642", "#0d4250", "#eee8d5", "#b7c3c3", "#839496", "#12495a", "#1d5b6d", "#dc322f", "#cb4b16"),
        light: mode("#856404", "#fdf6e3", "#f5eed8", "#fffdf5", "#f0e9d3", "#073642", "#3f5560", "#586d75", "#e6dfc6", "#cfc7ab", "#c0392b", "#8a6100")
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
      iconAnimation: typeof cfg.iconAnimation === "string" ? cfg.iconAnimation : "lift",
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

  /* One <link> for all three families, each requested once. */
  function fontHref(fonts) {
    const wanted = [];
    ["display", "body", "mono"].forEach(function (role) {
      const meta = FONTS[fonts[role]];
      if (meta && wanted.indexOf(meta.spec) === -1) wanted.push(meta.spec);
    });
    if (!wanted.length) return null;
    return "https://fonts.googleapis.com/css2?family=" + wanted.join("&family=") + "&display=swap";
  }

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

  /* Black or white on the accent, whichever actually contrasts more.
     0.1791 is where the two are equal: 1.05/(L+.05) == (L+.05)/.05.
     Guessing a threshold here is how you get white-on-olive at 2.3:1. */
  const CONTRAST_CROSSOVER = 0.1791;
  const onAccent = function (accent) { return luminance(accent) > CONTRAST_CROSSOVER ? "#0a0f0d" : "#ffffff"; };

  /* Inline styles on <html> beat the stylesheet defaults, so this wins
     without !important. Called again on every light/dark toggle. */
  function applyTheme(doc, resolved, themeMode) {
    if (!doc || !resolved) return null;
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

  function clearTheme(doc) {
    const style = doc.documentElement.style;
    for (let i = style.length - 1; i >= 0; i--) {
      const prop = style[i];
      if (prop.indexOf("--") === 0) style.removeProperty(prop);
    }
  }

  PF.provide("themes", {
    FONTS: FONTS,
    THEMES: THEMES,
    VAR_GROUPS: VAR_GROUPS,
    themeById: themeById,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    clearTheme: clearTheme,
    fontStack: fontStack,
    fontHref: fontHref,
    onAccent: onAccent,
    luminance: luminance,
    defaultShape: shape
  });
})();
