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

## Publish

The site is on Vercel, connected to this GitHub repo. **Every push to `main` deploys to the live site automatically**
(kaltrinaajdini.com). Pushes to other branches get a preview link only.

## Layout

Inspired by the Squarespace *Radian* template: a large hero image, a project carousel,
an index of projects with images, an experience section, a dark About section, a contact
form and a footer with her name set large across the page.

## Features

- Project carousel and project index on the home page
- Each project has its own page at `/projects/<id>` (`project.html`, routed by `vercel.json`) with cover, facts, description, captioned gallery and previous/next links (← → keys work too)
- Contact form that opens the visitor's email app with the message filled in (no server needed)
- Responsive down to phone width, respects reduced-motion settings
