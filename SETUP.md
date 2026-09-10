# Setup

Three files do the whole job:

| File | What it is |
|---|---|
| `index.html` | The public site. Fetches `data.json` and renders everything from it. |
| `data.json` | All the content. The only file that changes when you update the site. |
| `admin.html` | Private editing UI. Reads and commits `data.json` through the GitHub API. |

Put `resume.pdf` (and optionally `og-image.png`) beside them.

---

## 1. Deploy to GitHub Pages

1. Push the three files to the root of a repository — `your-username.github.io` for a
   user site, or any repo for a project site.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch
   `main`, folder `/ (root)`.
3. Wait for the first deploy. The site is at `https://your-username.github.io/`
   (or `https://your-username.github.io/repo-name/`).
4. Open `data.json` and replace the four placeholders: `SITE_URL`, `LINKEDIN_URL`,
   `GITHUB_URL`, `SERVICENOW_COMMUNITY_URL`. Everything else is already filled in.

### Running it locally

Double-clicking `index.html` **will not work** — browsers block `fetch()` on `file://`
URLs, and the page will show its error state saying exactly that. Serve the folder over
HTTP instead:

```bash
cd "path/to/this/folder"
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 2. Create the fine-grained token

The admin page needs a token with **one permission on one repository**. Nothing more.

1. GitHub → your avatar → **Settings**
2. **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. **Generate new token**
4. Fill it in:
   - **Token name** — something like `portfolio-admin`
   - **Expiration** — 90 days is a good default. Short-lived is the point of these.
   - **Resource owner** — your own account
     *(If the repo belongs to an organisation, the org has to allow fine-grained tokens.
     Personal repos have no such step.)*
   - **Repository access** → **Only select repositories** → pick the one repo that holds
     your site. Do not choose "All repositories".
   - **Permissions** → **Repository permissions** → find **Contents** → set to
     **Read and write**.
     Leave everything else as "No access". GitHub adds **Metadata: Read-only**
     automatically — that's required and can't be removed.
5. **Generate token** and copy it. GitHub shows it exactly once.

That's the entire scope: read and write files in one repository. The token cannot touch
your other repos, your account settings, your gists, or anything else.

When it expires, generate a new one the same way. There is nothing to update in the code
— you paste the new token the next time you open the admin page.

---

## 3. Using the admin page

Open `https://your-username.github.io/admin.html`.

1. Enter username, repo, branch (`main`), path (`data.json`) and paste the token.
   The owner and repo are pre-filled if you're on a `*.github.io` hostname.
2. **Connect** — the page fetches `data.json`, decodes it, and fills the forms. The
   token input is cleared immediately; the value lives only in a JavaScript variable
   for the life of the tab.
3. Edit across the tabs. Arrays support **add**, **delete**, **drag-to-reorder** by the
   `⠿` handle, and **↑ / ↓** buttons for keyboard use. Tech and skill lists are tag
   inputs: type, press <kbd>Enter</kbd>, click the `×` to remove.
4. **Preview** tab renders the real site in an iframe against your unsaved edits.
5. **Save to GitHub** validates first, then commits. Edit the commit message beside the
   button. Pages usually redeploys within a minute.
6. **Download data.json** is the escape hatch — grab the file and commit it by hand.

### What gets checked before a commit

The save is blocked, with a list of what's wrong and a link to the offending tab, if:

- `profile.name` is missing, or `profile.email` isn't a plausible address
- any experience entry is missing `id`, `company`, `role` or `startDate`
- any project is missing `id` or `title`; any skill group is missing `category`;
  any certification is missing `name`; any qualification is missing `degree` or
  `institution`
- a date isn't `YYYY-MM` (or `YYYY` for years)
- a role ends before it starts
- two entries in the same list share an `id`

### If someone else changed the file

GitHub rejects a write against a stale `sha`. The admin page catches that, re-fetches
the current `sha`, tells you what happened, and keeps your edits in the form. Press
**Save** again to overwrite the remote version, or **Reload from GitHub** to throw yours
away.

### Closing the tab

If you have unsaved changes, the browser asks you to confirm before leaving.

---

## 4. About `admin.html` being public

`admin.html` is served by GitHub Pages, so anyone who guesses the URL can load it. That's
fine, and it's worth understanding why:

- The page ships with **no credentials in it**. It's an empty form.
- Without a valid token it can't read a private repo or write to any repo. GitHub does
  the authorisation, not this page.
- The token is never written to `localStorage`, `sessionStorage`, a cookie, the URL, or
  the committed file. It exists in one JavaScript variable and disappears when the tab
  closes or you press **Disconnect**.
- The page refuses to look reassuring over plain HTTP: if it's not HTTPS or localhost it
  shows a warning telling you not to paste a token.
- `<meta name="robots" content="noindex, nofollow">` keeps it out of search results.

So the real security boundary is the token itself. Keep it out of screenshots and
screen shares, give it the minimum scope above, set an expiry, and
[revoke it](https://github.com/settings/tokens?type=beta) if it ever leaks.

If you'd still rather it not be public, delete `admin.html` from the deployed branch and
run it locally instead (`python3 -m http.server` in the project folder) — it talks to the
GitHub API directly and works fine from `localhost`.

---

## 5. The shape of `data.json`

```jsonc
{
  "profile": {
    "name", "title", "tagline", "location", "email", "phone", "resumeUrl",
    "links": [{ "label", "url", "icon" }]
  },
  "experience":     [{ "id", "company", "role", "startDate", "endDate", "location",
                       "summary", "highlights": [], "tech": [] }],
  "projects":       [{ "id", "title", "blurb", "problem", "approach", "result",
                       "tech": [], "featured": bool, "links": [] }],
  "skills":         [{ "category", "items": [] }],
  "certifications": [{ "name", "issuer", "year", "credentialUrl" }],
  "education":      [{ "degree", "institution", "startYear", "endYear", "detail" }]
}
```

**Every field is optional.** Delete one and the renderer skips it — it never prints
`undefined` or an empty label. Empty a whole array and its section *and* its nav link
vanish from the site.

A few conventions the renderer relies on:

- **Dates** are `"YYYY-MM"` for jobs, `"YYYY"` for education. `endDate: null` means
  *Present*.
- **Sorting** is automatic — experience and education sort by start date, newest first.
  The order in the file only breaks ties.
- **`{{years}}`** inside `tagline` or `about` is replaced with total years of experience,
  computed from the earliest `startDate`. `{{months}}` works too. This is why the number
  never goes stale.
- **`**bold**`** inside highlights, summaries and blurbs renders as `<strong>`.
- **`icon`** is a [Lucide](https://lucide.dev/icons) icon name. An unknown name renders
  nothing and breaks nothing.

### Optional fields beyond the schema above

These aren't in the core schema but the renderer and the admin both support them, and the
seed data uses them:

| Field | Effect |
|---|---|
| `profile.shortName` | Used in the nav brand and `<title>` instead of the full name |
| `profile.status` | Text for the pill at the top of the hero; blank hides it |
| `profile.about[]` | Paragraphs for the About section; empty removes the section |
| `profile.siteUrl`, `profile.ogImage` | Canonical URL and Open Graph image |
| `certifications[].abbr` | Short code shown on the card and in the hero line |
| `skills[].icon` | Icon on the category card |

---

## 6. Re-theming

Every colour and spacing value is a CSS custom property at the top of the `<style>` block
in `index.html`, grouped and commented. `admin.html` carries an identical copy of the same
two blocks (`:root` and `[data-theme="light"]`) — paste your edited version into both and
the whole thing re-themes, including the admin UI.

The light theme overrides **colours only**, so layout lives in exactly one place.
