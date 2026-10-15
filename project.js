/* Project page: /projects/<id> */
(function () {
  const { data, $, esc, media, place, observeReveals } = window.Site;
  const id = decodeURIComponent((location.pathname.match(/^\/projects\/([^/]+)/) || [])[1] || "");
  const i = data.projects.findIndex((p) => p.id === id);
  const main = $("#project");

  if (i < 0) {
    document.title = `Project not found — ${data.name}`;
    main.innerHTML = `
      <header class="project-head">
        <a class="back-link" href="/#work">← All projects</a>
        <h1 class="h2">Project not found</h1>
        <p class="project-meta">This project may have moved. <a href="/#work">See all projects</a>.</p>
      </header>`;
    return;
  }

  const p = data.projects[i];
  const prev = data.projects[(i - 1 + data.projects.length) % data.projects.length];
  const next = data.projects[(i + 1) % data.projects.length];
  const imgs = p.images?.length ? p.images : [null, null, null];
  const fig = (img, k) => `
    <figure class="reveal">${media(img, img?.caption || `${p.title} — image ${k + 1}`, `${p.id}-${k}`, p.palette)}
      ${img?.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}
    </figure>`;
  const facts = [["Location", p.location], ["Year", p.year], ["Status", p.status], ["Scope", p.scope],
    ["Area", p.area], ["Client", p.client], ["Role", p.role]].filter(([, v]) => v);

  document.title = `${p.title} — ${data.name}`;
  document.querySelector('meta[name="description"]').content = p.summary || "";

  main.innerHTML = `
    <header class="project-head">
      <a class="back-link" href="/#work">← All projects</a>
      <h1 class="h2">${esc(p.title)}</h1>
      <p class="project-meta">${esc([p.category, place(p)].filter(Boolean).join(" · "))}</p>
    </header>
    <div class="project-cover">${fig(imgs[0], 0)}</div>
    <div class="project-info">
      <dl class="facts reveal">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      <div class="project-text reveal">${(p.description || [p.summary]).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
    </div>
    <div class="project-gallery">${imgs.slice(1).map((img, k) => fig(img, k + 1)).join("")}</div>
    <nav class="project-nav" aria-label="More projects">
      <a href="/projects/${prev.id}"><span class="label">Previous</span>${esc(prev.title)}</a>
      <a href="/projects/${next.id}" class="next"><span class="label">Next</span>${esc(next.title)}</a>
    </nav>`;

  // ← / → keys move between projects
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowLeft") location.href = `/projects/${prev.id}`;
    if (e.key === "ArrowRight") location.href = `/projects/${next.id}`;
  });

  observeReveals();
})();
