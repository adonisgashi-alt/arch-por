/* Contact page: a form that opens the visitor's email app. */
(function () {
  const { data, $, observeReveals } = window.Site;

  document.title = `Contact — ${data.name}, ${data.title}`;

  /* ── Contact form (opens the visitor's email app) ── */
  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `Portfolio enquiry from ${f.get("name")}`;
    const body = `${f.get("message") || ""}\n\n— ${f.get("name")} (${f.get("email")})`;
    location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  observeReveals();
})();
