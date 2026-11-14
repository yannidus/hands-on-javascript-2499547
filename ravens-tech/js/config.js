/*
 * Ravens Tech site settings: the only file you need to edit to go live.
 * Anything left empty ("") falls back gracefully (see README.md).
 */
window.RAVENS_CONFIG = {
  contact: {
    email: "",      // e.g. "sales@ravenstech.com"  (also receives inquiries when no formEndpoint is set)
    phone: "",      // e.g. "+250 788 000 000"
    location: ""    // e.g. "Kigali, Rwanda"
  },

  // "Visit Product Website" buttons. Empty = button is hidden.
  productSites: {
    frosti: "",
    bean: "",
    znap: ""
  },

  // Product films (MP4, H.264). Empty = the play button opens the 3D showroom instead.
  // captions: optional WebVTT file for accessibility.
  films: {
    frosti: { src: "", captions: "" },
    bean: { src: "", captions: "" },
    znap: { src: "", captions: "" }
  },

  // Where the inquiry form POSTs (JSON). Works with Formspree, Getform, Basin, or your own API.
  // Empty = the form opens the visitor's email app with the inquiry pre-filled, addressed to contact.email.
  formEndpoint: "",

  // Privacy policy page (linked from the consent checkbox).
  privacyUrl: "privacy.html"
};
