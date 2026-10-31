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
      <figcaption>${esc(short(imgs[a]))} / ${esc(short(imgs[b]))} — same view, move across to compare</figcaption>
    </figure>`;
  const row = (r) => {
    if (r.layout === "compare") return compare(r.images);
    const figs = r.images.map((k) => fig(imgs[k], k));
    if (r.layout === "feature") {
      return `<div class="g-row g-feature g-stack-${figs.length - 1}">${figs[0]}<div class="g-stack">${figs.slice(1).join("")}</div></div>`;
    }
    return `<div class="g-row g-${r.layout}">${figs.join("")}</div>`;
  };
  // Scroll reveal cover: pinned in the middle of the screen while scrolling turns the sketch
  // into the colour render as a watercolour wash rising from the bottom. Then the page scrolls on.
  const revealCover = () => `
    <div class="project-cover cover-reveal" id="cover-reveal" style="--ratio: ${p.coverReveal.ratio}">
      <div class="cover-reveal-pin">
        <figure class="cover-reveal-fig">
          <div class="frame cover-reveal-frame">
            ${media(imgs[0], imgs[0]?.caption || p.title, `${p.id}-0`, p.palette).replace(' loading="lazy"', "")}
            <div class="cover-reveal-lines">${p.coverReveal.sketch ? `<img src="/${esc(p.coverReveal.sketch)}" alt="" />` : ""}</div>
            <canvas aria-hidden="true"></canvas>
          </div>
          <figcaption class="cover-reveal-hint">Scroll to reveal</figcaption>
        </figure>
      </div>
    </div>`;
  const facts = [["Location", p.address || p.location], ["Year", p.year], ["Typology", p.typology], ["Status", p.status],
    ["Scope", p.scope], ["Discipline", p.discipline], ["Area", p.area], ["Client", p.client], ["Role", p.role]].filter(([, v]) => v);

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

  // ← / → keys move between projects (not while the image viewer is open)
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea") || document.body.classList.contains("lb-open")) return;
    if (e.key === "ArrowLeft") location.href = `/projects/${prev.id}`;
    if (e.key === "ArrowRight") location.href = `/projects/${next.id}`;
  });

  /* ── Image viewer: click a project image to see it full screen.
     Zoom with the scroll wheel, a pinch, double-click or + / −; drag to move around; ← / → for the next image.
     An image can set `zoom: "images/<name>-large.jpg"` in content.js to show a bigger file here only. ── */
  const shots = [...document.querySelectorAll(".project-cover.g-full .frame img, .project-gallery .frame:not(.compare) img")];
  if (shots.length) setupViewer(shots);
  function setupViewer(shots) {
    const big = (el) => {
      const m = imgs.find((im) => im && typeof im === "object" && im.zoom && el.src.endsWith(im.src));
      return m ? `/${m.zoom}` : el.currentSrc || el.src;
    };
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML = `
      <div class="lb-stage"><img alt="" draggable="false" /></div>
      ${shots.length > 1 ? `<button type="button" class="lb-arrow lb-prev" aria-label="Previous image">←</button>
        <button type="button" class="lb-arrow lb-next" aria-label="Next image">→</button>` : ""}
      <div class="lb-bar">
        <p class="lb-caption"><span class="lb-count"></span><span class="lb-text"></span></p>
        <div class="lb-tools">
          <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
          <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
          <button type="button" class="lb-close" aria-label="Close">×</button>
        </div>
      </div>`;
    document.body.appendChild(lb);
    const stage = lb.querySelector(".lb-stage"), view = stage.querySelector("img");
    let i = 0, s = 1, x = 0, y = 0, opener = null;
    const maxZoom = () => Math.max(3, (view.naturalWidth / (view.offsetWidth || 1)) * 2.5);
    const apply = (anim) => {
      view.style.transition = anim ? "transform .25s ease" : "none";
      view.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      lb.classList.toggle("zoomed", s > 1.01);
    };
    const clamp = () => {  // keep the zoomed image covering the screen, no empty edges
      const r = stage.getBoundingClientRect();
      const mx = Math.max(0, (view.offsetWidth * s - r.width) / 2), my = Math.max(0, (view.offsetHeight * s - r.height) / 2);
      x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y));
    };
    const zoomAt = (ns, cx, cy, anim) => {
      const r = stage.getBoundingClientRect();
      if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
      ns = Math.min(maxZoom(), Math.max(1, ns));
      const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
      x = px - (px - x) * (ns / s); y = py - (py - y) * (ns / s); s = ns;
      if (s === 1) x = y = 0;
      clamp(); apply(anim);
    };
    const show = (n) => {
      i = (n + shots.length) % shots.length;
      const el = shots[i];
      s = 1; x = y = 0; apply(false);
      view.src = big(el); view.alt = el.alt;
      lb.querySelector(".lb-text").textContent = el.closest("figure")?.querySelector("figcaption")?.textContent.trim() || el.alt;
      lb.querySelector(".lb-count").textContent = shots.length > 1 ? `${i + 1} / ${shots.length}` : "";
    };
    const open = (n) => {
      opener = document.activeElement;
      show(n); lb.hidden = false;
      document.body.classList.add("locked", "lb-open");
      requestAnimationFrame(() => lb.classList.add("open"));
      lb.querySelector(".lb-close").focus();
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.classList.remove("locked", "lb-open");
      setTimeout(() => { lb.hidden = true; view.removeAttribute("src"); }, 200);
      opener?.focus?.();
    };

    shots.forEach((el, n) => {
      el.tabIndex = 0; el.setAttribute("role", "button");
      el.setAttribute("aria-label", `View larger: ${el.alt}`);
      el.addEventListener("click", () => open(n));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(n); } });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev")?.addEventListener("click", () => show(i - 1));
    lb.querySelector(".lb-next")?.addEventListener("click", () => show(i + 1));
    lb.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => zoomAt(s * (b.dataset.zoom === "in" ? 1.6 : 1 / 1.6), null, null, true)));
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(i - 1);
      else if (e.key === "ArrowRight") show(i + 1);
      else if (e.key === "+" || e.key === "=") zoomAt(s * 1.6, null, null, true);
      else if (e.key === "-") zoomAt(s / 1.6, null, null, true);
      else if (e.key === "0") zoomAt(1, null, null, true);
      else return;
      e.preventDefault();
    });
    stage.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(s * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY); }, { passive: false });
    view.addEventListener("dblclick", (e) => zoomAt(s > 1.01 ? 1 : 2.5, e.clientX, e.clientY, true));

    // Drag to pan, pinch to zoom, swipe to change image, tap outside the image to close
    const pts = new Map();
    let pinch = null, start = null, moved = false;
    stage.addEventListener("pointerdown", (e) => {
      stage.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, t: e.target }; moved = false; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s }; }
    });
    stage.addEventListener("pointermove", (e) => {
      const pt = pts.get(e.pointerId);
      if (!pt) return;
      const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
      pt.x = e.clientX; pt.y = e.clientY;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) moved = true;
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()];
        zoomAt(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      } else if (pts.size === 1 && s > 1.01) { x += dx; y += dy; clamp(); apply(false); }
    });
    const lift = (e) => {
      const single = pts.size === 1 && !pinch;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!single || !start || s > 1.01) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 60 && e.pointerType !== "mouse") show(i + (dx < 0 ? 1 : -1));
      else if (!moved && start.t === stage) close();
    };
    stage.addEventListener("pointerup", lift);
    stage.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); pinch = null; });
    addEventListener("resize", () => { if (!lb.hidden) { clamp(); apply(false); } });
  }

  /* ── Scroll reveal cover ── */
  const rc = $("#cover-reveal");
  if (rc) setupReveal(rc);
  function setupReveal(box) {
    const frame = box.querySelector(".cover-reveal-frame");
    const img = frame.querySelector("img"), canvas = frame.querySelector("canvas"), ctx = canvas.getContext("2d");
    const hint = box.querySelector(".cover-reveal-hint");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !ctx || !img) return box.classList.add("static");
    // The "before" is either a sketch image (tools/ink-sketch.py) or a traced line drawing (tools/trace-lines.py)
    if (!p.coverReveal.sketch) fetch(`/${p.coverReveal.lines}`).then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((svg) => { frame.querySelector(".cover-reveal-lines").innerHTML = svg; })
      .catch(() => box.classList.add("static"));

    // Watercolour wash: a soft, blotchy edge (layered noise) that bleeds upward from the bottom,
    // with a slightly darker rim where the "pigment" pools at the edge of the wash
    const RES = 5; // px per mask sample; the mask is scaled up smoothly, which softens the edge
    const SOFT = 0.045, RIM = 0.028;
    const mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    const rim = document.createElement("canvas"), rctx = rim.getContext("2d");
    const tint = document.createElement("canvas"), tctx = tint.getContext("2d");
    let cols = 0, rows = 0, thresholds, data, rdata, last = -1;
    // Smooth value noise, several octaves, so the edge has both big blooms and fine feathering
    const lattice = new Float32Array(64 * 64).map(() => Math.random());
    const smooth = (a) => a * a * (3 - 2 * a);
    const noise = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
      const at = (i, j) => lattice[((j & 63) << 6) | (i & 63)];
      const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
      const bot = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
      return top + (bot - top) * yf;
    };
    const fbm = (x, y) => 0.5 * noise(x, y) + 0.27 * noise(x * 2.1, y * 2.1) + 0.15 * noise(x * 4.3, y * 4.3) + 0.08 * noise(x * 9.1, y * 9.1);
    const layout = () => {
      const r = frame.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      tint.width = canvas.width; tint.height = canvas.height;
      cols = Math.max(1, Math.ceil(r.width / RES)); rows = Math.max(1, Math.ceil(r.height / RES));
      mask.width = rim.width = cols; mask.height = rim.height = rows;
      data = mctx.createImageData(cols, rows); rdata = rctx.createImageData(cols, rows);
      // Each point turns on at its own moment: lower first, the noise makes the wash front uneven
      thresholds = new Float32Array(cols * rows);
      const scale = 7 / cols; // noise features relative to the image width, the same on any screen
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const fromBottom = (rows - 1 - y) / Math.max(rows - 1, 1);
        thresholds[y * cols + x] = fromBottom * 0.68 + fbm(x * scale, y * scale) * 0.32;
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
      const front = t * (1 + 2 * SOFT + 0.06) - SOFT - 0.03; // 0 → nothing coloured, 1 → all of it
      const px = data.data, rp = rdata.data;
      for (let i = 0; i < thresholds.length; i++) {
        const d = front - thresholds[i];
        const a = d <= -SOFT ? 0 : d >= SOFT ? 1 : smooth((d + SOFT) / (2 * SOFT));
        px[i * 4 + 3] = a * 255;
        rp[i * 4 + 3] = t < 1 ? Math.max(0, 1 - Math.abs(d - SOFT * 0.4) / RIM) * 255 : 0;
      }
      mctx.putImageData(data, 0, 0);
      rctx.putImageData(rdata, 0, 0);
      const W = canvas.width, H = canvas.height;
      ctx.imageSmoothingEnabled = tctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = tctx.imageSmoothingQuality = "high";
      // the wash
      ctx.globalCompositeOperation = "copy";
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(img, 0, 0, W, H);
      // the pooled, darker edge: the render multiplied onto itself along the wash front
      tctx.globalCompositeOperation = "copy";
      tctx.drawImage(rim, 0, 0, W, H);
      tctx.globalCompositeOperation = "source-in";
      tctx.drawImage(img, 0, 0, W, H);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.22;
      ctx.drawImage(tint, 0, 0);
      ctx.globalAlpha = 1;
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

  /* ── Compare sliders: sweep once on their own when first seen, then follow the cursor (or a drag) ── */
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".compare").forEach((box) => {
    const range = box.querySelector(".compare-range");
    let auto = 0;
    const set = (v) => { box.style.setProperty("--pos", `${v}%`); range.value = v; };
    const stopAuto = () => { cancelAnimationFrame(auto); auto = 0; box.classList.remove("auto"); };
    range.addEventListener("input", () => { stopAuto(); set(+range.value); });
    range.addEventListener("pointerdown", stopAuto);
    // With a mouse the divider simply follows the cursor across the image (touch still drags)
    box.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = box.getBoundingClientRect();
      stopAuto();
      set(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)) * 10) / 10);
    });
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
