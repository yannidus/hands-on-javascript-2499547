/* ==========================================================================
   SHANANA COFFEE — Site configuration
   --------------------------------------------------------------------------
   This is the ONE file to edit when verified business information becomes
   available. Every value left as `null` / empty renders as a clearly
   labeled "pending" placeholder on the site — nothing is invented.
   See IMPLEMENTATION.md for details.
   ========================================================================== */
window.SHANANA_CONFIG = {
  /* ---- Wholesale inquiry form -------------------------------------------
     provider:
       null        → form is NOT connected. The site says so honestly and
                     does not pretend to send anything.
       "formspree" → set endpoint to your Formspree URL, e.g.
                     "https://formspree.io/f/abcdwxyz"
       "netlify"   → deploy on Netlify; Netlify Forms captures submissions.
       "custom"    → POST JSON to your own HTTPS endpoint (endpoint required).
  ------------------------------------------------------------------------ */
  form: {
    provider: null,
    endpoint: ""
  },

  /* ---- Verified contact details (leave null until confirmed) ----------- */
  contact: {
    wholesaleEmail: null,   // e.g. "wholesale@shananacoffee.com"
    generalEmail: null,     // e.g. "hello@shananacoffee.com"
    phoneUS: null,          // e.g. "+1 (555) 010-0000"
    phoneRW: null,          // e.g. "+250 ..."
    rwandaAddress: null,    // e.g. "Nyaruguru District, Southern Province, Rwanda"
    usAddress: null         // U.S. entity / office address once established
  },

  /* ---- Social profiles (leave null to hide) ---------------------------- */
  social: {
    instagram: null,
    linkedin: null,
    facebook: null,
    x: null
  },

  /* ---- Product media ----------------------------------------------------
     frontImage: image used on the front panel of the 3D bag render.
     isPlaceholder: keep true while the illustrative render is in use; the
                    viewer then shows an "Illustrative render" label.
     frames: OPTIONAL real 360° photography. Provide an ordered list of
             images shot around the bag at equal angles (24 or 36 frames is
             typical). When present, the viewer switches to photo mode.
  ------------------------------------------------------------------------ */
  media: {
    frontImage: "assets/img/products/bag-front.webp",
    isPlaceholder: false,
    // Real turntable photography: 8 frames, 45° apart (source GIF was 414 px, so
    // replace with higher-resolution originals when available, ideally 24–36 frames).
    frames: Array.from({ length: 8 }, (_, i) => `assets/img/products/360/bag-${String(i + 1).padStart(2, "0")}.webp`)
  },

  /* ---- Impact reporting -------------------------------------------------
     Publish ONLY independently verifiable figures. `value: null` renders
     "Reporting in progress". Add `source` (e.g. "2027 Impact Report, p.4").
  ------------------------------------------------------------------------ */
  impactMetrics: [
    { label: "Women participating in cultivation and processing", value: null, source: null },
    { label: "Coffee-growing households partnered with", value: null, source: null },
    { label: "Jobs supported in production, packaging and logistics", value: null, source: null },
    { label: "Education-focused family investments supported", value: null, source: null }
  ]
};
