# TipWap (Wappler App Connect + Server Connect)


**Rich text editor** for Wappler forms and CMS fields. Self-hosted **MIT TipTap** only. Not a Tiptap Cloud wrapper.

[![License: Mr Cheese Extension v1.0](https://img.shields.io/badge/License-Mr%20Cheese%20Extension%20v1.0-blue.svg)](https://www.mrcheese.co.uk/extension-license)
![Wappler](https://img.shields.io/badge/Wappler-App%20%2B%20Server%20Connect-teal)
![Version](https://img.shields.io/badge/version-1%2E1%2E6-green)

Built by **[Mr Cheese](https://www.mrcheese.co.uk)** · Wappler extensions & open source

---

## Why this exists

Wappler ships **Summernote** for rich text in many flows. TipWap is for projects that want a **self-hosted MIT TipTap** editor in App Connect: Bootstrap-friendly chrome, optional tables and task lists, per-instance toggles, a hidden `<textarea>` that works with **Import From Form**, and matching **Server Connect** sanitize, excerpt, and word count before you store HTML.

| Layer | What you get |
|-------|----------------|
| **App Connect** | `dmx-tipwap-editor` - TipTap toolbar, tables, image by URL, character count |
| **Server Connect** | **Sanitize HTML**, **Excerpt**, **Word count** actions |

---

## Features (v1.1)

| Capability | Description |
|------------|-------------|
| **StarterKit toolbar** | Bold, italic, lists, headings, links, blockquote, code, undo/redo |
| **Tables** | Insert and edit tables (MIT TableKit) |
| **Table tools** | Add/remove rows and columns (toggle per instance) |
| **Images** | Insert by **URL** only (no built-in upload). **See [CSP and external images](#csp-helmet-and-external-images) below.** |
| **Text align** | Left, center, right, justify (toggle per instance) |
| **Highlight** | Text highlight mark (toggle per instance) |
| **Task lists** | Checklist items (toggle per instance) |
| **HTML source view** | Toggle visual editor and raw HTML (off by default; always sanitize server-side) |
| **Character count** | Live counter in the editor; optional max length |
| **Form-ready** | Static `<textarea name="...">` for Wappler Import From Form |
| **Server sanitize** | Allowlist HTML before database insert (tables, images, align, highlight, tasks) |
| **Excerpt + word count** | Plain-text excerpt and counts for previews and Conditions |

### Extended controls (App Connect panel)

In the **TipWap Editor** property group on each instance:

| Property | Default | Notes |
|----------|---------|--------|
| Enable HTML source view | `false` | `</>` toolbar button; raw HTML editing |
| Enable text align | `true` | Full toolbar only |
| Enable highlight | `true` | Full toolbar only |
| Enable task lists | `true` | Full toolbar only |
| Enable table tools | `true` | Requires tables enabled; full toolbar only |

**OSS only:** no Tiptap Cloud, collab, AI, or paid Platform bundles.

---

## Requirements

- Wappler **Node.js** project (Server Connect + App Connect)
- Forms via `dmx-serverconnect-form` or normal POST

---

## Installation

Pick **one** install path and follow it completely:

| Path | Best for |
|------|----------|
| **Git** (recommended) | Most reliable; uses `git clone` + copy from the repo |
| **npm** | You already use Wappler Project Settings → Extensions |

Both paths copy files into `extensions/`, `lib/modules/`, and `public/`. The npm path also requires verifying `node_modules/wappler-tipwap` exists **before** you run any copy commands.

### Git install — Extension Installer (recommended)

Repo includes **`wappler-install.json`**. Use the **[Extension Installer](https://www.mrcheese.co.uk/extensions/install)** - select **TipWap**, choose **Both**, run the script from your Wappler project root.

### Manual install (Git)

Run from your **Wappler project root** (the folder that contains `package.json`). Skip `git clone` if you already have this repo cloned alongside your project.

```bash
git clone https://github.com/MrCheeseGit/Wappler-TipWap-Tiptap-Extension.git ../Wappler-TipWap-Tiptap-Extension

cp ../Wappler-TipWap-Tiptap-Extension/server_connect/modules/tipwap_sanitize.hjson extensions/server_connect/modules/
cp ../Wappler-TipWap-Tiptap-Extension/tipwap_excerpt.hjson extensions/server_connect/modules/
cp ../Wappler-TipWap-Tiptap-Extension/tipwap_wordcount.hjson extensions/server_connect/modules/
cp ../Wappler-TipWap-Tiptap-Extension/server_connect/modules/tipwap.js lib/modules/
cp ../Wappler-TipWap-Tiptap-Extension/server_connect/modules/tipwap.js extensions/server_connect/modules/

cp ../Wappler-TipWap-Tiptap-Extension/app_connect/components.hjson extensions/app_connect/components/tipwap_components.hjson
cp ../Wappler-TipWap-Tiptap-Extension/includes/dmx-tipwap-editor.js public/js/
cp ../Wappler-TipWap-Tiptap-Extension/includes/dmx-tipwap-editor.css public/css/
cp ../Wappler-TipWap-Tiptap-Extension/includes/dmx-tipwap-editor.bundle.js public/js/
```

**Quit Wappler completely and restart.**

### npm install (Wappler Project Settings)

1. **Wappler** → Project Settings → Extensions → Add → `wappler-tipwap`
2. From your project root: `npm install`
3. Run **Project Updater → Update** when prompted.
4. **Quit Wappler completely** and reopen your project.

#### Local `file:` development (optional)

```json
"devDependencies": {
  "wappler-tipwap": "file:../path/to/this-extension"
}
```

After you change extension source, run `npm install` again, then Project Updater if needed, and restart Wappler.

## Quick start

### 1. Form (App Connect)

1. Add **TipWap Editor** from **Mr Cheese** inside your `<form>`.
2. Set **Field name** (default `content_yourComponentId`).
3. Choose **Toolbar**: `full` (default) or `minimal`.
4. Optional: **Max characters**, enable/disable tables and images.

### 2. API (Server Connect)

1. **Input:** linked page + form → **Import From Form** (picks up the textarea field).
2. **TipWap Sanitize HTML** - bind `{{$_POST.body}}` (or your field name).
3. **TipWap Excerpt** - bind `{{sanitize.html}}` for list previews.
4. **TipWap Word Count** - bind `{{sanitize.html}}` for Conditions.
5. **Database Insert** - store `{{sanitize.html}}`, `{{excerpt.excerpt}}`, etc.

See [examples/](examples/).

---

## Server Connect actions

### Sanitize HTML

| Option | Notes |
|--------|--------|
| HTML | Bind from `$_POST` |
| Mode | `standard` (CMS), `strict`, or `minimal` |
| Max length | Optional cap after sanitize |

Output: `html`, `plainText`, `length`, `wordCount`, `stripped`

### Excerpt

Plain text from HTML, max length, ellipsis. Run after sanitize.

### Word count

Returns `words` and `characters` from HTML or text.

---

## CSP, Helmet, and external images

> **Important:** TipWap cannot bypass your site's **Content Security Policy**. If an image URL is not allowed by `img-src`, the browser **blocks it** in the editor and on every page that renders that HTML. There is no client-side workaround.

### What you will see

Console errors like:

```text
Loading the image 'https://example.com/logo.png' violates the following
Content Security Policy directive: "img-src 'self' data: …". The action has been blocked.
```

The image may appear broken in TipTap, and the same broken image will appear wherever you output the saved HTML.

### What is (and is not) the cause

| Topic | Affects TipWap images? |
|-------|----------------------|
| **Helmet CSP `img-src`** | **Yes** - primary cause when external hosts are blocked |
| **CORS** | Usually **no** for normal `<img src="https://…">` display (CORS applies to `fetch`/canvas, not basic image tags) |
| **TipWap Sanitize** | Allows `<img>` tags through, but does **not** change CSP |
| **Server Connect** | Cannot override browser CSP on the user's page |

### What you should do

Pick one approach (or combine 1 + 2):

1. **Allow the host in Helmet** (Wappler `app/config/config.json` → `helmet.contentSecurityPolicy.directives.imgSrc`):

   ```json
   "imgSrc": [
     "'self'",
     "data:",
     "https://cdn.example.com",
     "https://*.your-cdn.com"
   ]
   ```

   Restart your Node target after changing config. Add every domain authors may paste (or use a CDN hostname you control).

2. **Host images on your origin** (recommended for CMS content): upload to `/public/…` or your storage bucket, then insert `/images/article-photo.jpg` or a URL already covered by `img-src`. Same-origin images match `'self'`.

3. **Optional: same-origin image proxy** (advanced): a Server Connect API on your domain fetches remote images and serves them from `https://yoursite.com/api/media/proxy?url=…` so `img-src 'self'` applies. TipWap v1 does not ship a proxy; you wire your own upload or proxy API if editors need arbitrary external URLs.

### Checklist for content editors

- [ ] Every external image host used in articles is listed in **`img-src`**, **or**
- [ ] Images are uploaded/hosted on **`'self'`** (your site or allowed CDN), **and**
- [ ] You tested **Browser preview** (not only design view) after changing Helmet config
- [ ] Stored HTML is still run through **TipWap Sanitize HTML** before insert

**Design view** shows a placeholder only. Image and CSP behaviour must be tested in **browser preview** or on your live target URL.

---

## Limitations

- **Image by URL only** in v1. Wire your own upload API if you need file pickers.
- **CSP / Helmet `img-src`** must allow each image host, or images must be served from `'self'`. See [CSP, Helmet, and external images](#csp-helmet-and-external-images).
- **Always sanitize server-side** before storing HTML.
- **Node only** (no PHP Server Connect in this repo).
- Editor bundle (~450KB) loads **on demand** in browser preview via `dmx-tipwap-editor.js`; design view shows a placeholder only.

---

## Compatibility

Standalone extension. For shared patterns (Redirect-IT step order, PuSH-IT, optional pairs), see [Mr Cheese extension docs](https://github.com/MrCheeseGit/Wappler-Extension-Docs/blob/main/extension-compatibility.md).

## License

[Mr Cheese Extension License v1.0](https://www.mrcheese.co.uk/extension-license) — see [LICENSE](LICENSE). © [Mr Cheese](https://www.mrcheese.co.uk)
