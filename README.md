# Architecture Portfolio

A minimal, fast, single-page portfolio for an architect. Plain HTML/CSS/JS — no build step.

## Personalise it

Everything she'll want to change lives in **`content.js`**:

- **Name, title, tagline, intro, hero image, email, phone, social links, CV link**
- **Contact heading/text and footer line**
- **About** — bio paragraphs, experience, education, software skills, languages, portrait photo
- **Projects** — title, category, year, location, status, area, client, role, summary, description and photos

### Adding photos

1. Put images in the `images/` folder (JPG/WebP, ~2000px wide is plenty).
2. List them on the project: `images: ["images/courtyard-1.jpg", "images/courtyard-2.jpg"]`.
   The first one becomes the cover in the grid.

Until real photos are added, each project shows a generated abstract architectural drawing in its own `palette` colours.

## Preview locally

Run `npx vercel dev` (or `python3 -m http.server` for the home page only) and visit the local URL.
(Opening `index.html` directly from disk won't load the styles, because paths are site-root based for the clean `/projects/<id>` URLs.)

### Arranging a project's images

By default each image after the cover gets its own full-width row. To group them, add a `gallery`
to the project in `content.js` (numbers are positions in its `images` list; the cover is 0):

```js
gallery: [
  { layout: "duo", images: [1, 2] },          // two side by side, same height
  { layout: "feature", images: [3, 4, 5, 6] }, // one large left, the rest stacked right (2 or 3)
  { layout: "full", images: [7] },             // one image, full width
],
```

## After editing content

The pages are pre-built into plain HTML so search engines and AI assistants can read them.
After changing `content.js` or the templates in `tools/`, run:

```
node tools/prerender.js
```

This regenerates `index.html`, `about.html`, `contact.html`, `projects/*.html`, `404.html`, `sitemap.xml`, `robots.txt` and `llms.txt`
(structured data for her profile and each project is included automatically).

## Publish

The site is on Vercel, connected to this GitHub repo. **Every push to `main` deploys to the live site automatically**
(kaltrinaajdini.com). Pushes to other branches get a preview link only.

## Layout

Three pages in the menu: **Work** (`/`, the project list in Grid or List view), **About** (`/about`: bio, CV,
experience, education, skills) and **Contact** (`/contact`: the form). Each project has its own page.
The home page opens with a hero slideshow of featured projects (`heroImages` in `content.js`). A slide with
`lines` first draws itself as a line drawing, then the render fades in. To trace a new one:
`pip install opencv-python-headless` then `python3 tools/trace-lines.py images/<render>.jpg images/<render>-lines.svg`
(works best on clean renders with straight edges and a plain background).
Everything sits on one 1440px page width with a 48px gutter.

## Features

- Work (home): Selected Work in Grid | List view; About page with experience timeline and CV; Contact page
- Each project has its own page at `/projects/<id>` (`project.html`, routed by `vercel.json`) with cover, facts, description, captioned gallery and previous/next links (← → keys work too)
- Contact form that opens the visitor's email app with the message filled in (no server needed)
- Responsive down to phone width, respects reduced-motion settings
