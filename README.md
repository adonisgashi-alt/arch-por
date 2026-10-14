# Architecture Portfolio

A minimal, fast, single-page portfolio for an architect. Plain HTML/CSS/JS — no build step.

## Personalise it

Everything she'll want to change lives in **`content.js`**:

- **Name, title, tagline, email, social links, CV link**
- **About** — bio paragraphs, experience, education, software skills, languages, portrait photo
- **Projects** — title, category, year, location, status, area, client, role, summary, description and photos

### Adding photos

1. Put images in the `images/` folder (JPG/WebP, ~2000px wide is plenty).
2. List them on the project: `images: ["images/courtyard-1.jpg", "images/courtyard-2.jpg"]`.
   The first one becomes the cover in the grid.

Until real photos are added, each project shows a generated abstract architectural drawing in its own `palette` colours.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Publish (free)

**GitHub Pages:** repo → Settings → Pages → Deploy from branch → pick the branch and `/ (root)`.
Netlify or Vercel also work — just drag the folder in; there's nothing to build.

## Features

- Filter projects by category
- Full-screen project view with gallery, project facts, previous/next and keyboard navigation (← → Esc)
- Shareable project links (`#project/courtyard-house`)
- Responsive down to phone width, respects reduced-motion settings
