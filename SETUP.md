# Setup

| File | What it is |
|---|---|
| `index.html` | The public site. Fetches `data.json` and renders everything from it. |
| `data.json` | All content, plus the chosen theme and PDF settings. The only file that changes when you update the site. |
| `themes.js` | The 10 theme presets, the font catalogue, the PDF layouts and the custom-section layouts. Shared by the site and the admin. |
| `admin.html` | Private editing UI. Reads and commits `data.json` (and uploaded images) through the GitHub API. |

Put `resume.pdf` beside them if you want a hosted PDF download. Uploaded images land in `assets/`.

---

## 1. Deploy to GitHub Pages

1. Push the four files to the root of a repository — `your-username.github.io` for a
   user site, or any repo for a project site.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch
   `main`, folder `/ (root)`.
3. Open `data.json` and replace the four placeholders: `SITE_URL`, `LINKEDIN_URL`,
   `GITHUB_URL`, `SERVICENOW_COMMUNITY_URL`.

### Running it locally

Double-clicking `index.html` **will not work** — browsers block `fetch()` on `file://`
URLs, and the page says so in its error state. Serve the folder over HTTP:

```bash
cd "path/to/this/folder"
python3 -m http.server 8000
# then open http://localhost:8000
```

The admin page works from `localhost` too, and talks to the GitHub API directly.

---

## 2. Create the fine-grained token

The admin needs a token with **one permission on one repository**.

1. GitHub → your avatar → **Settings**
2. **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. **Generate new token**
4. Fill it in:
   - **Token name** — something like `portfolio-admin`
   - **Expiration** — 90 days is a good default. Short-lived is the point of these.
   - **Resource owner** — your own account.
     *(If the repo belongs to an organisation, the org has to allow fine-grained tokens.)*
   - **Repository access** → **Only select repositories** → pick the one repo that holds
     your site. Not "All repositories".
   - **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
     Leave everything else at "No access". GitHub adds **Metadata: Read-only**
     automatically; that's required and can't be removed.
5. **Generate token** and copy it. GitHub shows it exactly once.

That's the entire scope: read and write files in one repository. Contents write is what
covers both `data.json` and image uploads — there is no narrower permission that allows
committing a file.

When it expires, generate a new one. Nothing in the code changes; you just paste the new
token next time.

---

## 3. Using the admin

Open `https://your-username.github.io/admin.html`, fill in the repo details, paste the
token, hit **Connect**. The token input is cleared immediately; the value lives in a
JavaScript variable for the life of the tab.

**Tabs:** Profile · Experience · Projects · Skills · Certifications · Education ·
Sections · Theme · PDF · Preview.

Every list supports **add**, **delete**, **drag-to-reorder** by the `⠿` handle, and
**↑ / ↓** buttons for keyboard use. Tech and skill lists are tag inputs — type, press
<kbd>Enter</kbd>, click `×` to remove.

**Save to GitHub** validates, then commits. **Download data.json** is the escape hatch.
If you close the tab with unsaved changes, the browser asks first.

### Images

Any image field (profile photo, project cover, custom-section item) has an **Upload…**
button.

- The file is **downscaled in the browser first** — max 1600px on the long edge,
  re-encoded to WebP at 85%. An 8 MB phone photo becomes ~200 KB. SVGs and GIFs pass
  through untouched.
- It's committed to `assets/` as **its own commit**, immediately — separately from
  `data.json`. The filename is lower-cased and hyphenated.
- **Remove** clears the reference; it doesn't delete the file from the repo (git history
  keeps it anyway).
- Fill in **Alt text**. Leaving it blank isn't blocked, but you'll get a warning on save
  — an image with no alt is invisible to a screen reader.

### Custom sections

The **Sections** tab does two things:

1. **Order and visibility** — drag any section (built-in or custom) to reorder it on the
   site, or hide one without deleting its content. Contact is always the footer.
2. **Custom sections** — anything the built-ins don't cover: talks, publications, awards,
   volunteering, a screenshot gallery.

Each custom section picks a **layout**:

| Layout | Good for |
|---|---|
| **Cards** | Talks, awards, side projects, open-source work |
| **Timeline** | Milestones, volunteering, a second career track |
| **List** | Publications, mentions, courses — compact rows with a date on the right |
| **Prose** | A longer narrative or statement |
| **Gallery** | Screenshots, diagrams, certificates — image grid with captions |

Every item has the same optional fields — title, subtitle, meta, body, bullets, tags,
image, links — and each layout uses whichever of them you fill in. A section with no
items never renders, and never appears in the nav.

### Themes

The **Theme** tab starts with 10 presets: Graphite, Ink, Terminal, Sapphire, Crimson,
Sage, Slate Mono, Violet, Frost and Press. They differ in palette, font pairing, corner
radius, type scale and density — not just colour.

From there you can change anything:

- **Fonts** — three pickers (headings / body / mono) over a curated Google Fonts
  catalogue. Only the families you actually choose get requested at runtime.
- **Colours** — ten per mode, edited separately for dark and light. Hover, tint, and
  on-accent text colours are *derived*, so changing one accent updates everything
  consistently. The on-accent text colour is picked by luminance so it always lands on
  the higher-contrast side of black/white.
- **Shape** — card radius, button radius, chip radius, content width.
- **Type** — overall size, heading size, line height, heading weight, letter-spacing.
- **Density** — section padding and grid gap.

Tweaks are stored as a handful of CSS custom properties in `data.json` under
`theme.vars`. **Save as a template** freezes the current look as a named, reusable
template stored alongside them — it then appears in the gallery like a built-in.

Tick **Preview theme in this editor** to apply the theme you're building to the admin
chrome too. It's off by default so a half-finished palette can't make the editor
unreadable.

### PDF

