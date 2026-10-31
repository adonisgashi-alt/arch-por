/*
 * ─────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — edit this file to update the site.
 * ─────────────────────────────────────────────────────────────
 *  • Text: just replace the strings below.
 *  • Photos: drop files into /images and list them in a project's
 *    `images` array. The first image is the cover. Use
 *    { src: "...", caption: "..." } instead of a plain path to add a caption.
 *  • Add, remove or reorder projects by moving the { ... } blocks.
 *  • Each project gets its own page at /projects/<id>.
 */
window.PORTFOLIO = {
  name: "Kaltrina Ajdini",
  title: "Architect",
  location: "Prishtina, Kosovo · freelancing for PIKA 3D, Chicago",
  // Used for search engines and AI assistants (structured data, sitemap, llms.txt)
  site: "https://www.kaltrinaajdini.com",
  hometown: { city: "Prishtina", country: "XK" },
  worksFor: { name: "PIKA 3D", city: "Chicago", region: "IL", country: "US", role: "Freelance Architect" },
  tagline: "Beautiful, functional architecture that gives better shape to the places we live in.",
  // Short paragraph shown under the tagline on the right.
  intro: "Architect working across public buildings, housing, interiors and cultural heritage — from the first concept through construction documentation and site coordination. Currently freelancing for PIKA 3D, Chicago.",
  // Images that rotate at the top of the home page (wide images work best).
  // Hero: one featured project. The Hyatt render draws itself as a line drawing once per page load.
  // (Add more entries to turn it back into a slideshow.)
  heroImages: [
    { src: "images/hyatt-14.jpg", project: "hyatt-regency-chicago", lines: "images/hyatt-14-lines.svg" },
  ],
  // Contact section
  contactHeading: "Let’s build!",
  contactText: "Open to new roles, collaborations and design commissions. Send a note and I’ll get back to you.",
  phone: "", // optional — left off the public site on purpose
  footerLine: "Architecture & Interior Design",
  email: "kaltrinaajdini93@gmail.com",
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/kaltrina-ajdini/" },
    // { label: "Instagram", url: "https://instagram.com/..." },
  ],
  cv: "files/Kaltrina-Ajdini-CV.pdf", // rebuild with: node tools/build-cv.js (source: tools/cv.html)

  about: {
    portrait: "images/portrait.jpg",
    bio: [
      "I’m an architect from Prishtina. My goal is always to give better shape to the built environment through beautiful, functional architecture — buildings and interiors that work well for the people who use them.",
      "I studied architecture at the University of Prishtina “Hasan Prishtina” and spent three years at New Dimension Architecture, designing commercial and residential projects with budgets up to €6 million across every phase, from concept to construction documents and on-site supervision. Alongside practice I’ve worked on cultural heritage — documenting and protecting monuments with the Ministry of Culture, Youth and Sport and Cultural Heritage without Borders.",
      "Today I work as a freelance architect for PIKA 3D in Chicago.",
      "I’m detail-oriented, a fast learner and at my best in a team, comfortable juggling several projects at once.",
    ],
    experience: [
      { years: "Current", title: "Freelance Architect", place: "PIKA 3D, Chicago" },
      { years: "Sept – Nov 2019", title: "Intern Architect", place: "Ministry of Culture, Youth and Sport, Prishtina" },
      { years: "2016 — 2019", title: "Architect", place: "New Dimension Architecture, Prishtina" },
      { years: "June – July 2019", title: "Heritage Lab — “Refinding the Heritage of Letnica”", place: "Cultural Heritage without Borders (CHwB) Kosovo" },
      { years: "June 2015", title: "“Santefaction” — access in public spaces", place: "Kosovo Architecture Festival workshop" },
    ],
    education: [
      { years: "2012 — 2020", title: "Master of Technical Sciences — Architecture", place: "University of Prishtina “Hasan Prishtina”, Faculty of Civil Engineering and Architecture" },
    ],
    // "Expertise" list in the About section
    services: ["Concept & design development", "Construction documentation", "3D modelling & visualisation", "Interior design", "Cultural heritage documentation", "Scan-to-BIM & existing conditions"],
    skills: ["ArchiCAD", "AutoCAD", "SketchUp", "Autodesk 3ds Max", "Lumion", "Adobe Photoshop", "Microsoft Excel", "Microsoft PowerPoint"],
    certifications: [
      "ArchiCAD 17 — 3D modelling & documentation, archiEDU",
      "Photoshop CS6 — post-processing, archiEDU",
      "3ds Max 2016 — modelling & rendering, VIProduct",
      "SketchUp — 3D modelling & documentation, VIProduct",
    ],
    languages: ["Albanian — native", "English — full", "Turkish — fluent", "Serbian — fluent", "French — elementary"],
  },

  projects: [
    {
      id: "hyatt-regency-chicago",
      title: "Hyatt Regency Chicago",
      // The cover starts as a pen-and-ink sketch; scrolling washes in the colour render (cover image only)
      coverReveal: { sketch: "images/hyatt-14-ink.svg", ratio: 2000 / 1125 },
      category: "Documentation",
      year: "2026",
      location: "Chicago, IL",
      address: "151 E Wacker Drive, Chicago, Illinois, USA",
      typology: "Hospitality / Hotel",
      status: "Technical documentation and coordination completed. Construction status not confirmed.",
      scope: "Selected exterior plaza areas — existing-condition documentation, paving-system evaluation, elevation analysis and precast support detailing",
      discipline: "Architectural / Technical",
      role: "Architectural & BIM Specialist — Scan-to-BIM · Technical Documentation · Elevation Analysis · System Feasibility · Detail Development",
      summary: "Scan-based documentation and technical development for selected exterior plaza areas of the Hyatt Regency Chicago on East Wacker Drive.",
      description: [
        "A scan-based documentation and technical development project for selected exterior areas of the Hyatt Regency Chicago. Following the identification of discrepancies between the available drawings and laser-scanning data, I reconstructed the existing conditions in Archicad, developing a coordinated 3D model, plans, sections and elevations.",
        "The work progressed into the evaluation of proposed paving systems and the coordination of existing precast elements with surrounding site conditions. Through elevation analysis, feasibility studies and the development of area-specific bent-plate details, the project addressed varying site conditions and established a coordinated basis for further technical development and fabrication.",
      ],
      images: [
        "images/hyatt-14.jpg",
        { src: "images/hyatt-2.jpg", caption: "Laser-scan point cloud over the Archicad model" },
        { src: "images/hyatt-1.jpg", caption: "Archicad model of the plaza, same view" },
        { src: "images/hyatt-key-plan.jpg", caption: "Key plan — work areas 01 / North and 02 / East" },
        { src: "images/hyatt-street-light.jpg", caption: "Model view from Wacker Drive — tower, pavilion and plaza" },
        { src: "images/hyatt-scan-top.jpg", caption: "Area North, top view — model over point cloud, work areas marked" },
        { src: "images/hyatt-scan-perspective.jpg", caption: "Area North — point cloud with the model in the work areas" },
        { src: "images/hyatt-scan-elevation.jpg", caption: "Area North elevation — point cloud with the model in the work area" },
        { src: "images/hyatt-plan-areas.jpg", caption: "Plan of areas A, C, E and J with dimensions" },
        { src: "images/hyatt-spot-elevations.jpg", caption: "Spot-elevation survey of the plaza" },
        { src: "images/hyatt-stone-cap-plan.jpg", caption: "Area North — stone cap plan" },
        { src: "images/hyatt-elevations.jpg", caption: "Area North — south, north, west and east elevations" },
        { src: "images/hyatt-bent-plate.jpg", caption: "SS316 bent plate — shop drawing" },
        { src: "images/hyatt-bent-detail.jpg", caption: "Bent detail — Area J" },
        { src: "images/hyatt-white-tower.jpg", caption: "Model view — tower and plaza from Wacker Drive" },
        { src: "images/hyatt-white-pavilion.jpg", caption: "Model view — the pavilion and plaza at street level" },
        { src: "images/hyatt-white-planter.jpg", caption: "Model view — Area North planter" },
      ],
      // How the images after the cover are arranged (numbers are positions in `images`, cover = 0)
      gallery: [
        { layout: "full", images: [3] },
        { layout: "full", images: [4] },
        { layout: "compare", images: [1, 2] },
        { layout: "full", images: [5] },
        { layout: "duo", images: [6, 7] },
        { layout: "full", images: [8] },
        { layout: "full", images: [9] },
        { layout: "duo", images: [10, 11] },
        { layout: "duo", images: [12, 13] },
        { layout: "feature", images: [14, 15, 16] },
      ],
    },
    {
      id: "200-s-wacker",
      title: "200 S Wacker",
      category: "Documentation",
      year: "",
      location: "Chicago, IL",
      status: "Documentation & coordination",
      scope: "Scan-to-BIM / Existing Conditions / Paving Coordination",
      role: "Scan-to-BIM modelling, documentation",
      summary: "A scan-based documentation and technical coordination study for the exterior plaza of 200 S Wacker in downtown Chicago.",
      description: [
        "A scan-based documentation and technical coordination study for the exterior plaza of 200 S Wacker in downtown Chicago. Working from laser-scanning data, I reconstructed the existing conditions in Archicad and developed coordinated plans, sections and details for the proposed plaza paving.",
        "The work evolved from documenting the existing geometry to resolving paving joints, elevations, drainage, precast interfaces and field conditions for fabrication and installation.",
      ],
      images: [
        "images/200-s-wacker-1.jpg",
        { src: "images/200-s-wacker-2.jpg", caption: "Point cloud" },
        { src: "images/200-s-wacker-3.jpg", caption: "Archicad model" },
        { src: "images/200-s-wacker-4.jpg", caption: "Existing condition plan" },
      ],
      gallery: [
        { layout: "duo", images: [1, 2] },
        { layout: "full", images: [3] },
      ],
    },
    {
      id: "primary-school",
      title: "Primary School",
      category: "Public facility",
      summary: "A school organised around group learning, with shared spaces and an atrium between the classrooms.",
      description: [
        "The design of the school has been based on the organization of qualitative group learning. Particular attention has been paid to student socialism, which is why space for many purposes and the atrium are located between classes.",
        "The school is also thought to be an ecological facility with green roofs and solar panels.",
      ],
      scope: "Concept, site plan, floor plans, interiors",
      images: [
        "images/school-1.jpg",
        { src: "images/school-2.jpg", caption: "Shared learning space" },
        { src: "images/school-3.jpg", caption: "Classroom opening onto the atrium" },
        { src: "images/school-4.jpg", caption: "Site plan, ground floor and section" },
      ],
      gallery: [
        { layout: "duo", images: [1, 2] },
        { layout: "full", images: [3] },
      ],
    },
    {
      id: "olympic-pool",
      title: "Olympic Pool",
      category: "Public facility",
      summary: "A sports centre that pulls the surrounding greenery into the building through long views.",
      description: [
        "The concept of the Olympic pool is based on the use and integration of green space in the building through wonderful views, which enables the organic connection between indoor and outdoor space. The location itself has made this possible, as the integrated greenery surrounds the entire space, while also using it as a recreational space.",
        "Particular emphasis has been placed on the entrance part, which is related to the existing basketball court. With the addition of the Olympic swimming pool, this facility today functions as a sports center.",
      ],
      scope: "Concept, plans, sections, details",
      images: [
        "images/pool-2.jpg",
        { src: "images/pool-1.jpg", caption: "Approach through the greenery" },
        { src: "images/pool-3.jpg", caption: "Street elevation" },
        { src: "images/pool-4.jpg", caption: "Ground floor, sections and tribune seating detail" },
      ],
      gallery: [
        { layout: "full", images: [1] },
        { layout: "full", images: [2] },
        { layout: "full", images: [3] },
      ],
    },
    {
      id: "office-building",
      title: "Office Building",
      category: "Public facility",
      summary: "An office building with a rigid urban façade and a second skin of aluminium louvres over a transparent curtain wall.",
      description: [
        "The design of the project started with the creation of a structure that gives the facility a pronounced concentration in the interior area, without turning away from the road from which access is made.",
        "The second challenge was to create a rigid façade from an urban perspective on the one hand, and to maximise transparency on the exterior wall to benefit the interior on the other. To achieve this, the second skin of the façade was designed as a combination of prefabricated vertical aluminium louvres attached to the curtain wall behind it to save energy, in addition to meeting the needs of the interior space.",
      ],
      scope: "Concept, plans, section, façade detail, interiors",
      images: [
        "images/office-1.jpg",
        { src: "images/office-4.jpg", caption: "Louvred second skin" },
        { src: "images/office-2.jpg", caption: "Interior" },
        { src: "images/office-3.jpg", caption: "Typical floor plan and façade" },
      ],
      gallery: [
        { layout: "duo", images: [1, 2] },
        { layout: "full", images: [3] },
      ],
    },
    {
      id: "flexible-housing",
      title: "Flexible Housing",
      category: "Residential",
      summary: "A housing block whose apartments can adapt to the changing needs of the people living in them.",
      description: [
        "Studies have shown that the most accurate and precise way of conceptualising the living space derives from the needs of the residents, the variety of which cannot even be imagined. Housing needs are a dynamic category, and the buildings we build today are incapable of conveying that dynamic.",
        "In this building, solutions have been made which enable at least partial adaptation of the apartment for the unpredictable needs of the residents. Flexibility is considered to be the main criterion for meeting the diverse needs of residents.",
      ],
      scope: "Concept, unit combinations, plans, sections, façades",
      images: [
        "images/housing-3.jpg",
        { src: "images/housing-1.jpg", caption: "Façade with planted balconies" },
        { src: "images/housing-2.jpg", caption: "Courtyard" },
        { src: "images/housing-4.jpg", caption: "Section, elevation and apartment variations" },
      ],
      gallery: [
        { layout: "duo", images: [1, 3] },
        { layout: "full", images: [2] },
      ],
    },
    {
      id: "geodes-office",
      title: "Geodes Office",
      category: "Interior design",
      summary: "A green, technologically advanced office interior designed around flexible work and employee well-being.",
      description: [
        "The purpose of this design task is to create an innovative, technologically advanced office that would encourage flexible work, collaboration, work mobility and inspiration, all while staying as green as possible based on high-quality design, use of wood, light that consumes very little energy, furniture made of recyclable materials, printing and other recycling equipment. The other goal is to protect and promote employee well-being.",
        "There are many factors that affect the well-being of the workplace. Allowing staff to work effectively in different environments within the same space is key to both productivity and workplace well-being. Delicate changes designed for employee well-being can have an effect on happiness and productivity — a happy workforce is a productive workforce.",
      ],
      scope: "Space planning, interiors, materials, furniture",
      images: [
        "images/geodes-1.jpg",
        { src: "images/geodes-2.jpg", caption: "Working spaces" },
        { src: "images/geodes-3.jpg", caption: "Kitchen and well-being" },
        { src: "images/geodes-4.jpg", caption: "CEO’s office" },
        { src: "images/geodes-5.jpg", caption: "Plan, well-being concept and section" },
      ],
      gallery: [
        { layout: "feature", images: [1, 2, 3] },
        { layout: "full", images: [4] },
      ],
    },
  ],
};
