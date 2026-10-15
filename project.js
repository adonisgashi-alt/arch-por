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

  // Gallery layout: wide images fill the row; tall ones pair up side by side.
  // A tall image without a partner is shown centred at a comfortable height.
  const gallery = main.querySelector(".project-gallery");
  const figs = [...gallery.querySelectorAll("figure")];
  const ratio = (img) => new Promise((resolve) => {
    if (!img || img.tagName !== "IMG") return resolve(16 / 9);
    const done = () => resolve(img.naturalWidth / img.naturalHeight || 16 / 9);
    img.complete && img.naturalWidth ? done() : img.addEventListener("load", done, { once: true });
    img.addEventListener("error", () => resolve(16 / 9), { once: true });
  });
  Promise.all(figs.map((f) => ratio(f.querySelector("img")))).then((ratios) => {
    // Group consecutive tall images two at a time; widths follow each image's shape so a pair ends level
    let run = [];
    const flush = () => {
      for (let k = 0; k + 1 < run.length; k += 2) {
        const pair = document.createElement("div");
        pair.className = "pair";
        run[k].before(pair);
        [run[k], run[k + 1]].forEach((f) => { f.style.flex = `${ratios[figs.indexOf(f)]} 1 0`; pair.append(f); });
      }
      if (run.length % 2) run[run.length - 1].classList.add("solo");
      run = [];
    };
    figs.forEach((f, k) => (ratios[k] < 1.3 ? run.push(f) : flush()));
    flush();
  });

  observeReveals();
})();
