// Pre-builds the site into plain HTML so search engines and AI crawlers (which often don't run
// JavaScript) can read every word, plus structured data, sitemap.xml, robots.txt and llms.txt.
//
// Run from the repo root after editing content.js or the templates:   node tools/prerender.js
// Needs Playwright + Chromium. Writes: index.html, about.html, contact.html, projects/<id>.html, 404.html,
// sitemap.xml, robots.txt, llms.txt. Sources: tools/*.template.html, content.js.
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2" };

// Load content.js the same way the browser does
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "content.js"), "utf8"), sandbox);
const data = sandbox.window.PORTFOLIO;
const SITE = data.site.replace(/\/$/, "");
const abs = (p) => (/^https?:/.test(p) ? p : `${SITE}/${p.replace(/^\//, "")}`);
const src = (img) => (typeof img === "string" ? img : img?.src);
const text = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/* ── Structured data (schema.org) ── */
const a = data.about;
const person = {
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: data.name,
  jobTitle: data.title,
  description: text(data.intro),
  url: SITE,
  image: a.portrait ? abs(a.portrait) : undefined,
  address: data.hometown && { "@type": "PostalAddress", addressLocality: data.hometown.city, addressCountry: data.hometown.country },
  worksFor: data.worksFor && {
    "@type": "Organization", name: data.worksFor.name,
    address: { "@type": "PostalAddress", addressLocality: data.worksFor.city, addressRegion: data.worksFor.region, addressCountry: data.worksFor.country },
  },
  hasOccupation: { "@type": "Occupation", name: data.worksFor?.role || data.title, occupationalCategory: "Architects" },
  alumniOf: a.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.place })),
  hasCredential: [
    ...a.education.map((e) => ({ "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: e.title })),
    ...(a.certifications || []).map((c) => ({ "@type": "EducationalOccupationalCredential", credentialCategory: "certificate", name: c })),
  ],
  knowsAbout: [...(a.services || []), ...(a.skills || [])],
  knowsLanguage: (a.languages || []).map((l) => l.split(" — ")[0]),
  sameAs: data.social.map((s) => s.url),
};
const website = { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: `${data.name} — ${data.title}`, about: { "@id": `${SITE}/#person` } };
const projectLd = (p) => ({
  "@type": "CreativeWork",
  "@id": `${SITE}/projects/${p.id}#work`,
  name: p.title,
  url: `${SITE}/projects/${p.id}`,
  genre: p.category,
  description: text((p.description || [p.summary]).join(" ")),
  abstract: text(p.summary),
  image: (p.images || []).map((i) => abs(src(i))),
  locationCreated: p.location ? { "@type": "Place", name: p.location } : undefined,
  creator: { "@id": `${SITE}/#person` },
});
const homeLd = { "@context": "https://schema.org", "@graph": [person, website, {
  "@type": "ItemList", name: "Projects", itemListElement: data.projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/projects/${p.id}`, name: p.title })),
}] };

/* ── Tiny local server: "/" → home template, "/about", "/contact", "/projects/<id>" → their templates ── */
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/tools/index.template.html";
  else if (p === "/about" || p === "/contact") p = `/tools${p}.template.html`;
  else if (p.startsWith("/projects/")) p = "/tools/project.template.html";
  fs.readFile(path.join(ROOT, p), (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

async function snapshot(browser, url, { title, description, canonical, image, ld }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(`${url}: ${errors.join("; ")}`);
  const html = await page.evaluate(({ title, description, canonical, image, ld }) => {
    const d = document, head = d.head;
    // Undo purely visual runtime state so the saved page starts fresh
    d.documentElement.classList.remove("wf-wait");
    if (!d.documentElement.className) d.documentElement.removeAttribute("class");
    d.querySelectorAll(".in").forEach((e) => e.classList.remove("in"));
    d.querySelectorAll(".hero-caption-text.swap").forEach((e) => e.classList.remove("swap"));
    // The hero is rebuilt on load; don't ship the inlined line drawing or its animation state
    d.querySelectorAll(".hero-lines").forEach((e) => (e.innerHTML = ""));
    d.querySelectorAll(".hero-slide").forEach((e) => e.classList.remove("drawing", "drawn"));
    // Per-page metadata
    const meta = (attr, key, value) => {
      if (!value) return;
      let m = head.querySelector(`meta[${attr}="${key}"]`);
      if (!m) { m = d.createElement("meta"); m.setAttribute(attr, key); head.appendChild(m); }
      m.setAttribute("content", value);
    };
    d.title = title;
    meta("name", "description", description);
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:image", image);
    meta("property", "og:url", canonical);
    meta("property", "og:type", "website");
    meta("name", "twitter:card", "summary_large_image");
    if (canonical) {
      let link = head.querySelector('link[rel="canonical"]');
      if (!link) { link = d.createElement("link"); link.rel = "canonical"; head.appendChild(link); }
      link.href = canonical;
    }
    head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove());
    if (ld) { const s = d.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); head.appendChild(s); }
    return "<!doctype html>\n" + d.documentElement.outerHTML + "\n";
  }, { title, description, canonical, image, ld });
  await page.close();
  return html;
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), content);
    console.log("wrote", file);
  };

  try {
    write("index.html", await snapshot(browser, `${base}/`, {
      title: `${data.name} — ${data.title}`,
      description: text(`${data.name}, ${data.title.toLowerCase()} — ${data.intro}`),
      canonical: `${SITE}/`,
      image: abs(src(data.heroImages?.[0]) || src(data.projects[0].images[0])),
      ld: homeLd,
    }));

    write("about.html", await snapshot(browser, `${base}/about`, {
      title: `About — ${data.name}, ${data.title}`,
      description: text(a.bio[0]),
      canonical: `${SITE}/about`,
      image: a.portrait ? abs(a.portrait) : undefined,
      ld: { "@context": "https://schema.org", "@type": "ProfilePage", url: `${SITE}/about`, mainEntity: person },
    }));

    write("contact.html", await snapshot(browser, `${base}/contact`, {
      title: `Contact — ${data.name}, ${data.title}`,
      description: text(data.contactText),
      canonical: `${SITE}/contact`,
      image: abs(src(data.heroImages?.[0]) || src(data.projects[0].images[0])),
    }));

    fs.rmSync(path.join(ROOT, "projects"), { recursive: true, force: true });
    for (const p of data.projects) {
      write(`projects/${p.id}.html`, await snapshot(browser, `${base}/projects/${p.id}`, {
        title: `${p.title} — ${data.name}, ${data.title}`,
        description: text(p.summary),
        canonical: `${SITE}/projects/${p.id}`,
        image: abs(src(p.images[0])),
        ld: { "@context": "https://schema.org", ...projectLd(p) },
      }));
    }

    write("404.html", await snapshot(browser, `${base}/projects/__not-found__`, {
      title: `Page not found — ${data.name}`, description: "This page doesn’t exist.",
    }));
  } finally {
    await browser.close();
    server.close();
  }

  /* ── sitemap.xml, robots.txt, llms.txt ── */
  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${SITE}/`, `${SITE}/about`, `${SITE}/contact`, ...data.projects.map((p) => `${SITE}/projects/${p.id}`)];
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);

  write("robots.txt", `# Search engines and AI assistants are welcome to read and index this portfolio.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

  const lines = [
    `# ${data.name} — ${data.title}`,
    "",
    `> ${text(data.intro)}`,
    "",
    ...a.bio.map(text),
    "",
    "## Current role",
    data.worksFor ? `- ${data.worksFor.role}, ${data.worksFor.name} (${data.worksFor.city}, ${data.worksFor.region})` : "",
    "",
    "## Experience",
    ...a.experience.map((e) => `- ${e.title} — ${e.place} (${e.years})`),
    "",
    "## Education",
    ...a.education.map((e) => `- ${e.title} — ${e.place} (${e.years})`),
    "",
    "## Expertise",
    ...(a.services || []).map((s) => `- ${s}`),
    "",
    "## Software",
    `- ${(a.skills || []).join(", ")}`,
    "",
    "## Certifications",
    ...(a.certifications || []).map((c) => `- ${c}`),
    "",
    "## Languages",
    `- ${(a.languages || []).join("; ")}`,
    "",
    "## Projects",
    ...data.projects.map((p) => `- [${p.title}](${SITE}/projects/${p.id}) — ${[p.category, p.location].filter(Boolean).join(", ")}: ${text(p.summary)}`),
    "",
    "## Contact",
    `- About: ${SITE}/about`,
    `- Contact form: ${SITE}/contact`,
    ...data.social.map((s) => `- ${s.label}: ${s.url}`),
    data.cv ? `- CV (PDF): ${abs(data.cv)}` : "",
    "",
  ];
  write("llms.txt", lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n"));
})().catch((e) => { console.error(e); process.exit(1); });
