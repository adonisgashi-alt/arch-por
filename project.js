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
  // Scroll reveal cover: pinned in the middle of the screen while scrolling turns the line drawing
  // into the colour render, square by square from the bottom up. Then the page scrolls on.
  const revealCover = () => `
    <div class="project-cover cover-reveal" id="cover-reveal" style="--ratio: ${p.coverReveal.ratio}">
      <div class="cover-reveal-pin">
        <figure class="cover-reveal-fig">
          <div class="frame cover-reveal-frame">
            ${media(imgs[0], imgs[0]?.caption || p.title, `${p.id}-0`, p.palette).replace(' loading="lazy"', "")}
            <div class="cover-reveal-lines"></div>
            <canvas aria-hidden="true"></canvas>
          </div>
          <figcaption class="cover-reveal-hint">Scroll to reveal</figcaption>
        </figure>
      </div>
    </div>`;
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
    ${p.coverReveal ? revealCover() : `<div class="project-cover g-full">${fig(imgs[0], 0)}</div>`}
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

  /* ── Scroll reveal cover ── */
  const rc = $("#cover-reveal");
  if (rc) setupReveal(rc);
  function setupReveal(box) {
    const frame = box.querySelector(".cover-reveal-frame");
    const img = frame.querySelector("img"), canvas = frame.querySelector("canvas"), ctx = canvas.getContext("2d");
    const hint = box.querySelector(".cover-reveal-hint");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !ctx || !img) return box.classList.add("static");
    fetch(`/${p.coverReveal.lines}`).then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((svg) => { frame.querySelector(".cover-reveal-lines").innerHTML = svg; })
      .catch(() => box.classList.add("static"));

    const CELL = 18; // px per "bitmap" square
    const mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    let cols = 0, rows = 0, thresholds, data, last = -1;
    const layout = () => {
      const r = frame.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      cols = Math.max(1, Math.ceil(r.width / CELL)); rows = Math.max(1, Math.ceil(r.height / CELL));
      mask.width = cols; mask.height = rows;
      data = mctx.createImageData(cols, rows);
      // Each square turns on at its own point: lower rows first, with some noise so the edge is ragged
      thresholds = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const fromBottom = (rows - 1 - y) / Math.max(rows - 1, 1);
        thresholds[y * cols + x] = 0.02 + fromBottom * 0.78 + Math.random() * 0.18;
      }
      last = -1; draw();
    };
    const progress = () => {
      const r = box.getBoundingClientRect(), span = r.height - innerHeight;
      return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    };
    const draw = () => {
      const t = progress();
      hint.style.opacity = Math.max(0, 1 - t * 6);
      if (!img.complete || !img.naturalWidth || Math.abs(t - last) < 0.001) return;
      last = t;
      const px = data.data;
      for (let i = 0; i < thresholds.length; i++) px[i * 4 + 3] = t >= thresholds[i] ? 255 : 0;
      mctx.putImageData(data, 0, 0);
      ctx.globalCompositeOperation = "copy";
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-in";
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    };
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; draw(); });
    }, { passive: true });
    addEventListener("resize", layout);
    img.complete ? layout() : img.addEventListener("load", layout, { once: true });
  }

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
