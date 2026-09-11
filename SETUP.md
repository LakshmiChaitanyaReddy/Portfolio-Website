# Setup

## Files — deploy all of these

```
index.html          the public site (shell + CSS only)
admin.html          the private editor (shell + CSS only)
data.json           all content, the chosen theme, resume settings
js/core.js          DOM + date + token helpers, module registry
js/icons.js         brand marks, icon resolver, logo animations
js/themes.js        16 theme presets, font catalogue
js/layouts.js       8 custom-section layouts
js/resume.js        8 resume templates + 8 export formats + resume CSS
js/render.js        site renderer
js/site.js          boot for index.html
js/admin.js         boot for admin.html
assets/             uploaded images land here
SETUP.md
.gitignore          keeps .claude/ and .DS_Store out of a public repo
```

Plus your resume PDF at whatever path `profile.resumeUrl` points to.

**Miss one and you'll know.** Both pages check at boot that every module
arrived and, if not, show a panel naming the missing file instead of silently
half-working. That check exists because `themes.js` once went unpushed and the
site quietly fell back to defaults for days.

---

## 1. Deploy to GitHub Pages

1. Push everything above to the repo root, keeping the `js/` folder:

   ```bash
   git add -A            # -A, not -u: `git commit -a` skips new files,
   git commit -m "…"     # which is how js/ gets left behind
   git push
   ```

2. **Settings → Pages → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Check `data.json`'s `siteUrl` matches the deployed URL.
4. Confirm the deploy is complete — open the live site and make sure no boot
   panel appears, then `curl -I https://…/js/themes.js` and expect `200`.

### Running it locally

Double-clicking `index.html` won't work — browsers block `fetch()` on `file://`,
and the page says so in its error state. Serve it:

```bash
cd "path/to/this/folder"
python3 -m http.server 8000     # then open http://localhost:8000
```

---

## 2. Create the fine-grained token

The admin needs **one permission on one repository**.

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**
2. Name it, set an expiry (90 days is sensible), **Resource owner: your account**
3. **Repository access → Only select repositories →** the repo holding your site
4. **Permissions → Repository permissions → Contents → Read and write.**
   Everything else stays at No access. GitHub adds Metadata: Read-only itself.
5. Generate, copy it once.

Contents: write is what covers both `data.json` and image uploads — there is no
narrower permission that can commit a file.

---

## 3. Using the admin

`https://your-username.github.io/admin.html` → fill in the repo details, paste
the token, **Connect**. The token input clears immediately; the value lives in a
JavaScript variable for the life of the tab and nowhere else.

**Tabs:** Profile · Experience · Projects · Skills · Certifications · Education ·
**Sections** · **Theme** · **Resume** · Preview.

Every list has add, delete, drag-to-reorder by the `⠿` handle, and ↑/↓ buttons
for keyboard use. Tech and skill lists are tag inputs — type, <kbd>Enter</kbd>,
`×` to remove.

### The "4.5+ years" figure

Nothing types that number in. It's counted from the **earliest `startDate` in
Experience** to today, every time the page loads, so it can't go stale. Months
are counted inclusively, the way LinkedIn counts them — June 2022 to September
2026 is 52 months, not 51.

52 ÷ 12 = 4.333…, and how that gets written is a choice, not arithmetic.
**Profile → Experience — how to round it**:

| Option | 52 months reads as | |
|---|---|---|
| **Nearest half year** | `4.5` | How people say it out loud. Can round up a month or two. **← currently set** |
| One decimal, rounded down | `4.3` | Never claims a month you haven't worked. |
| Whole years, rounded down | `4` | The conservative read. |
| Nearest whole year | `4` | No decimal point anywhere. |

The hint under that control spells out the whole chain — *"4 yr 4 mo since June
2022 → nearest half year → renders as 4.5"* — and updates as you change it.

**Profile → Experience — type it in yourself** overrides all of the above with
whatever you type: `4.5`, `~4.5`, `5`. Two things to know:

- Type **just the number**. The copy writes the `+` itself, so `4.5` renders as
  "4.5+ years" and `~4.5` renders as "~4.5+ years".
