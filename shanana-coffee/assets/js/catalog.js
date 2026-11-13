/* ==========================================================================
   SHANANA COFFEE — Product catalog
   --------------------------------------------------------------------------
   Confirmed facts only. Fields set to null display as "Pending confirmation".
   To add roast levels, grind options, collections or seasonal releases,
   add entries to `options` or new objects to `products` — the UI renders
   whatever is here.
   Wholesale pricing is intentionally NOT stored in public code.
   ========================================================================== */
window.SHANANA_CATALOG = {
  origin: {
    country: "Rwanda",
    region: "Nyaruguru, Southern Province",
    variety: "100% Arabica",
    altitude: "1,800–1,900 m",
    process: "Washed — depulped, fermented, washed and dried",
    notes: "Citrus, green apple, honey, floral sweetness, subtle nuttiness"
  },

  // Options not yet confirmed by Shanana — kept as data so they can be
  // switched on without code changes.
  options: {
    roastLevels: null,   // e.g. ["Medium"]
    grinds: null         // e.g. ["Whole bean", "Ground"]
  },

  // Current batch. Update when a new batch is released (shown on the Collection page and in the pamphlet).
  batch: { produced: "21 August 2026", bestBefore: "21 September 2028" },

  products: [
    {
      id: "250g",
      label: "250 g",
      name: "Compact Bag",
      netWeight: "250 g · 8.8 oz",
      buyers: ["Retail customers"],
      applications: "Compact retail format.",
      casePack: null,
      moq: null
    },
    {
      id: "12oz",
      label: "12 oz",
      name: "Retail Bag",
      netWeight: "12 oz · 340 g",
      buyers: ["Specialty retailers", "Café retail shelves"],
      applications: "Shelf-ready format for specialty retail and café merchandising.",
      casePack: null,
      moq: null
    },
    {
      id: "1lb",
      label: "1 lb",
      name: "Café & Retail Bag",
      netWeight: "1 lb · 454 g",
      buyers: ["Coffee shops", "Retail customers"],
      applications: "Versatile format for coffee-shop service and retail resale.",
      casePack: null,
      moq: null
    },
    {
      id: "2lb",
      label: "2 lb",
      name: "Service Bag",
      netWeight: "2 lb · 907 g",
      buyers: ["Cafés", "Offices", "Smaller foodservice businesses"],
      applications: "Efficient service size for daily brewing in cafés and workplaces.",
      casePack: null,
      moq: null
    },
    {
      id: "5lb",
      label: "5 lb",
      name: "Commercial Bag",
      netWeight: "5 lb · 2.27 kg",
      buyers: ["Restaurants", "Hotels", "Commercial cafés", "Distributors"],
      applications: "High-volume format for hospitality, commercial service and distribution.",
      casePack: null,
      moq: null
    }
  ]
};
