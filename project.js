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
    <figure class="reveal"><div class="frame">${media(img, img?.caption || `${p.title} — image ${k + 1}`, `${p.id}-${k}`, p.palette)}</div>
      ${img?.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}
    </figure>`;
  // Gallery rows. A project can set `gallery` in content.js to group images (by their index in `images`):
  //   { layout: "full", images: [1] }        one image, full width
  //   { layout: "duo", images: [1, 2] }      two side by side, same height
  //   { layout: "feature", images: [3, 4, 5, 6] }  one large left, the rest stacked on the right
  //   { layout: "compare", images: [1, 2] }  the same view twice, with a slider between them
  //                                           (plays once when it comes into view, then it's draggable)
  // Without `gallery`, every image after the cover gets its own full-width row.
  const rows = p.gallery || imgs.slice(1).map((_, k) => ({ layout: "full", images: [k + 1] }));
  const short = (img) => (img?.caption || "").split(/ over | of /)[0];
  const compare = ([a, b]) => `
    <figure class="reveal g-row g-compare">
      <div class="frame compare" style="--pos: 50%">
        ${media(imgs[b], imgs[b]?.caption || p.title, `${p.id}-${b}`, p.palette)}
        <div class="compare-top">${media(imgs[a], imgs[a]?.caption || p.title, `${p.id}-${a}`, p.palette)}</div>
        <span class="compare-label compare-label-a">${esc(short(imgs[a]))}</span>
        <span class="compare-label compare-label-b">${esc(short(imgs[b]))}</span>
        <span class="compare-handle" aria-hidden="true"></span>
        <input class="compare-range" type="range" min="0" max="100" step="1" value="50"
          aria-label="Slide to compare: ${esc(short(imgs[a]))} on the left, ${esc(short(imgs[b]))} on the right" />
      </div>
      <figcaption>${esc(short(imgs[a]))} and ${esc(short(imgs[b]))}, same view — drag to compare</figcaption>
    </figure>`;
  const row = (r) => {
    if (r.layout === "compare") return compare(r.images);
    const figs = r.images.map((k) => fig(imgs[k], k));
    if (r.layout === "feature") {
      return `<div class="g-row g-feature g-stack-${figs.length - 1}">${figs[0]}<div class="g-stack">${figs.slice(1).join("")}</div></div>`;
    }
    return `<div class="g-row g-${r.layout}">${figs.join("")}</div>`;
  };
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
    <div class="project-cover g-full">${fig(imgs[0], 0)}</div>
    <div class="project-info">
      <dl class="facts reveal">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      <div class="project-text reveal">${(p.description || [p.summary]).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
    </div>
    <div class="project-gallery">${rows.map(row).join("")}</div>
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

  /* ── Compare sliders: sweep once on their own when first seen, then follow the visitor ── */
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".compare").forEach((box) => {
    const range = box.querySelector(".compare-range");
    let auto = 0;
    const set = (v) => { box.style.setProperty("--pos", `${v}%`); range.value = v; };
    const stopAuto = () => { cancelAnimationFrame(auto); auto = 0; box.classList.remove("auto"); };
    range.addEventListener("input", () => { stopAuto(); set(+range.value); });
    range.addEventListener("pointerdown", stopAuto);
    range.addEventListener("focus", () => box.classList.add("focus"));
    range.addEventListener("blur", () => box.classList.remove("focus"));
    if (still) return;
    // 50 → 88 → 12 → 50, eased, about 4.5 seconds
    const keys = [50, 88, 12, 50], seg = 1500;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const play = () => {
      const t0 = performance.now();
      box.classList.add("auto");
      const step = (now) => {
        const e = (now - t0) / seg, i = Math.floor(e);
        if (i >= keys.length - 1) { set(50); return stopAuto(); }
        set(keys[i] + (keys[i + 1] - keys[i]) * ease(e - i));
        auto = requestAnimationFrame(step);
      };
      auto = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { io.disconnect(); setTimeout(play, 600); }
    }, { threshold: 0.6 });
    io.observe(box);
  });

  observeReveals();
})();
