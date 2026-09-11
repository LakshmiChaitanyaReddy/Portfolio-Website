/* ==========================================================================
   layouts.js — how a custom section draws itself.

   A layout is one object: { id, name, blurb, fields, render(section, ctx) }.
   Add one here and it immediately appears in admin.html's layout picker and
   becomes usable from data.json. Nothing else to wire up.

   Every item supports the same optional fields, and each layout uses the
   ones it cares about:
     title  subtitle  meta  value  body  bullets[]  tags[]
     image { src, alt }   links [{ label, url, icon }]   icon

   ctx (supplied by render.js) provides:
     el  has  arr  rich  plain  chips  image  links  icon
   ========================================================================== */
(function () {
  "use strict";
  const PF = (window.PF = window.PF || {});
  PF.modules = PF.modules || {};
  PF.provide = PF.provide || function (n, api) { PF[n] = api; PF.modules[n] = true; };

  const delay = function (i, cap) { return "--delay:" + Math.min(i, cap == null ? 6 : cap) * 80 + "ms"; };

  const LAYOUTS = [
    /* ------------------------------------------------------------------ */
    {
      id: "cards",
      name: "Cards",
      blurb: "Grid of cards. Talks, awards, side projects, open-source work.",
      fields: ["title", "subtitle", "meta", "body", "bullets", "tags", "image", "links"],
      render: function (sec, c) {
        return c.el("div", { class: "custom-grid" }, c.arr(sec.items).map(function (it, i) {
          return c.el("article", { class: "custom-card reveal", style: delay(i) },
            c.image(it.image, "custom-cover"),
            c.has(it.meta) && c.el("p", { class: "custom-meta", text: it.meta }),
            c.el("h3", { text: it.title || "Entry" }),
            c.has(it.subtitle) && c.el("p", { class: "custom-sub", text: it.subtitle }),
            c.has(it.body) && c.el("p", { class: "custom-body" }, c.rich(it.body)),
            c.has(it.bullets) && c.el("ul", { class: "tl-list", role: "list", style: "margin-bottom:.9rem" },
              c.arr(it.bullets).map(function (b) { return c.el("li", null, c.rich(b)); })),
            c.links(it.links, "custom-links"),
            c.chips(it.tags, it.title));
        }));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "timeline",
      name: "Timeline",
      blurb: "Dated vertical run, like Experience. Milestones, volunteering, a second track.",
      fields: ["title", "subtitle", "meta", "body", "bullets", "tags", "links"],
      render: function (sec, c) {
        return c.el("ol", { class: "timeline" }, c.arr(sec.items).map(function (it, i) {
          return c.el("li", { class: "tl-item reveal", style: delay(i) },
            c.el("div", { class: "tl-head" },
              c.el("h3", { text: it.title || "Entry" }),
              c.has(it.meta) && c.el("p", { class: "tl-date", text: it.meta })),
            c.has(it.subtitle) && c.el("p", { class: "tl-sub" },
              c.el("span", { class: "tl-company", text: it.subtitle })),
            c.has(it.body) && c.el("p", { class: "tl-summary" }, c.rich(it.body)),
            c.has(it.bullets) && c.el("ul", { class: "tl-list", role: "list" },
              c.arr(it.bullets).map(function (b) { return c.el("li", null, c.rich(b)); })),
            c.links(it.links, "custom-links"),
            c.chips(it.tags, it.title));
        }));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "list",
      name: "List",
      blurb: "Compact rows with the date on the right. Publications, mentions, courses.",
      fields: ["title", "subtitle", "meta", "body", "bullets", "tags", "links"],
      render: function (sec, c) {
        return c.el("div", { class: "row-list" }, c.arr(sec.items).map(function (it, i) {
          return c.el("article", { class: "row-item reveal", style: delay(i, 8) },
            c.el("div", { class: "row-top" },
              c.el("h3", { text: it.title || "Entry" }),
              c.has(it.meta) && c.el("p", { class: "row-meta", text: it.meta })),
            c.has(it.subtitle) && c.el("p", { class: "row-sub", text: it.subtitle }),
            c.has(it.body) && c.el("p", { class: "row-body" }, c.rich(it.body)),
            c.has(it.bullets) && c.el("ul", { class: "tl-list", role: "list", style: "margin-top:.5rem" },
              c.arr(it.bullets).map(function (b) { return c.el("li", null, c.rich(b)); })),
            c.links(it.links, "custom-links"),
            c.chips(it.tags, it.title));
        }));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "prose",
      name: "Prose",
      blurb: "Plain paragraphs. A longer narrative, a statement, a philosophy.",
      fields: ["title", "subtitle", "body", "bullets", "links"],
      render: function (sec, c) {
        return c.el("div", { class: "prose-block about-body reveal" }, c.arr(sec.items).map(function (it) {
          return [
            c.has(it.title) && c.el("h3", { text: it.title }),
            c.has(it.subtitle) && c.el("p", { class: "custom-sub", text: it.subtitle }),
            c.has(it.body) && c.el("p", null, c.rich(it.body)),
            c.has(it.bullets) && c.el("ul", { class: "tl-list", role: "list" },
              c.arr(it.bullets).map(function (b) { return c.el("li", null, c.rich(b)); })),
            c.links(it.links, "custom-links")
          ];
        }));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "gallery",
      name: "Gallery",
      blurb: "Image grid with captions. Screenshots, diagrams, certificates.",
      fields: ["title", "meta", "body", "image", "links"],
      render: function (sec, c) {
        return c.el("div", { class: "gallery-grid" }, c.arr(sec.items).map(function (it, i) {
          const img = c.image(it.image, null);
          if (!img && !c.has(it.title)) return null;
          return c.el("figure", { class: "gallery-figure reveal", style: delay(i, 8) },
            img,
            (c.has(it.title) || c.has(it.body) || c.has(it.meta)) && c.el("figcaption", null,
              c.has(it.title) && c.el("strong", { text: it.title }),
              c.has(it.body) && c.el("span", { text: c.plain(it.body) }),
              c.has(it.meta) && c.el("span", { text: (c.has(it.body) ? " · " : "") + it.meta })));
        }).filter(Boolean));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "stats",
      name: "Stats",
      blurb: "Big numbers with labels. Impact metrics, volumes, uptime, scale.",
      fields: ["value", "title", "body"],
      render: function (sec, c) {
        return c.el("dl", { class: "stat-grid reveal" }, c.arr(sec.items).map(function (it) {
          if (!c.has(it.value) && !c.has(it.title)) return null;
          return c.el("div", { class: "stat-cell" },
            c.el("dt", { text: c.has(it.value) ? it.value : it.title }),
            c.el("dd", null,
              c.has(it.value) && c.has(it.title) && c.el("strong", { text: it.title }),
              c.has(it.body) && c.el("span", { text: c.plain(it.body) })));
        }).filter(Boolean));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "quotes",
      name: "Quotes",
      blurb: "Pull quotes with attribution. Recommendations, feedback, testimonials.",
      fields: ["body", "title", "subtitle", "image", "links"],
      render: function (sec, c) {
        return c.el("div", { class: "quote-grid" }, c.arr(sec.items).map(function (it, i) {
          if (!c.has(it.body) && !c.has(it.title)) return null;
          return c.el("figure", { class: "quote-card reveal", style: delay(i, 5) },
            c.has(it.body) && c.el("blockquote", null, c.el("p", null, c.rich(it.body))),
            (c.has(it.title) || c.has(it.subtitle)) && c.el("figcaption", null,
              c.image(it.image, "quote-avatar"),
              c.el("span", null,
                c.has(it.title) && c.el("strong", { text: it.title }),
                c.has(it.subtitle) && c.el("span", { text: it.subtitle }))),
            c.links(it.links, "custom-links"));
        }).filter(Boolean));
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "table",
      name: "Table",
      blurb: "Two-column rows. Tooling matrices, language levels, availability, rates.",
      fields: ["title", "body", "meta", "tags"],
      render: function (sec, c) {
        const rows = c.arr(sec.items).filter(function (it) { return c.has(it.title) || c.has(it.body); });
        if (!rows.length) return null;
        return c.el("div", { class: "kv-table reveal", role: "table" },
          rows.map(function (it) {
            return c.el("div", { class: "kv-row", role: "row" },
              c.el("span", { class: "kv-key", role: "cell", text: it.title || "" }),
              c.el("span", { class: "kv-val", role: "cell" },
                c.has(it.body) && c.el("span", null, c.rich(it.body)),
                c.chips(it.tags, it.title)),
              c.has(it.meta) && c.el("span", { class: "kv-meta", role: "cell", text: it.meta }));
          }));
      }
    }
  ];

  const INDEX = {};
  LAYOUTS.forEach(function (l) { INDEX[l.id] = l; });

  function render(sec, ctx) {
    const layout = INDEX[sec && sec.layout] || INDEX.cards;
    try { return layout.render(sec, ctx); }
    catch (e) {
      if (window.console && console.error) console.error("[portfolio] layout '" + layout.id + "' failed", e);
      return null;
    }
  }

  PF.provide("layouts", {
    LIST: LAYOUTS,
    byId: function (id) { return INDEX[id] || null; },
    ids: function () { return LAYOUTS.map(function (l) { return l.id; }); },
    render: render
  });
})();
