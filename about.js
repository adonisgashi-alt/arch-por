/* About page: portrait, bio, CV, experience & education, then skills. */
(function () {
  const { data, $, esc, media, observeReveals } = window.Site;

  document.title = `About — ${data.name}, ${data.title}`;

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

  observeReveals();
})();