The site can re-lay-out your content as a resume and hand it to the browser's print
dialog, where you choose **Save as PDF**. Real selectable text, working hyperlinks,
proper page breaks — nothing is screenshotted, and there's no PDF library to load.

Five layouts:

| Layout | Shape |
|---|---|
| **Compact** | One column, dense — the most content per page |
| **Sidebar** | Two columns; contact, skills, certs and education in a left rail |
| **Classic** | Centred header, serif headings, roomy leading |
| **Timeline** | Dates in a left gutter with a rule down the page |
| **Minimal** | No rules, no colour, no chips — the ATS-safest option |

The **PDF** tab sets the default layout, paper size (A4 / US Letter), and which sections
to leave out. Visitors can still pick a different layout from the **Save as PDF** button
in the hero. Turn off "Headers and footers" in the print dialog for a clean page.

### What's checked before a commit

Errors **block** the save; warnings don't.

*Errors:* `profile.name` missing; `profile.email` not a plausible address; an experience
entry missing `id`, `company`, `role` or `startDate`; a project missing `id` or `title`;
a skill group missing `category`; a certification missing `name`; a qualification missing
`degree` or `institution`; a custom section missing a title or with a clashing anchor id;
a date that isn't `YYYY-MM` (or `YYYY`); a role that ends before it starts; two entries in
one list sharing an `id`.

*Warnings:* an image with no alt text; a custom section with no items; an empty item; a
theme or PDF layout id that no longer exists.

Each problem links straight to the tab it's on.

### If someone else changed the file

GitHub rejects a write against a stale `sha`. The admin catches that, re-fetches the
current `sha`, says what happened, and **keeps your edits in the form**. Press **Save**
again to overwrite the remote version, or **Reload from GitHub** to discard yours.

---

## 4. About `admin.html` being public

`admin.html` is served by GitHub Pages, so anyone who guesses the URL can load it. That's
fine:

- The page ships with **no credentials in it**. It's an empty form.
- Without a valid token it can't read a private repo or write to any repo. GitHub does
  the authorisation, not this page.
- The token is never written to `localStorage`, `sessionStorage`, a cookie, the URL, or
  the committed file. It exists in one JavaScript variable and disappears when the tab
  closes or you press **Disconnect**.
- Over plain HTTP the page shows a warning telling you not to paste a token.
- `<meta name="robots" content="noindex, nofollow">` keeps it out of search results.

The real security boundary is the token. Keep it out of screenshots and screen shares,
give it the minimum scope above, set an expiry, and
[revoke it](https://github.com/settings/tokens?type=beta) if it leaks.

Prefer it not public? Delete `admin.html` from the deployed branch and run it locally
(`python3 -m http.server`) — it talks to the GitHub API directly and works fine from
`localhost`.

---

## 5. The shape of `data.json`

```jsonc
{
  "theme":  { "preset", "mode", "fonts", "vars": { "common", "dark", "light" }, "templates": [] },
  "pdf":    { "template", "paper", "exclude": [] },
  "sectionOrder":   [ "about", "skills", … ],   // display order, any section id
  "hiddenSections": [ ],                        // rendered nowhere, content kept
  "sections": [{ "id", "title", "eyebrow", "blurb", "layout", "altBackground",
                 "items": [{ "title", "subtitle", "meta", "body",
                             "bullets": [], "tags": [], "image": { "src", "alt" },
                             "links": [] }] }],
  "profile": { "name", "title", "tagline", "location", "email", "phone", "resumeUrl",
               "photo": { "src", "alt" }, "links": [{ "label", "url", "icon" }] },
  "experience":     [{ "id", "company", "role", "startDate", "endDate", "location",
                       "summary", "highlights": [], "tech": [] }],
  "projects":       [{ "id", "title", "blurb", "problem", "approach", "result",
                       "tech": [], "featured": bool, "image": { "src", "alt" },
                       "links": [] }],
  "skills":         [{ "category", "icon", "items": [] }],
  "certifications": [{ "name", "abbr", "issuer", "year", "credentialUrl" }],
  "education":      [{ "degree", "institution", "startYear", "endYear", "detail" }]
}
```

**Every field is optional.** Delete one and the renderer skips it — it never prints
`undefined` or an empty label. Empty a whole array and its section *and* its nav link
vanish.

Conventions the renderer relies on:

- **Dates** are `"YYYY-MM"` for jobs, `"YYYY"` for education. `endDate: null` means
  *Present*.
- **Sorting** is automatic — experience and education sort by start date, newest first.
  `sectionOrder` only controls which *section* goes where, not what's inside it.
- **`{{years}}`** inside `tagline` or `about` becomes total years of experience, computed
  from the earliest `startDate`. `{{months}}` works too. This is why the number never
  goes stale.
- **`**bold**`** inside highlights, summaries, blurbs and custom bodies renders as
  `<strong>`.
- **`icon`** is a [Lucide](https://lucide.dev/icons) icon name. An unknown name renders
  nothing and breaks nothing.

Fields beyond the core schema, all optional: `profile.shortName` (nav brand and
`<title>`), `profile.status` (hero pill), `profile.about[]` (About section),
`profile.siteUrl` / `profile.ogImage` (canonical + Open Graph),
`certifications[].abbr`, `skills[].icon`.

---

## 6. Re-theming in code

Everything visual is a CSS custom property. Three places, in order of how often you'd
touch them:

1. **The Theme tab** — for anything you'd normally want to change.
2. **`themes.js`** — to add a preset for good, or extend the font catalogue. A preset is
   ten colours per mode plus a shape/type block; the rest is derived.
3. **The `:root` block in `index.html`** — the fallback used if `themes.js` or
   `data.json` fails to load. `admin.html` carries an identical copy.

The light theme overrides **colours only**, so layout lives in exactly one place.
