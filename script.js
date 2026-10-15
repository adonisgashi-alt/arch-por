/* Home page: hero, project carousel, index, experience, about and contact. */
(function () {
  const { data, $, esc, media, cover, place, observeReveals } = window.Site;
  const projectUrl = (p) => `/projects/${p.id}`;
  const label = (p) => [p.category, place(p)].filter(Boolean).join(" · ");

  document.title = `${data.name} — ${data.title}`;

  /* ── Hero: crossfading project images, each linking to its project ── */
  const heroes = (data.heroImages || [{ src: data.heroImage || cover(data.projects[0]) }]).map((h) => ({
    ...h, p: data.projects.find((p) => p.id === h.project),
  }));
  $("#hero-media").innerHTML = heroes.map((h, i) => `
    <a class="hero-slide${i ? "" : " active"}" ${h.p ? `href="${projectUrl(h.p)}"` : ""}>
      ${media(h.src, h.p ? h.p.title : data.name, "hero" + i, null, 1600, 900).replace(' loading="lazy"', "")}
      ${h.p ? `<span class="hero-caption">${esc(h.p.title)} <span>→</span></span>` : ""}
    </a>`).join("") + (heroes.length > 1 ? `<div class="hero-dots">${heroes.map((_, i) => `<button aria-label="Show image ${i + 1}"${i ? "" : ' class="active"'}></button>`).join("")}</div>` : "");
  if (heroes.length > 1) {
    const slides = [...document.querySelectorAll(".hero-slide")], dots = [...document.querySelectorAll(".hero-dots button")];
    let cur = 0, timer;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === cur));
      dots.forEach((d, i) => d.classList.toggle("active", i === cur));
    };
    const play = () => { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(cur + 1), 5500); };
    dots.forEach((d, i) => d.addEventListener("click", () => { show(i); play(); }));
    play();
  }

  /* ── Projects carousel ── */
  const track = $("#carousel-track");
  track.innerHTML = data.projects.map((p) => `
    <li class="slide">
      <a href="${projectUrl(p)}">
        <div class="slide-media">${media(cover(p), p.title, p.id, p.palette)}</div>
        <h3 class="slide-title">${esc(p.title)}</h3>
        <p class="label">${esc(label(p))}</p>
        <span class="btn btn-small">View project</span>
      </a>
    </li>`).join("");
  const step = () => track.querySelector(".slide").offsetWidth + 20;
  const prev = $("#carousel-prev"), next = $("#carousel-next");
  const updateArrows = () => {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  track.addEventListener("scroll", updateArrows, { passive: true });
  addEventListener("resize", updateArrows);
  updateArrows();

  /* ── Project index ── */
  $("#explore-list").innerHTML = data.projects.map((p) => `
    <a class="explore-row reveal" href="${projectUrl(p)}">
      <p class="explore-title">${esc(p.title)}<span class="label">${esc(label(p))}</span></p>
      <p>${esc(p.summary)}</p>
      <div class="explore-media">${media(cover(p), p.title, p.id + "-x", p.palette)}</div>
    </a>`).join("");

  /* ── Experience ── */
  const a = data.about;
  $("#exp-cols").innerHTML = [...a.experience, ...a.education].map((x) => `
    <div class="exp-item reveal">
      <p class="label">${esc(x.years)}</p>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.place)}</p>
    </div>`).join("");

  /* ── About ── */
  $("#about-portrait").innerHTML = media(a.portrait, data.name, "portrait", ["#2a2927", "#5c5852", "#d8d4cc"], 800, 1120);
  $("#about-bio").innerHTML = a.bio.map((p) => `<p>${esc(p)}</p>`).join("");
  const lists = [
    ["Expertise", a.services],
    ["Software", a.skills],
    ["Certifications", a.certifications],
    ["Languages", a.languages],
  ].filter(([, items]) => items?.length);
  $("#about-lists").innerHTML = lists.map(([h, items]) =>
    `<div class="reveal"><h4>${h}</h4><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("") +
    (data.cv ? `<div class="about-cv reveal"><a class="btn" href="/${esc(data.cv)}" download>Download CV (PDF)</a></div>` : "");

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
