/*
 * ─────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — edit this file to make the site hers.
 * ─────────────────────────────────────────────────────────────
 *  • Text: just replace the strings below.
 *  • Photos: drop files into /images and list them in a project's
 *    `images` array, e.g. images: ["images/villa-1.jpg", "images/villa-2.jpg"].
 *    The first image is used as the cover. Use { src: "...", caption: "..." }
 *    instead of a plain path to add a caption. If `images` is empty,
 *    an abstract drawing is generated as a placeholder.
 *  • Add or remove projects by copying / deleting a { ... } block.
 */
window.PORTFOLIO = {
  name: "Kaltrina Ajdini",
  title: "Architect",
  location: "Based in Vienna — working worldwide",
  tagline: "Quiet buildings, carefully made. Spaces shaped by light, material and the people who live in them.",
  // Short paragraph shown under the tagline on the right.
  intro: "I work across design, documentation and technical coordination — from reading existing conditions precisely to resolving the details that make a building go together.",
  // Large image at the top of the page. Wide (landscape) images work best.
  heroImage: "images/200-s-wacker-2.jpg",
  // Contact section
  contactHeading: "Let’s build!",
  contactText: "Open to new roles, collaborations and freelance projects. Send a note and I’ll get back to you.",
  phone: "", // optional, e.g. "+1 (555) 555-5555"
  footerLine: "Architecture & Spatial Design",
  email: "hello@yourname.com",
  social: [
    { label: "Instagram", url: "https://instagram.com/" },
    { label: "LinkedIn", url: "https://linkedin.com/" },
    { label: "Issuu", url: "https://issuu.com/" },
  ],
  cv: "", // e.g. "files/cv.pdf" — leave empty to hide the button

  about: {
    portrait: "", // e.g. "images/portrait.jpg"
    bio: [
      "I am an architect interested in the overlap between careful construction and everyday life. My work moves between housing, small cultural buildings and interiors, always starting from the site — its light, its history and its materials.",
      "I studied architecture and have since worked in practices across Europe on projects from early competition stages through to construction on site. I enjoy hand sketching as much as building precise digital models, and I believe good detailing is a form of generosity.",
    ],
    education: [
      { years: "2018 — 2020", title: "M.Arch, Master of Architecture", place: "University Name" },
      { years: "2014 — 2018", title: "B.Arch, Bachelor of Architecture", place: "University Name" },
    ],
    experience: [
      { years: "2022 — Now", title: "Project Architect", place: "Studio Name, City" },
      { years: "2020 — 2022", title: "Architectural Designer", place: "Office Name, City" },
      { years: "2019", title: "Intern", place: "Practice Name, City" },
    ],
    // "Expertise" list in the About section
    services: ["Scan-to-BIM", "Existing conditions", "Design development", "Construction documents", "Technical coordination"],
    skills: ["Rhino", "Revit", "ArchiCAD", "AutoCAD", "Grasshopper", "Enscape", "V-Ray", "Photoshop", "InDesign", "Model making", "Hand drawing"],
    languages: ["English", "German", "Albanian"],
  },

  // Categories shown in the filter bar (must match project `category` values)
  categories: ["Technical", "Residential", "Cultural", "Interior", "Competition", "Academic"],

  projects: [
    {
      id: "200-s-wacker",
      title: "200 S Wacker",
      category: "Technical",
      year: "", // add the year here
      location: "Chicago, IL",
      status: "Documentation & coordination",
      scope: "Scan-to-BIM / Existing Conditions / Paving Coordination",
      role: "Scan-to-BIM modelling, documentation",
      summary: "A scan-based documentation and technical coordination study for the exterior plaza of 200 S Wacker in downtown Chicago.",
      description: [
        "A scan-based documentation and technical coordination study for the exterior plaza of 200 S Wacker in downtown Chicago. Working from laser-scanning data, I reconstructed the existing conditions in Archicad and developed coordinated plans, sections and details for the proposed plaza paving.",
        "The work evolved from documenting the existing geometry to resolving paving joints, elevations, drainage, precast interfaces and field conditions for fabrication and installation.",
      ],
      // Images can be a plain path, or { src, caption } to show a caption in the project view.
      images: [
        "images/200-s-wacker-1.jpg",
        { src: "images/200-s-wacker-2.jpg", caption: "Point cloud" },
        { src: "images/200-s-wacker-3.jpg", caption: "Archicad model" },
        { src: "images/200-s-wacker-sheet.jpg", caption: "Portfolio sheet" },
      ],
      palette: ["#e6e4e1", "#d9382f", "#1e1e1e"],
    },
    {
      id: "courtyard-house",
      title: "Courtyard House",
      category: "Residential",
      year: "2024",
      location: "Lake district, Austria",
      status: "Built",
      area: "240 m²",
      role: "Project architect",
      client: "Private",
      summary: "A single-family house arranged around a planted courtyard, opening to the lake on one side and closed to the road on the other.",
      description: [
        "The house is organised as a sequence of rooms around a central courtyard, which brings daylight deep into the plan and acts as an outdoor living room for most of the year.",
        "A heavy rammed-earth wall faces the road, while the lake façade dissolves into a timber frame with full-height glazing. Local larch, lime plaster and terrazzo floors form a restrained palette that will age gracefully.",
      ],
      images: [],
      palette: ["#d9cfc1", "#8c7b68", "#3b352f"],
    },
    {
      id: "library-pavilion",
      title: "Library Pavilion",
      category: "Cultural",
      year: "2023",
      location: "Prishtina, Kosovo",
      status: "Competition — 2nd prize",
      area: "1,100 m²",
      role: "Design lead",
      client: "Municipality",
      summary: "A neighbourhood library conceived as a covered public room under a folded concrete roof.",
      description: [
        "The pavilion extends the public park under a single folded roof. Reading spaces step down towards a sunken garden, creating quiet zones without closing walls.",
        "Clerestory windows between the roof folds bring soft northern light onto the shelves, and the ground floor remains open to the street during the day.",
      ],
      images: [],
      palette: ["#e4e1da", "#9aa39b", "#2f3a36"],
    },
    {
      id: "apartment-renovation",
      title: "Apartment on Marktgasse",
      category: "Interior",
      year: "2023",
      location: "Vienna, Austria",
      status: "Built",
      area: "95 m²",
      role: "Architect",
      client: "Private",
      summary: "The renovation of a 19th-century apartment, reorganised around a new built-in timber wall.",
      description: [
        "A continuous oak wall holds the kitchen, storage and a hidden study, freeing the original rooms to be read again in their full proportions.",
        "Original parquet and stucco were restored; new elements are kept deliberately simple so the old and new speak clearly to each other.",
      ],
      images: [],
      palette: ["#efe7dc", "#b89474", "#4a3a2c"],
    },
    {
      id: "harbour-housing",
      title: "Harbour Housing",
      category: "Residential",
      year: "2022",
      location: "Rotterdam, Netherlands",
      status: "Under construction",
      area: "6,800 m²",
      role: "Architectural designer",
      client: "Housing association",
      summary: "Sixty-four affordable homes with shared gallery walkways and a communal roof garden.",
      description: [
        "The block is cut and stepped to let sunlight into the shared courtyard. Generous gallery walkways double as front porches, encouraging neighbourly encounters.",
        "Brick in three tones ties the building into the surrounding harbour warehouses.",
      ],
      images: [],
      palette: ["#e6d8cc", "#b0705a", "#3d2a24"],
    },
    {
      id: "chapel",
      title: "Chapel of Light",
      category: "Competition",
      year: "2021",
      location: "Alpine valley, Switzerland",
      status: "Competition entry",
      area: "120 m²",
      role: "Team member",
      client: "—",
      summary: "A small stone chapel where a single opening tracks the sun across the year.",
      description: [
        "A compact volume of local stone is carved by one oculus. The changing patch of light measures the hours and seasons on the interior walls.",
      ],
      images: [],
      palette: ["#ece9e3", "#a7a29a", "#26272a"],
    },
    {
      id: "thesis",
      title: "Re-inhabiting the Factory",
      category: "Academic",
      year: "2020",
      location: "Master thesis",
      status: "Academic",
      area: "—",
      role: "Author",
      client: "University",
      summary: "A thesis on the adaptive reuse of a disused textile factory as a school and workshops.",
      description: [
        "The project keeps the existing concrete frame and inserts lightweight timber volumes, turning the former production halls into a learning landscape.",
        "Research included a full survey of the existing structure and a material reuse inventory.",
      ],
      images: [],
      palette: ["#e0ddd5", "#7d8a8f", "#2b3236"],
    },
  ],
};
