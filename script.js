/* Home page: the work list (and the hero slideshow, if the template includes it). */
(function () {
  const { data, $, esc, media, cover, place, observeReveals } = window.Site;
  const projectUrl = (p) => `/projects/${p.id}`;
  const pad2 = (n) => String(n).padStart(2, "0");
  const label = (p) => [p.category, place(p)].filter(Boolean).join(" · ");

  document.title = `${data.name} — ${data.title}`;

  /* ── Hero: slow crossfade between featured projects, with a quiet caption line underneath.
     Hidden for now — it only runs when the page has #hero-media. ── */
  const hero = $("#hero-media");
  if (hero) {
    const heroes = (data.heroImages || [{ src: data.heroImage || cover(data.projects[0]) }]).map((h) => ({
      ...h, p: data.projects.find((p) => p.id === h.project),
    }));
    hero.innerHTML = heroes.map((h, i) => `
      <a class="hero-slide${i ? "" : " active"}" ${h.p ? `href="${projectUrl(h.p)}"` : ""} tabindex="-1" aria-hidden="${!!i}">
        ${media(h.src, h.p ? h.p.title : data.name, "hero" + i, null, 1600, 900).replace(' loading="lazy"', "")}
      </a>`).join("");
    const caption = $("#hero-caption");
    caption.innerHTML = `
      <a class="hero-caption-text" href="#"><span class="hero-count"></span><span class="hero-title"></span><span class="hero-cat"></span></a>
      ${heroes.length > 1 ? `<span class="hero-nav"><button type="button" aria-label="Previous project">←</button><button type="button" aria-label="Next project">→</button></span>` : ""}`;
    const slides = [...hero.querySelectorAll(".hero-slide")];
    const capLink = caption.querySelector(".hero-caption-text");
    let cur = 0, timer;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle("active", i === cur); s.setAttribute("aria-hidden", i !== cur); });
      const p = heroes[cur].p;
      capLink.classList.add("swap");
      setTimeout(() => {
        capLink.hidden = !p;
        if (p) {
          capLink.href = projectUrl(p);
          capLink.querySelector(".hero-count").textContent = `${pad2(cur + 1)} / ${pad2(heroes.length)}`;
          capLink.querySelector(".hero-title").textContent = p.title;
          capLink.querySelector(".hero-cat").textContent = p.category || "";
        }
        capLink.classList.remove("swap");
      }, 250);
    };
    const play = () => {
      clearInterval(timer);
      if (heroes.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(cur + 1), 6000);
    };
    const [prevBtn, nextBtn] = caption.querySelectorAll(".hero-nav button");
    prevBtn?.addEventListener("click", () => { show(cur - 1); play(); });
    nextBtn?.addEventListener("click", () => { show(cur + 1); play(); });
    show(0);
    play();
  }

  /* ── Selected work: one list of projects, shown as a grid or as an index list ── */
  const work = $("#work-list");
  work.innerHTML = data.projects.map((p, i) => `
    <a class="work-item reveal" href="${projectUrl(p)}" data-index="${i}">
      <div class="work-media">${media(cover(p), p.title, p.id, p.palette)}</div>
      <span class="work-num">${pad2(i + 1)}</span>
      <span class="work-title">${esc(p.title)}</span>
      <span class="work-cat">${esc(p.category || "")}</span>
      <span class="work-loc">${esc(p.location || "")}</span>
      <span class="work-summary">${esc(p.summary)}</span>
      <span class="work-arrow" aria-hidden="true"></span>
    </a>`).join("");

  // Grid | List toggle (remembered per visitor)
  const toggles = [...document.querySelectorAll(".view-toggle button")];
  const setView = (v) => {
    work.dataset.view = v;
    toggles.forEach((t) => t.setAttribute("aria-pressed", t.dataset.view === v));
    try { localStorage.setItem("work-view", v); } catch (e) {}
  };
  toggles.forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));
  try { const saved = localStorage.getItem("work-view"); if (saved === "list" || saved === "grid") setView(saved); } catch (e) {}

  /* ── Old links: "/#about", "/#contact" now have their own pages; "#project/<id>" moved to /projects/<id> ── */
  const hash = location.hash.slice(1);
  const old = hash.match(/^project\/(.+)$/);
  if (old) location.replace(`/projects/${old[1]}`);
  else if (hash === "about" || hash === "contact") location.replace(`/${hash}`);
  else if (hash && location.protocol !== "file:") history.replaceState(null, "", "/");

  observeReveals();
})();
