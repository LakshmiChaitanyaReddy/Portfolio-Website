/* ==========================================================================
   render.js — draws the public site from data.json.

   Built-in sections live here; anything custom is handed to PF.layouts.
   paint() is idempotent: it clears and rebuilds, which is what lets the
   admin's Preview tab re-render on every keystroke.

   The "Save as PDF" button is deliberately NOT here. Resume export lives in
   admin.html — the public page just links to the hosted PDF.
   ========================================================================== */
(function () {
  "use strict";
  const PF = (window.PF = window.PF || {});
  PF.modules = PF.modules || {};
  PF.provide = PF.provide || function (n, api) { PF[n] = api; PF.modules[n] = true; };

  const D = PF.dom, F = PF.fmt;
  const el = D.el, has = D.has, arr = D.arr, append = D.append, clear = D.clear;

  let ANIM = "lift";   // icon animation, set from the theme on each paint

  /* ====================================================================
     SHARED PIECES — also handed to custom layouts as their ctx
     ==================================================================== */
  function icon(spec, opts) {
    if (!has(spec)) return null;
    return PF.icons ? PF.icons.resolve(spec, Object.assign({ anim: ANIM }, opts || {})) : null;
  }

  function image(img, cls) {
    if (!img || !has(img.src)) return null;
    return el("img", {
      class: cls || null, src: img.src, alt: has(img.alt) ? img.alt : "",
      loading: "lazy", decoding: "async"
    });
  }

  function chips(items, label) {
    if (!has(items)) return null;
    return el("ul", { class: "chips", role: "list", "aria-label": label || null },
      arr(items).map(function (t) { return el("li", { class: "chip", text: t }); }));
  }

  function links(list, cls) {
    const usable = arr(list).filter(function (l) { return has(l.url); });
    if (!usable.length) return null;
    return el("p", { class: cls },
      usable.map(function (l) {
        return el("a", { href: l.url, target: "_blank", rel: "noopener noreferrer" },
          icon(l.icon || (PF.icons ? PF.icons.guess(l.label, l.url) : null)),
          el("span", { text: l.label || l.url }));
      }));
  }

  const CTX = {
    el: el, has: has, arr: arr, chips: chips, image: image, links: links, icon: icon,
    rich: function (s) { return F.rich(s); },
    plain: F.plain
  };

  function sectionHead(eyebrow, title, id, blurb) {
    return el("div", { class: "section-head reveal" },
      has(eyebrow) && el("p", { class: "eyebrow", text: eyebrow }),
      el("h2", { id: id, text: title }),
      has(blurb) && el("p", null, F.tokens(blurb)));
  }

  function wrap(id, cls, labelledBy, children) {
    return el("section", { id: id, class: cls, "aria-labelledby": labelledBy },
      el("div", { class: "container" }, children));
  }

  /* ====================================================================
     BUILT-IN SECTIONS
     ==================================================================== */
  function hero(d, refs) {
    const p = d.profile, t = F.totals();
    const stats = [
      has(t.years) && { n: t.years, label: "Years on the ServiceNow platform" },
      arr(d.projects).length > 0 && { n: String(arr(d.projects).length), label: "Implementations delivered" },
      arr(d.certifications).length > 0 && { n: String(arr(d.certifications).length), label: "ServiceNow certifications" },
      arr(d.skills).length > 0 && {
        n: String(arr(d.skills).reduce(function (s, g) { return s + arr(g.items).length; }, 0)),
        label: "Platform capabilities"
      }
    ].filter(Boolean);

    const certs = arr(d.certifications).map(function (c) { return c.abbr || c.name; }).filter(has);

    let resumeBtn = null;
    if (has(p.resumeUrl)) {
      resumeBtn = el("a", { class: "btn btn-ghost", href: p.resumeUrl, download: true },
        icon("download"), "Download Resume");
      if (refs && typeof refs.guard === "function") resumeBtn = refs.guard(resumeBtn, p.resumeUrl);
    }

    return el("section", { id: "top", class: "hero", "aria-labelledby": "hero-title" },
      el("div", { class: "container" },
        image(p.photo, "hero-photo reveal"),
        has(p.status) && el("p", { class: "hero-tag reveal" },
          el("span", { class: "pulse", "aria-hidden": "true" }), p.status),
        el("h1", { id: "hero-title", class: "reveal", style: "--delay:60ms", text: p.name || "" }),
        has(p.title) && el("p", { class: "hero-role reveal", style: "--delay:120ms", text: p.title }),
        has(p.tagline) && el("p", { class: "hero-pitch reveal", style: "--delay:180ms" }, F.rich(p.tagline)),
        (has(p.location) || certs.length) && el("p", { class: "hero-meta reveal", style: "--delay:220ms" },
          has(p.location) && el("span", null, icon("map-pin"), p.location),
          certs.length > 0 && el("span", null, icon("badge-check"), certs.join(" · "))),
        (has(p.email) || resumeBtn) && el("div", { class: "hero-cta reveal", style: "--delay:280ms" },
          has(p.email) && el("a", { class: "btn btn-primary", href: "mailto:" + p.email },
            icon("mail"), "Get in touch"),
          resumeBtn),
        stats.length > 0 && el("dl", { class: "hero-stats reveal", style: "--delay:340ms" },
          stats.map(function (s) {
            return el("div", null, el("dt", { text: s.n }), el("dd", { text: s.label }));
          }))));
  }

  function about(d) {
    const p = d.profile;
    const current = arr(d.experience).filter(function (j) { return !has(j.endDate); })[0] ||
                    F.byStartDesc(d.experience, "startDate")[0];
    const t = F.totals();
    const facts = [
      has(p.location) && ["Based in", p.location],
      current && has(current.company) && ["Current role", [current.role, current.company].filter(has).join(", ")],
      arr(d.skills).length > 0 && ["Focus areas", arr(d.skills).map(function (g) { return g.category; }).filter(has).slice(0, 3).join(" · ")],
      arr(d.certifications).length > 0 && ["Certified", arr(d.certifications).map(function (c) { return c.abbr || c.name; }).filter(has).join(", ")],
      t.months > 0 && ["Experience", F.fmtDuration(t.months)]
    ].filter(Boolean);

    return wrap("about", "section-alt", "about-title", [
      sectionHead("About", "Platform engineering, not just configuration", "about-title"),
      el("div", { class: "about-grid" },
        el("div", { class: "about-body reveal" }, arr(p.about).map(function (x) { return el("p", null, F.rich(x)); })),
        facts.length > 0 && el("aside", { class: "facts reveal", style: "--delay:120ms", "aria-label": "Quick facts" },
          el("h3", { text: "Quick facts" }),
          el("dl", null, facts.map(function (f) {
            return el("div", null, el("dt", { text: f[0] }), el("dd", { text: f[1] }));
          }))))
    ]);
  }

  function skills(d) {
    return wrap("skills", null, "skills-title", [
      sectionHead("Skills", "What I work with", "skills-title",
        "Grouped by where it sits in the stack — platform modules, the code underneath, and the tooling around it."),
      el("div", { class: "skill-grid" },
        arr(d.skills).map(function (g, i) {
          return el("article", { class: "skill-card reveal", style: "--delay:" + i * 80 + "ms" },
            el("h3", null, icon(g.icon), g.category || "Skills"),
            chips(g.items, g.category));
        }))
    ]);
  }

  function experience(d) {
    return wrap("experience", "section-alt", "experience-title", [
      sectionHead("Experience", "Where I've built things", "experience-title"),
      el("ol", { class: "timeline" },
        F.byStartDesc(d.experience, "startDate").map(function (job, i) {
          const current = !has(job.endDate) && has(job.startDate);
          const range = F.fmtRange(job.startDate, job.endDate);
          const dur = F.fmtDuration(F.monthsBetween(job.startDate, job.endDate));
          const meta = [
            has(job.company) && el("span", { class: "tl-company", text: job.company }),
            has(dur) && el("span", { class: "tl-dur", text: dur }),
            has(job.location) && el("span", { text: job.location })
          ].filter(Boolean);

          return el("li", {
              class: "tl-item reveal" + (current ? " is-current" : ""),
              style: "--delay:" + i * 100 + "ms"
            },
            el("div", { class: "tl-head" },
              el("h3", { text: job.role || job.company || "Role" }),
              has(range) && el("p", { class: "tl-date", text: range })),
            meta.length > 0 && el("p", { class: "tl-sub" },
              meta.reduce(function (acc, node, idx) {
                return acc.concat(idx ? [el("span", { class: "tl-sep", text: "·" }), node] : [node]);
              }, [])),
            has(job.summary) && el("p", { class: "tl-summary" }, F.rich(job.summary)),
            has(job.highlights) && el("ul", { class: "tl-list", role: "list" },
              arr(job.highlights).map(function (h) { return el("li", null, F.rich(h)); })),
            chips(job.tech, (job.company || "Role") + " technologies"));
        }))
    ]);
  }

  function projects(d) {
    const ordered = arr(d.projects).slice().sort(function (a, b) {
      return (b.featured === true) - (a.featured === true);
    });

    const counts = new Map();
    ordered.forEach(function (p) { arr(p.tech).forEach(function (t) { counts.set(t, (counts.get(t) || 0) + 1); }); });
    const techs = Array.from(counts.keys()).sort(function (a, b) {
      return counts.get(b) - counts.get(a) || a.localeCompare(b);
    });

    const cards = [];
    const grid = el("div", { class: "project-grid" }, ordered.map(function (p, i) {
      const pap = [
        has(p.problem) && ["Problem", p.problem, ""],
        has(p.approach) && ["Approach", p.approach, ""],
        has(p.result) && ["Result", p.result, "is-result"]
      ].filter(Boolean);

      const node = el("article", {
          class: "project-card reveal" + (p.featured ? " is-featured" : ""),
          style: "--delay:" + Math.min(i, 4) * 80 + "ms"
        },
        image(p.image, "project-cover"),
        el("div", { class: "project-top" },
          el("span", { class: "project-num", text: String(i + 1).padStart(2, "0") }),
          p.featured === true && el("span", { class: "featured-flag", text: "Featured" })),
        el("h3", { text: p.title || "Project" }),
        has(p.blurb) && el("p", { class: "project-blurb" }, F.rich(p.blurb)),
        pap.length > 0 && el("dl", { class: "pap" }, pap.map(function (row) {
          return el("div", { class: row[2] || null },
            el("dt", { text: row[0] }), el("dd", null, F.rich(row[1])));
        })),
        links(p.links, "project-links"),
        chips(p.tech, (p.title || "Project") + " technologies"));

      cards.push({ node: node, tech: arr(p.tech) });
      return node;
    }));

    const status = el("p", { class: "filter-status", role: "status", "aria-live": "polite" });
    const buttons = [];

    function applyFilter(tech, pressed) {
      let shown = 0;
      cards.forEach(function (c) {
        const match = tech === null || c.tech.indexOf(tech) !== -1;
        c.node.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === pressed)); });
      status.textContent = "Showing " + shown + " of " + cards.length + " projects" +
        (tech ? " tagged “" + tech + "”" : "");
    }

    const bar = techs.length > 0 && el("div", {
        class: "filter-bar reveal", role: "group", "aria-label": "Filter projects by technology"
      },
      [null].concat(techs).map(function (tech) {
        const btn = el("button", {
          type: "button", class: "filter-btn",
          "aria-pressed": String(tech === null),
          text: tech === null ? "All" : tech,
          onclick: function () { applyFilter(tech, btn); }
        });
        buttons.push(btn);
        return btn;
      }));

    if (techs.length) applyFilter(null, buttons[0]);

    return wrap("projects", null, "projects-title", [
      sectionHead("Projects", "Selected implementations", "projects-title",
        "Each one framed the way I think about delivery: what was broken, what I built, and what changed afterwards."),
      bar, techs.length > 0 && status, grid
    ]);
  }

  function certifications(d) {
    return wrap("certifications", "section-alt", "certifications-title", [
      sectionHead("Certifications", "Certified and current", "certifications-title"),
      el("div", { class: "cert-grid" }, arr(d.certifications).map(function (c, i) {
        const sub = [c.abbr, c.issuer, c.year].filter(has);
        return el("article", { class: "cert-card reveal", style: "--delay:" + i * 80 + "ms" },
          el("span", { class: "cert-badge", "aria-hidden": "true" }, icon(c.icon || "shield-check")),
          el("div", null,
            el("h3", { text: c.name || "Certification" }),
            sub.length > 0 && el("p", null,
              has(c.abbr) && el("span", { class: "cert-code", text: c.abbr }),
              sub.slice(has(c.abbr) ? 1 : 0).map(function (s, j) {
                return (j || has(c.abbr) ? " · " : "") + s;
              }).join("")),
            has(c.credentialUrl) && el("a", {
                class: "cert-verify", href: c.credentialUrl, target: "_blank", rel: "noopener noreferrer"
              }, icon("external-link"), "Verify credential",
              el("span", { class: "visually-hidden", text: " — " + (c.name || "certification") }))));
      }))
    ]);
  }

  function education(d) {
    return wrap("education", null, "education-title", [
      sectionHead("Education", "Academic background", "education-title"),
      el("div", { class: "edu-list" }, F.byStartDesc(d.education, "startYear").map(function (e, i) {
        const range = F.fmtRange(e.startYear, e.endYear);
        return el("article", { class: "edu-card reveal", style: "--delay:" + i * 80 + "ms" },
          el("div", { class: "edu-top" },
            el("h3", { text: e.degree || e.institution || "Education" }),
            has(range) && el("p", { class: "edu-date", text: range })),
          has(e.degree) && has(e.institution) && el("p", { text: e.institution }),
          has(e.detail) && el("p", { class: "edu-detail", text: e.detail }));
      }))
    ]);
  }

  function customSection(sec, id) {
    const titleId = id + "-title";
    return wrap(id, sec.altBackground === true ? "section-alt" : null, titleId, [
      sectionHead(sec.eyebrow || sec.title, sec.title || "Section", titleId, sec.blurb),
      PF.layouts ? PF.layouts.render(sec, CTX) : null
    ]);
  }

  function contact(d, footer, refs) {
    const p = d.profile;
    const items = [
      has(p.email) && { href: "mailto:" + p.email, icon: "mail", text: p.email },
      has(p.phone) && { href: "tel:" + String(p.phone).replace(/[^\d+]/g, ""), icon: "phone", text: p.phone }
    ].filter(Boolean)
     .concat(arr(p.links).filter(function (l) { return has(l.url); }).map(function (l) {
        return { href: l.url, icon: l.icon || (PF.icons ? PF.icons.guess(l.label, l.url) : "link"),
                 text: l.label || l.url, external: true };
     }))
     .concat(has(p.resumeUrl)
        ? [{ href: p.resumeUrl, icon: "file-down", text: "Download Resume (PDF)", download: true, guard: true }] : []);

    append(footer, [el("div", { class: "container" },
      el("div", { class: "footer-cta reveal" },
        el("p", { class: "eyebrow", text: "Contact" }),
        el("h2", { id: "contact-title", text: "Let's talk ServiceNow" }),
        el("p", { text: "Happy to discuss platform work, integration design or a role — the inbox is the fastest way to reach me." })),
      items.length > 0 && el("ul", { class: "contact-list reveal", role: "list", style: "--delay:80ms" },
        items.map(function (it) {
          const a = el("a", {
            href: it.href,
            target: it.external ? "_blank" : null,
            rel: it.external ? "noopener noreferrer" : null,
            download: it.download ? true : null
          }, icon(it.icon), el("span", { text: it.text }));
          const node = (it.guard && refs && typeof refs.guard === "function") ? refs.guard(a, it.href) : a;
          return el("li", null, node);
        })),
      el("div", { class: "footer-bottom" },
        el("p", { text: "© " + new Date().getFullYear() + (has(p.name) ? " " + p.name : "") }),
        el("a", { href: "#top", text: "Back to top ↑" })))]);
    footer.setAttribute("aria-labelledby", "contact-title");
    footer.hidden = false;
  }

  /* ====================================================================
     SECTION LIST — built-ins that have data, plus customs, ordered
     ==================================================================== */
  function sectionList(d) {
    const builtins = [
      { id: "about", label: "About", when: function () { return has(d.profile.about); }, render: function () { return about(d); } },
      { id: "skills", label: "Skills", when: function () { return arr(d.skills).length > 0; }, render: function () { return skills(d); } },
      { id: "experience", label: "Experience", when: function () { return arr(d.experience).length > 0; }, render: function () { return experience(d); } },
      { id: "projects", label: "Projects", when: function () { return arr(d.projects).length > 0; }, render: function () { return projects(d); } },
      { id: "certifications", label: "Certifications", when: function () { return arr(d.certifications).length > 0; }, render: function () { return certifications(d); } },
      { id: "education", label: "Education", when: function () { return arr(d.education).length > 0; }, render: function () { return education(d); } }
    ].filter(function (s) { try { return s.when(); } catch (e) { return false; } });

    const used = {};
    builtins.forEach(function (b) { used[b.id] = true; });

    const customs = arr(d.sections).filter(function (s) {
      return has(s.title) && arr(s.items).length > 0;
    }).map(function (sec) {
      let id = F.slug(sec.id || sec.title);
      while (used[id]) id = id + "-x";        // never collide with a built-in
      used[id] = true;
      return { id: id, label: sec.title, custom: sec, render: function () { return customSection(sec, id); } };
    });

    const hidden = arr(d.hiddenSections).map(String);
    const order = arr(d.sectionOrder).map(String);
    const rank = function (s) { const i = order.indexOf(s.id); return i === -1 ? 9999 : i; };

    const all = builtins.concat(customs)
      .filter(function (s) { return hidden.indexOf(s.id) === -1; })
      .map(function (s, i) { return { s: s, i: i }; })
      .sort(function (a, b) { return (rank(a.s) - rank(b.s)) || (a.i - b.i); })
      .map(function (x) { return x.s; });

    const p = d.profile;
    if ((has(p.email) || has(p.phone) || has(p.links)) && hidden.indexOf("contact") === -1) {
      all.push({ id: "contact", label: "Contact", footer: true });   // always last: it is the footer
    }
    return all;
  }

  /* ====================================================================
     HEAD — title, meta, Open Graph, JSON-LD
     ==================================================================== */
  function setMeta(doc, selector, attr, value) {
    const node = doc.head.querySelector(selector);
    if (node && has(value)) node.setAttribute(attr, value);
  }

  /* Crawlers want an absolute URL. Leave one alone if it already is, and
     join a repo-relative path onto siteUrl — never produce "site.com//path". */
  function absolute(path, base) {
    if (!has(path)) return "";
    const s = String(path).trim();
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s)) return s;
    return base ? base + "/" + s.replace(/^\/+/, "") : s;
  }

  /* The OG image is whichever shape the field was last edited in: a bare path,
     an absolute URL, or the { src, alt } object the admin's upload writes.
     Anything else (a stray object, a number) resolves to no image at all
     rather than stamping "[object Object]" into the meta tag. */
  function ogImageOf(p, base) {
    const raw = p.ogImage;
    const obj = raw && typeof raw === "object" && !Array.isArray(raw);
    const src = obj ? raw.src : (typeof raw === "string" ? raw : "");
    if (!has(src)) return { src: "", alt: "" };
    return { src: absolute(src, base), alt: obj && has(raw.alt) ? raw.alt : "" };
  }

  function head(d, doc) {
    const p = d.profile;
    const who = p.shortName || p.name;
    const desc = F.plain(p.tagline);
    const url = has(p.siteUrl) ? String(p.siteUrl).trim().replace(/\/+$/, "") : "";
    const og = ogImageOf(p, url);

    if (has(who) && has(p.title)) doc.title = who + " | " + p.title;

    setMeta(doc, 'meta[name="description"]', "content", desc);
    setMeta(doc, 'meta[name="author"]', "content", p.name);
    setMeta(doc, 'meta[property="og:title"]', "content", doc.title);
    setMeta(doc, 'meta[property="og:description"]', "content", desc);
    setMeta(doc, 'meta[property="og:url"]', "content", url);
    setMeta(doc, 'meta[property="og:image"]', "content", og.src);
    setMeta(doc, 'meta[property="og:image:alt"]', "content", og.src ? (og.alt || desc) : "");
    /* A large-image card with no image renders as an empty box on X/Twitter;
       downgrade to the text card instead. */
    setMeta(doc, 'meta[name="twitter:card"]', "content", og.src ? "summary_large_image" : "summary");
    setMeta(doc, 'meta[name="twitter:title"]', "content", doc.title);
    setMeta(doc, 'meta[name="twitter:description"]', "content", desc);
    setMeta(doc, 'meta[name="twitter:image"]', "content", og.src);
    setMeta(doc, 'link[rel="canonical"]', "href", url);

    const loc = String(p.location || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    const current = arr(d.experience).filter(function (j) { return !has(j.endDate); })[0];
    const person = { "@context": "https://schema.org", "@type": "Person" };

    if (has(p.name)) person.name = p.name;
    if (has(p.title)) person.jobTitle = p.title;
    if (has(desc)) person.description = desc;
    if (has(p.email)) person.email = "mailto:" + p.email;
    if (has(p.phone)) person.telephone = p.phone;
    if (has(url)) person.url = url;
    if (og.src) person.image = og.src;
    else if (p.photo && has(p.photo.src)) person.image = absolute(p.photo.src, url);
    if (loc.length) {
      person.address = { "@type": "PostalAddress", addressLocality: loc[0] };
      if (loc[1]) person.address.addressCountry = loc[1];
    }
    const sameAs = arr(p.links).map(function (l) { return l.url; })
      .filter(function (u) { return has(u) && /^https?:/i.test(u); });
    if (sameAs.length) person.sameAs = sameAs;
    if (current && has(current.company)) person.worksFor = { "@type": "Organization", name: current.company };
    const knows = arr(d.skills).reduce(function (a, g) { return a.concat(arr(g.items)); }, []);
    if (knows.length) person.knowsAbout = knows;
    const school = F.byStartDesc(d.education, "startYear")[0];
    if (school && has(school.institution)) person.alumniOf = { "@type": "EducationalOrganization", name: school.institution };
    if (arr(d.certifications).length) {
      person.hasCredential = arr(d.certifications).filter(function (c) { return has(c.name); }).map(function (c) {
        const cred = { "@type": "EducationalOccupationalCredential", name: c.name };
        if (has(c.issuer)) cred.recognizedBy = { "@type": "Organization", name: c.issuer };
        if (has(c.credentialUrl)) cred.url = c.credentialUrl;
        return cred;
      });
    }

    const old = doc.getElementById("ld-person");
    if (old) old.remove();
    const script = doc.createElement("script");
    script.type = "application/ld+json";
    script.id = "ld-person";
    script.textContent = JSON.stringify(person);
    doc.head.appendChild(script);
  }

  /* ====================================================================
     PAINT
     ==================================================================== */
  function normalise(data) {
    const d = data && typeof data === "object" ? data : {};
    return {
      theme: d.theme && typeof d.theme === "object" ? d.theme : {},
      pdf: d.pdf && typeof d.pdf === "object" ? d.pdf : {},
      profile: d.profile && typeof d.profile === "object" && !Array.isArray(d.profile) ? d.profile : {},
      experience: arr(d.experience), projects: arr(d.projects), skills: arr(d.skills),
      certifications: arr(d.certifications), education: arr(d.education), sections: arr(d.sections),
      sectionOrder: arr(d.sectionOrder), hiddenSections: arr(d.hiddenSections)
    };
  }

  function paint(data, refs) {
    const d = normalise(data);
    const doc = refs.doc || document;
    F.useTotals(d.experience);
    ANIM = (d.theme && typeof d.theme.iconAnimation === "string") ? d.theme.iconAnimation : "lift";

    clear(refs.main); clear(refs.navList); clear(refs.mobileList); clear(refs.footer);
    refs.footer.hidden = true;

    if (refs.brand) {
      clear(refs.brand);
      const first = String(d.profile.shortName || d.profile.name || "").trim().split(/\s+/)[0] || "portfolio";
      append(refs.brand, [first.toLowerCase(), el("span", { class: "dot", text: "." }), "dev"]);
      refs.brand.setAttribute("aria-label", (d.profile.name || "Home") + " — back to top");
    }

    head(d, doc);
    refs.main.appendChild(hero(d, refs));

    const active = sectionList(d);
    active.forEach(function (s) {
      if (s.footer) contact(d, refs.footer, refs);
      else { const node = s.render(); if (node) refs.main.appendChild(node); }
    });

    [refs.navList, refs.mobileList].forEach(function (list) {
      active.forEach(function (s) {
        list.appendChild(el("li", null, el("a", { href: "#" + s.id, text: s.label })));
      });
    });

    if (PF.icons) PF.icons.paint();
    return { sections: active, data: d };
  }

  PF.provide("render", {
    paint: paint,
    normalise: normalise,
    ctx: CTX,
    sectionList: sectionList,
    head: head
  });
})();
