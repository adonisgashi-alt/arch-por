/* Home page: hero, project carousel, index, experience, about and contact. */
(function () {
  const { data, $, esc, media, cover, place, observeReveals } = window.Site;
  const projectUrl = (p) => `/projects/${p.id}`;
  const pad2 = (n) => String(n).padStart(2, "0");
  const label = (p) => [p.category, place(p)].filter(Boolean).join(" · ");

  document.title = `${data.name} — ${data.title}`;

  /* ── Hero: slow crossfade between featured projects, with a quiet caption line underneath ── */
  const heroes = (data.heroImages || [{ src: data.heroImage || cover(data.projects[0]) }]).map((h) => ({
    ...h, p: data.projects.find((p) => p.id === h.project),
  }));
  const hero = $("#hero-media");
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

  /* ── About: bio, CV, experience & education timeline, then skills ── */
  const a = data.about;
  $("#about-portrait").innerHTML = media(a.portrait, data.name, "portrait", ["#2a2927", "#5c5852", "#d8d4cc"], 800, 1000);
  $("#about-bio").innerHTML = a.bio.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#about-cv").innerHTML = data.cv ? `<a class="btn" href="/${esc(data.cv)}" download>Download CV (PDF)</a>` : "";
  const timeline = (heading, items) => `
    <div class="timeline-block reveal">
      <h4>${heading}</h4>
      ${items.map((x) => `<div class="timeline-row"><span class="label">${esc(x.years)}</span><span><strong>${esc(x.title)}</strong><span class="label">${esc(x.place)}</span></span></div>`).join("")}
    </div>`;
  $("#about-timeline").innerHTML = timeline("Experience", a.experience) + timeline("Education", a.education);
  const lists = [
    ["Expertise", a.services],
    ["Software", a.skills],
    ["Certifications", a.certifications],
    ["Languages", a.languages],
  ].filter(([, items]) => items?.length);
  $("#about-lists").innerHTML = lists.map(([h, items]) =>
    `<div class="reveal"><h4>${h}</h4><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("");

  /* ── Contact form (opens the visitor's email app) ── */
  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `Portfolio enquiry from ${f.get("name")}`;
    const body = `${f.get("message") || ""}\n\n— ${f.get("name")} (${f.get("email")})`;
    location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ── Section links scroll without adding "#section" to the URL ── */
  const scrollToSection = (id, smooth = true) => {
    const el = id && id !== "top" && document.getElementById(id);
    const root = document.documentElement;
    if (!smooth) root.style.scrollBehavior = "auto"; // jump straight there, overriding the CSS smooth scroll
    el ? el.scrollIntoView({ behavior: smooth ? "smooth" : "instant" }) : scrollTo({ top: 0, behavior: smooth ? "smooth" : "instant" });
    root.style.scrollBehavior = "";
  };
  const cleanUrl = () => {
    if (location.protocol !== "file:" && (location.pathname !== "/" || location.hash)) history.replaceState(null, "", "/");
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    scrollToSection(link.getAttribute("href").slice(1));
    cleanUrl();
  });

  // Arriving from another page via "/#about" (or an old "#project/<id>" link)
  const old = location.hash.match(/^#project\/(.+)$/);
  if (old) location.replace(`/projects/${old[1]}`);
  else if (location.hash.length > 1) {
    const id = location.hash.slice(1);
    cleanUrl();
    requestAnimationFrame(() => scrollToSection(id, false));
    // Images above the section can shift it while loading, so settle once more after load
    addEventListener("load", () => scrollToSection(id, false), { once: true });
  }

  /* ── Highlight the menu link for the section on screen ── */
  const navLinks = [...document.querySelectorAll(".nav a")];
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${en.target.id}`));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  observeReveals();
})();
