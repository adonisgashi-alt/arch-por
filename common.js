/* Shared by every page: helpers, header, menu, footer and fade-ins. */
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

  function media(img, alt, seed, palette, w, h) {
    const src = imgSrc(img);
    return src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />` : drawing(seed, palette, w, h);
  }

  const imgSrc = (img) => (typeof img === "string" ? img : img?.src);
  const cover = (p) => p.images?.[0];
  const place = (p) => [p.location, p.year].filter(Boolean).join(", ");

  // On the home page section links are "#about"; elsewhere they point back to "/#about".
  const onHome = document.body.dataset.page === "home";
  const home = onHome ? "" : "/";

  /* ── Header + mobile menu ── */
  document.getElementById("site-header").outerHTML = `
  <header class="site-header">
    <a href="${onHome ? "#top" : "/"}" class="brand">${esc(data.name)}</a>
    <nav class="nav" aria-label="Main">
      <a href="${home}#projects">Projects</a>
      <a href="${home}#explore">Index</a>
      <a href="${home}#about">About</a>
    </nav>
    <a href="${home}#contact" class="btn btn-small">Contact</a>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu">
      <span></span><span></span>
    </button>
  </header>
  <div class="menu" id="menu" aria-hidden="true">
    <nav aria-label="Mobile">
      <a href="${home}#projects">Projects</a>
      <a href="${home}#explore">Index</a>
      <a href="${home}#experience">Experience</a>
      <a href="${home}#about">About</a>
    </nav>
    <a href="${home}#contact" class="btn">Contact</a>
  </div>`;

  const burger = $("#burger"), menu = $("#menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("locked", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("open") && setMenu(false));

  /* ── Footer ── */
  const links = data.social.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`);
  if (data.cv) links.push(`<a href="/${esc(data.cv)}" download>Download CV</a>`);
  document.getElementById("site-footer").outerHTML = `
  <footer class="site-footer theme-black">
    <div class="footer-row">
      <p>${esc(data.footerLine)}</p>
      <p><a href="mailto:${esc(data.email)}">${esc(data.email)}</a>${data.phone ? `<br />${esc(data.phone)}` : ""}</p>
      <p>${links.join("<br />")}</p>
    </div>
    <p class="copyright">© ${new Date().getFullYear()} ${esc(data.name)}</p>
  </footer>`;

  /* ── Simple text bindings ── */
  document.querySelectorAll("[data-bind]").forEach((el) => (el.textContent = data[el.dataset.bind] || ""));

  /* ── Fade in on scroll (call again after adding .reveal elements) ── */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.1 });
  const observeReveals = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));

  window.Site = { data, $, esc, media, cover, place, setMenu, observeReveals };
})();
