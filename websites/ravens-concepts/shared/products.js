/* Product content shared by every Ravens Tech concept (copy is placeholder to confirm). */
export const PRODUCTS = {
  frosti: {
    key: "frosti",
    name: "Frosti",
    kind: "Robotic Ice Cream Dispenser",
    accent: "#48cfff", accent2: "#ff7ec8", accentHex: 0x48cfff,
    headline: ["Scoops of joy,", "served by a robot."],
    lead: "A fully automated ice cream experience: fresh flavours, toppings and a robot that builds your cone in about 90 seconds, right in front of you.",
    pills: ["Robotic", "90 sec", "Up to 3 scoops", "Touch-free"],
    variants: [
      { key: "vanilla", label: "Vanilla" },
      { key: "berry", label: "Strawberry swirl" },
      { key: "choco", label: "Triple chocolate" },
    ],
    steps: [
      ["Pick", "Choose a cone or cup, up to three scoops and your toppings on the touchscreen."],
      ["Pay", "Tap a card or phone, or scan a QR code. No cash, no queue."],
      ["Watch", "The robot scoops, stacks and tops your cone behind glass. It's the best show in the mall."],
      ["Enjoy", "Grab it from the pickup window, perfectly frozen at −18 °C."],
    ],
    features: [
      ["Fresh flavours", "12+ rotating flavours from partner creameries, kept at a constant −18 °C.", "source"],
      ["Built in 90 seconds", "A 6-axis arm portions every scoop identically. No drips, no waste.", "make"],
      ["Endlessly customizable", "Cone or cup, up to 3 scoops, sprinkles, sauces and toppings.", "screen"],
      ["Touch-free hygiene", "A sealed, UV-sanitised serving chamber: no hands touch your ice cream.", "wide"],
    ],
    specs: [["Footprint", "1.0 × 0.8 m"], ["Height", "1.95 m"], ["Serve time", "~90 seconds"], ["Capacity", "250 cones / day"], ["Flavours", "Up to 8 at once"], ["Freezer", "−18 °C, monitored 24/7"], ["Payments", "Card · Mobile · QR"], ["Connectivity", "4G / Wi-Fi telemetry"]],
    parts: { source: "Flavour tubs (8 × 2.5 L)", arm: "6-axis scooping arm", stage: "Cone holder & serving stage", module: "Freezer & compressor", dispenser: "Cone dispenser", screen: "Touchscreen & payment", header: "Illuminated header", shell: "Insulated cabinet" },
    venues: ["Malls", "Cinemas", "Theme parks", "Hotels", "Airports"],
  },
  beanbox: {
    key: "beanbox",
    name: "Bean Box",
    kind: "Robotic Coffee Dispenser",
    accent: "#ffb15c", accent2: "#ff6b3d", accentHex: 0xffb15c,
    headline: ["Barista-quality coffee.", "Made automatically."],
    lead: "Fresh, fast and customizable drinks for any location. Bean Box grinds, brews and serves café-grade coffee in about 60 seconds, 24/7.",
    pills: ["Robotic barista", "60 sec", "30+ drinks", "On casters"],
    variants: [
      { key: "espresso", label: "Espresso" },
      { key: "latte", label: "Latte" },
      { key: "iced", label: "Iced latte" },
    ],
    steps: [
      ["Choose", "Pick from 30+ hot and iced drinks on the touchscreen or in the app."],
      ["Pay", "Tap a card or phone, or scan a QR code. Contactless and fast."],
      ["Brew", "The robot grinds fresh beans and pulls a 9-bar shot at 92 °C in front of you."],
      ["Enjoy", "Your exact order is ready in about 60 seconds, any hour of the day."],
    ],
    features: [
      ["Fresh, every cup", "Whole beans are ground on demand for every drink. Milk is chilled at 3 °C.", "source"],
      ["Fast, without the rush", "A latte in about 60 seconds, and up to 300 cups a day with no queue.", "make"],
      ["Customizable", "Size, milk, strength, syrup, hot or iced. Save your favourite in the app.", "screen"],
      ["Any location, indoors or out", "A compact 1.4 × 0.9 m kiosk on lockable casters with wraparound glass. Roll it into a mall, lobby or shopfront.", "wide"],
    ],
    specs: [["Footprint", "1.4 × 0.9 m"], ["Height", "2.1 m"], ["Brew time", "~60 seconds"], ["Capacity", "300 cups / day"], ["Menu", "30+ hot & iced drinks"], ["Milk", "2 × refrigerated, 3 °C"], ["Payments", "Card · Mobile · QR"], ["Connectivity", "4G / Wi-Fi telemetry"]],
    parts: { source: "Bean hopper & grinder", arm: "6-axis robotic barista", stage: "Brew stage & cup", module: "Espresso unit & milk fridge", dispenser: "Cup dispenser", screen: "Payment tower & pickup window", header: "Canopy with downlights", shell: "Kiosk body & wraparound glass" },
    venues: ["Malls", "Offices", "Hotels", "Campuses", "Airports"],
  },
  znapcase: {
    key: "znapcase",
    name: "ZnapCase",
    kind: "Phone Case Customization Machine",
    accent: "#a77bff", accent2: "#ff5ec4", accentHex: 0xa77bff,
    headline: ["Your photo. Your case.", "In minutes."],
    lead: "Design, print and get your own custom phone case in minutes. Upload a photo from your phone or pick a design, and watch it print.",
    pills: ["UV print", "5 min", "60+ models", "MagSafe ready"],
    variants: [
      { key: "aurora", label: "Aurora" },
      { key: "sunset", label: "Sunset" },
      { key: "ocean", label: "Deep ocean" },
    ],
    steps: [
      ["Pick your model", "Choose from 60+ iPhone, Galaxy and Pixel models."],
      ["Upload or design", "Scan the QR code to send a photo, or pick from 1,000+ designs."],
      ["Print", "The robot UV-prints and cures your design with a scratch-resistant coat."],
      ["Collect", "Your case is sealed and delivered in about 5 minutes."],
    ],
    features: [
      ["Studio-grade ink", "CMYK + white UV inks at 1440 dpi that won't fade or peel.", "source"],
      ["Printed while you watch", "The print head sweeps your design onto the case in under 3 minutes.", "make"],
      ["Truly yours", "Your photos, text, patterns and artist collaborations, on 60+ models.", "screen"],
      ["Built for retail", "1 m², a standard outlet and automatic blank-case restocking alerts.", "wide"],
    ],
    specs: [["Footprint", "1.0 × 0.8 m"], ["Height", "1.95 m"], ["Print time", "~3–5 minutes"], ["Capacity", "120 cases / day"], ["Models", "60+ phone models"], ["Print", "UV CMYK + white, 1440 dpi"], ["Payments", "Card · Mobile · QR"], ["Connectivity", "4G / Wi-Fi telemetry"]],
    parts: { source: "UV ink cartridges", arm: "Print-head robotic arm", stage: "Print bed & case", module: "UV curing unit", dispenser: "Blank case magazine", screen: "Touchscreen & payment", header: "Illuminated header", shell: "Cabinet & glass" },
    venues: ["Malls", "Electronics stores", "Airports", "Campuses", "Tourist spots"],
  },
};
export const ORDER = ["frosti", "beanbox", "znapcase"];
export function currentProduct() {
  const k = new URLSearchParams(location.search).get("p");
  return PRODUCTS[k] || PRODUCTS.beanbox;
}