- An override **stops updating**. Leave the box empty unless the figure has to
  match a printed CV exactly — that's the entire reason it's computed.

`{{years}}` in the tagline or an About paragraph becomes that number;
`{{months}}` becomes the raw month count (`52`). The About panel's "Experience"
fact always shows the exact `4 yr 4 mo`, whatever rounding you pick.

### The footer year

`© 2026 Your Name` is **dynamic** — `new Date().getFullYear()` at page load, in
[js/render.js](js/render.js). It rolls over on its own; there's no year literal
anywhere in the HTML or JS to forget about. It reads the *visitor's* clock, so
someone with a badly-set system date sees their own year. That's the usual
trade-off for not needing a build step, and it's what every static site does.

### Logos and icons

Lucide, the icon CDN, **deleted all its brand icons** in version 1.x — that's why
the GitHub and LinkedIn logos vanished while `mail` and `globe` kept working. Two
things changed as a result: brand marks are now shipped inline in `js/icons.js`,
and the Lucide CDN is pinned to an exact version instead of `@latest`.

Every icon field offers six sources:

| Source | What you enter | Notes |
|---|---|---|
| **Brand mark** | pick from a list | Inline SVG, works offline. GitHub, LinkedIn, Instagram, YouTube, Medium, Slack, X, mail are drawn marks; ~24 others are lettered squares. |
| **Lucide name** | `globe`, `wrench`, … | Any name from [lucide.dev/icons](https://lucide.dev/icons). No brand logos there. |
| **Image URL** | `https://…/logo.svg` | Loaded from that host at page load. |
| **Upload a logo** | choose a file | Resized to 256px, committed to `assets/`. |
| **Letters in a box** | `SN` | A deliberate placeholder — better than a mangled logo. |
| **Paste SVG** | `<svg>…</svg>` | Scripts, `on*` handlers and `javascript:` URLs are stripped. |

Anything unrecognised renders **nothing** rather than a broken glyph.

**Logo animations** live on the Theme tab: None, Lift, Pop, Spin, Swing, Glow,
Draw-in, Float. Each is previewed live, and all of them switch off automatically
for visitors who've asked for reduced motion.

### Images

Any image field (profile photo, project cover, section item, share image) takes
an upload **or** a pasted URL. Uploads are downscaled in the browser to 1600px and
re-encoded to WebP — an 8 MB phone photo becomes about 200 KB — then committed to
`assets/` as their own commit. SVGs and GIFs pass through untouched. Fill in the
**alt text**; leaving it blank produces a warning on save, since an image with no
alt is invisible to a screen reader.

**Share image** (Profile tab) is the picture that appears when the link is pasted
into LinkedIn, Slack or X. 1200×630 is the size everything crops to. It's the one
field that re-encodes to **JPEG** rather than WebP, because not every crawler
decodes WebP. Leave it empty if you don't have one: an empty field renders no
`og:image` at all and downgrades the X card to the text layout, whereas naming a
file that isn't in the repo shows a broken preview to everyone who shares you.
Relative paths are made absolute against **Site URL** before they go in the tag —
crawlers reject relative ones.

### Sections

The **Sections** tab reorders and hides *every* section, built-in or custom, and
is where custom sections are created. Eight layouts:

| Layout | Good for |
|---|---|
| **Cards** | Talks, awards, side projects |
| **Timeline** | Milestones, volunteering, a second track |
| **List** | Publications, mentions, courses — date on the right |
| **Prose** | A longer narrative or statement |
| **Gallery** | Screenshots, diagrams, certificates |
| **Stats** | Big numbers — volumes, uptime, scale |
| **Quotes** | Recommendations and testimonials with attribution |
| **Table** | Tooling matrices, language levels, availability |

Every item shares one optional field set — title, big value, subtitle, meta,
body, bullets, tags, image, links — and each layout uses the ones it needs. A
section with no items never renders and never appears in the nav.

### Themes

Sixteen presets: Graphite, Ink, Terminal, Sapphire, Crimson, Sage, Slate Mono,
Violet, Frost, Press, Carbon, Mint, Noir, Ocean, Rose, Solar. They differ in
palette **and** font pairing **and** corner radius **and** type scale.

From there, change anything: three font pickers over a curated Google Fonts list
(only the families you choose get requested), ten colours per mode, card/button/
chip radius, content width, overall size, heading size, line height, weight,
letter-spacing, section padding and grid gap.

Hover, tint, header backdrop and on-accent text colours are all *derived* from
the accent, so changing one colour updates everything coherently. The on-accent
text colour is picked by luminance so it always lands on the higher-contrast side
of black/white — every preset was audited and all 32 accent/mode pairs clear
4.5:1.

**Save as a template** freezes the current look under a name, stored in
`data.json` alongside the presets. Tick **Preview theme in this editor** to apply
what you're building to the admin chrome too (off by default, so a half-finished
palette can't make the editor unreadable).

### Resume and exports

Resume export lives **here, not on the public site** — the site just links to
your hosted PDF.

Eight layouts: Compact, Sidebar, Classic, Timeline, Minimal, **ATS-safe**, Modern,
Academic. ATS-safe is deliberately plain — one column, no colour, no glyphs,
standard section names, numeric `05/2026 - Present` dates — because applicant
tracking systems parse text, they don't admire layouts.

Eight formats:

| Format | Use it for |
|---|---|
| **PDF** | The print dialog → Save as PDF. Selectable text, working links, real page breaks. |
| **Word** (`.doc`) | When a recruiter asks for "a Word copy". Opens and edits natively. |
| **Plain text** | Pasting into an application form or ATS box. |
| **Markdown** | A GitHub profile README, Notion. |
| **HTML** | One self-contained file with styles inlined. |
| **JSON Resume** | [jsonresume.org](https://jsonresume.org) schema, importable elsewhere. |
| **PNG / JPEG** | A picture of the resume. See the caveat below. |

Set the paper size (A4 / Letter) and tick any sections to leave out. The
**Resume** view on the Preview tab shows the real paginated layout.

**Image export caveats, stated plainly:** web fonts are not embedded in an SVG
`foreignObject`, so PNG/JPEG text falls back to system fonts and won't match the
PDF exactly. Same-origin images are inlined and do appear; remote images can't be
and are dropped, with the count reported after the export. Use PDF or Word when
fidelity matters.

#### Why the PDF had big blank gaps before

The old print stylesheet marked each whole job entry `break-inside: avoid`. A job
with seven bullets is taller than the space left at the foot of a page, and an
unbreakable block that doesn't fit gets pushed *wholesale* to the next page —
which is what left those half-empty pages.

Now only the entry **header** is unbreakable, so a role, employer and date never
split, with `break-after: avoid` guaranteeing at least one bullet stays with it.
Bullet lists flow and split freely, `orphans`/`widows` are set to 2, and nothing
tall is unbreakable any more. The sidebar layout uses a float rather than a CSS
grid, because grids don't fragment across pages.

### What's checked before a commit

Errors block the save; warnings don't.

*Errors:* missing `profile.name`; an implausible email; an experience entry
missing `id`/`company`/`role`/`startDate`; a project missing `id`/`title`; a skill
group with no category; a certification with no name; a qualification missing
degree or institution; a custom section with no title or a clashing anchor id; a
date that isn't `YYYY-MM` (or `YYYY`); a role ending before it starts; duplicate
ids in one list.

*Warnings:* an image with no alt text; an empty custom section or item; a stats
item with no big value; a gallery item with no image; an unknown theme, animation
or resume layout.

Each problem links straight to its tab.

### Conflicts

GitHub rejects a write against a stale `sha`. The admin catches that, re-fetches
the current `sha`, says what happened, and **keeps your edits in the form**. Save
again to overwrite, or Reload from GitHub to discard yours.

---

## 4. `admin.html` is public, and that's fine

- It ships with **no credentials** — it's an empty form.
- Without a token it can't read a private repo or write to any repo. GitHub does
  the authorisation, not this page.
- The token never touches `localStorage`, `sessionStorage`, a cookie, the URL or
  the committed file. One variable, gone when the tab closes or you Disconnect.
- Over plain HTTP the page warns you not to paste a token.
- `robots: noindex, nofollow` keeps it out of search.

The real boundary is the token: minimum scope, short expiry,
[revoke it](https://github.com/settings/tokens?type=beta) if it leaks. Prefer it
not public? Delete `admin.html` from the deployed branch and run it from
`localhost` — it talks to the GitHub API directly and works fine there.

---

## 5. `data.json` shape

```jsonc
{
  "theme":  { "preset", "mode", "iconAnimation", "fonts",
              "vars": { "common", "dark", "light" }, "templates": [] },
  "pdf":    { "template", "paper", "exclude": [] },
  "sectionOrder":   [ "about", "skills", … ],
  "hiddenSections": [ ],
  "sections": [{ "id", "title", "eyebrow", "blurb", "layout", "altBackground",
                 "items": [{ "title", "value", "subtitle", "meta", "body",
                             "bullets": [], "tags": [],
                             "image": { "src", "alt" }, "links": [] }] }],
  "profile": { "name", "shortName", "title",
               "yearsRounding",      // half | exact | down | near
               "experienceYears",    // "" = compute it; "4.5" or "~4.5" = override
               "tagline", "status", "location",
               "email", "phone", "resumeUrl", "siteUrl",
               "ogImage": { "src", "alt" },   // a bare "og.png" string also works
               "photo": { "src", "alt" },
               "about": [], "links": [{ "label", "url", "icon" }] },
  "experience":     [{ "id", "company", "role", "startDate", "endDate",
                       "location", "summary", "highlights": [], "tech": [] }],
  "projects":       [{ "id", "title", "featured", "blurb", "problem",
                       "approach", "result", "tech": [],
                       "image": { "src", "alt" }, "links": [] }],
  "skills":         [{ "category", "icon", "items": [] }],
  "certifications": [{ "name", "abbr", "issuer", "year", "credentialUrl", "icon" }],
  "education":      [{ "degree", "institution", "startYear", "endYear", "detail" }]
}
```

**Every field is optional.** Delete one and the renderer skips it — it never
prints `undefined`. Empty an array and its section *and* nav link vanish.

- **Dates** are `"YYYY-MM"` for jobs, `"YYYY"` for education. `endDate: null`
  means *Present*.
- **Sorting** is automatic: experience and education by start date, newest first.
  `sectionOrder` only decides which section goes where, not what's inside it.
- **`{{years}}`** in `tagline` or `about` becomes total years of experience,
  computed from the earliest `startDate`, so it never goes stale. `{{months}}`
  works too.
- **`**bold**`** renders as `<strong>` in highlights, summaries, blurbs and
  custom bodies.

---

## 6. Extending it in code

Each registry is a plain array — add one object, and the admin UI, the validator
and the renderer all pick it up with no other changes:

| Add a… | Append to |
|---|---|
| theme preset | `THEMES` in `js/themes.js` |
| font | `FONTS` in `js/themes.js` |
| brand logo | `BRANDS` in `js/icons.js` |
| logo animation | `ANIMATIONS` in `js/icons.js` + one CSS rule in `index.html` |
| section layout | `LAYOUTS` in `js/layouts.js` + its CSS |
| resume layout | `TEMPLATES` in `js/resume.js` + a `.r-yourid` CSS block |
| export format | `EXPORTS` in `js/resume.js` |
| way of rounding the years figure | `ROUNDINGS` in `js/core.js` |

A whole new *built-in* section (not a custom one) is the only change that still
touches two places: a renderer function and one line of `sectionList()` in
`js/render.js`.

CSS custom properties are the single styling surface. `js/themes.js` writes them
inline on `<html>` at runtime; the `:root` block in `index.html` is the fallback
if a script fails to load, and `admin.html` carries an identical copy. The light
theme overrides **colours only**, so layout lives in exactly one place.
