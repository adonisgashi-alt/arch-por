(function () {
  const data = window.PORTFOLIO;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── Generated placeholder drawings (used when a project has no photos) ── */
  function rng(seed) {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  }

  function drawing(seed, palette, w = 1200, h = 900) {
    const [light, mid, dark] = palette || ["#e3ddd3", "#9b8f80", "#2d2a26"];
    const r = rng(seed);
    const style = Math.floor(r() * 4);
    let s = `<rect width="${w}" height="${h}" fill="${light}"/>`;

    if (style === 0) {
      // Façade: grid of deep window reveals
      const cols = 4 + Math.floor(r() * 4), rows = 3 + Math.floor(r() * 3);
      const mx = w * 0.12, my = h * 0.14, cw = (w - mx * 2) / cols, rh = (h - my * 2) / rows;
      s += `<rect x="${mx - 20}" y="${my - 20}" width="${w - mx * 2 + 40}" height="${h - my * 2 + 40}" fill="${mid}" opacity=".35"/>`;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = mx + i * cw + cw * 0.2, y = my + j * rh + rh * 0.15;
        s += `<rect x="${x}" y="${y}" width="${cw * 0.6}" height="${rh * 0.7}" fill="${dark}" opacity="${0.55 + r() * 0.4}"/>`;
        s += `<rect x="${x}" y="${y}" width="${cw * 0.12}" height="${rh * 0.7}" fill="${mid}" opacity=".6"/>`;
      }
    } else if (style === 1) {
      // Arcade of arches with long shadows
      const n = 3 + Math.floor(r() * 3), gap = w / (n + 1), aw = gap * 0.55, base = h * 0.82;
      s += `<rect x="0" y="${base}" width="${w}" height="${h - base}" fill="${mid}" opacity=".45"/>`;
      for (let i = 1; i <= n; i++) {
        const cx = gap * i, top = h * 0.28;
        s += `<path d="M${cx - aw / 2} ${base} V${top + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${cx + aw / 2} ${top + aw / 2} V${base} Z" fill="${dark}" opacity=".85"/>`;
        s += `<path d="M${cx - aw / 2} ${base} L${cx - aw / 2 + 160} ${h} L${cx + aw / 2 + 160} ${h} L${cx + aw / 2} ${base} Z" fill="${dark}" opacity=".18"/>`;
      }
    } else if (style === 2) {
      // Section: stepped volumes and a single light shaft
      let x = 0, y = h * (0.45 + r() * 0.2);
      const steps = 5 + Math.floor(r() * 4), sw = w / steps;
      let d = `M0 ${h} L0 ${y}`;
      for (let i = 0; i < steps; i++) { y += (r() - 0.5) * h * 0.2; x += sw; d += ` L${x - sw} ${y} L${x} ${y}`; }
      d += ` L${w} ${h} Z`;
      s += `<path d="${d}" fill="${mid}" opacity=".7"/>`;
      s += `<rect x="${w * 0.08}" y="${h * 0.12}" width="${w * 0.84}" height="${h * 0.08}" fill="${dark}"/>`;
      const lx = w * (0.3 + r() * 0.4);
      s += `<path d="M${lx} ${h * 0.2} L${lx + 70} ${h * 0.2} L${lx + 240} ${h} L${lx + 90} ${h} Z" fill="#fff" opacity=".45"/>`;
    } else {
      // Plan: walls and rooms in line drawing
      s += `<g stroke="${dark}" fill="none">`;
      const m = 120;
      s += `<rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" stroke-width="14"/>`;
      for (let i = 0; i < 5; i++) {
        const vertical = r() > 0.5;
        if (vertical) { const x = m + r() * (w - m * 2); s += `<line x1="${x}" y1="${m}" x2="${x}" y2="${m + r() * (h - m * 2)}" stroke-width="8"/>`; }
        else { const y = m + r() * (h - m * 2); s += `<line x1="${m}" y1="${y}" x2="${m + r() * (w - m * 2)}" y2="${y}" stroke-width="8"/>`; }
      }
      s += `</g>`;
      s += `<circle cx="${w * (0.3 + r() * 0.4)}" cy="${h * (0.3 + r() * 0.4)}" r="${90 + r() * 80}" fill="${mid}" opacity=".35"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder drawing">${s}</svg>`;
  }

  function media(src, alt, seed, palette, w, h) {
    return src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />` : drawing(seed, palette, w, h);
  }

  /* ── Bind simple text ── */
  document.title = `${data.name} — ${data.title}`;
  document.querySelectorAll("[data-bind]").forEach((el) => (el.textContent = data[el.dataset.bind] || ""));
  $("#year").textContent = new Date().getFullYear();

  /* ── Projects grid ── */
  const grid = $("#project-grid");
  grid.innerHTML = data.projects.map((p, i) => `
    <button class="card reveal" data-index="${i}" data-category="${esc(p.category)}">
      <div class="card-media">${media(p.images?.[0], p.title, p.id, p.palette)}</div>
      <div class="card-caption">
        <div>
          <h3 class="card-title">${esc(p.title)}</h3>
          <p class="card-summary">${esc(p.summary)}</p>
        </div>
        <div class="card-meta">${esc(p.category)}<br />${esc(p.year)}</div>
      </div>
    </button>`).join("");

  /* ── Filters ── */
  const filters = $(".filters");
  const used = data.categories.filter((c) => data.projects.some((p) => p.category === c));
  filters.innerHTML = ["All", ...used].map((c, i) =>
    `<button role="tab" aria-selected="${i === 0}" data-filter="${esc(c)}">${esc(c)}</button>`).join("");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b === btn));
    const f = btn.dataset.filter;
    grid.querySelectorAll(".card").forEach((c) => c.classList.toggle("hidden", f !== "All" && c.dataset.category !== f));
  });

  /* ── About ── */
  const a = data.about;
  $("#about-portrait").innerHTML = media(a.portrait, data.name, "portrait-" + data.name, ["#e2dcd2", "#a89a88", "#3a342e"], 800, 1000);
  $("#about-bio").innerHTML = a.bio.map((p) => `<p>${esc(p)}</p>`).join("");
  const tl = (list) => list.map((x) => `<li><span class="yrs">${esc(x.years)}</span><span>${esc(x.title)}<span class="place">${esc(x.place)}</span></span></li>`).join("");
  $("#about-experience").innerHTML = tl(a.experience);
  $("#about-education").innerHTML = tl(a.education);
  $("#about-skills").innerHTML = a.skills.map((s) => `<li>${esc(s)}</li>`).join("");
  $("#about-languages").innerHTML = a.languages.map((s) => `<li>${esc(s)}</li>`).join("");

  /* ── Contact ── */
  const email = $("#contact-email");
  email.textContent = data.email;
  email.href = `mailto:${data.email}`;
  const links = data.social.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`);
  if (data.cv) links.push(`<a href="${esc(data.cv)}" target="_blank" rel="noopener">Download CV ↓</a>`);
  $("#contact-links").innerHTML = links.join("");

  /* ── Project overlay ── */
  const overlay = $("#overlay");
  let current = 0, lastFocus = null;

  function openProject(i) {
    current = (i + data.projects.length) % data.projects.length;
    const p = data.projects[current];
    const imgs = p.images?.length ? p.images : [null, null, null];
    $("#p-gallery").innerHTML = imgs.map((src, k) =>
      `<figure>${media(src, `${p.title} — image ${k + 1}`, `${p.id}-${k}`, p.palette)}</figure>`).join("");
    $("#p-meta").textContent = `${p.category} · ${p.year}`;
    $("#p-title").textContent = p.title;
    const facts = [["Location", p.location], ["Status", p.status], ["Area", p.area], ["Client", p.client], ["Role", p.role]];
    $("#p-facts").innerHTML = facts.filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
    $("#p-text").innerHTML = (p.description || [p.summary]).map((t) => `<p>${esc(t)}</p>`).join("");
    overlay.scrollTop = 0;
    if (!overlay.classList.contains("open")) {
      lastFocus = document.activeElement;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      $("#overlay-close").focus();
    }
    history.replaceState(null, "", `#project/${p.id}`);
  }

  function closeProject() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    history.replaceState(null, "", "#work");
    lastFocus?.focus();
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openProject(+card.dataset.index);
  });
  $("#overlay-close").addEventListener("click", closeProject);
  $("#p-prev").addEventListener("click", () => openProject(current - 1));
  $("#p-next").addEventListener("click", () => openProject(current + 1));
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeProject();
    if (e.key === "ArrowRight") openProject(current + 1);
    if (e.key === "ArrowLeft") openProject(current - 1);
  });

  // Deep link: #project/<id>
  const m = location.hash.match(/^#project\/(.+)$/);
  if (m) {
    const i = data.projects.findIndex((p) => p.id === m[1]);
    if (i >= 0) openProject(i);
  }

  /* ── Header border + reveal on scroll ── */
  const header = $(".site-header");
  addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 10), { passive: true });
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
