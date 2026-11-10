/* Line + glow icon set (SVG sprite) shared by all Ravens Tech sites.
 * Usage: <svg><use href="#i-cup"/></svg>
 */
(() => {
  const s = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    logo: `<path d="M5 20 11 4h6.5a4.5 4.5 0 0 1 0 9H12l6 7" ${s} stroke-width="2.4"/><path d="M3 13h8" ${s} stroke-width="2.4"/>`,
    arrow: `<path d="M5 12h14M13 6l6 6-6 6" ${s} stroke-width="2"/>`,
    "arrow-ur": `<path d="M7 17 17 7M9 7h8v8" ${s} stroke-width="2"/>`,
    play: `<path d="M8 5v14l11-7z" fill="currentColor"/>`,
    cup: `<path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9z" ${s}/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 2c0 1.5 1 1.5 1 3M12 2c0 1.5 1 1.5 1 3" ${s}/>`,
    cone: `<path d="M7 11h10l-5 11z" ${s}/><path d="M6.5 11a5.5 5.5 0 1 1 11 0" ${s}/><path d="M9 14l4 2M10 17l3 1" ${s}/>`,
    phone: `<rect x="6" y="2" width="12" height="20" rx="3" ${s}/><path d="M11 18h2" ${s}/>`,
    robot: `<path d="M4 21h8M8 21v-4l3-7 6-3" ${s}/><circle cx="11" cy="10" r="1.6" ${s}/><circle cx="17" cy="7" r="1.6" ${s}/><path d="M18.5 8.5 21 11M19 5l2-2" ${s}/>`,
    card: `<rect x="2" y="5" width="20" height="14" rx="3" ${s}/><path d="M2 10h20M6 15h4" ${s}/>`,
    tap: `<path d="M9 11V5a2 2 0 0 1 4 0v5l4.5 1a2 2 0 0 1 1.5 2.3L18 19a3 3 0 0 1-3 2h-3.5a3 3 0 0 1-2.4-1.2L6 16" ${s}/><path d="M5 5a6 6 0 0 1 2-2.5M17 5a6 6 0 0 0-2-2.5" ${s}/>`,
    sparkle: `<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" ${s}/>`,
    clock: `<circle cx="12" cy="12" r="9" ${s}/><path d="M12 7v5l3 2" ${s}/>`,
    leaf: `<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" ${s}/><path d="M5 19 13 11" ${s}/>`,
    shield: `<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" ${s}/><path d="m9 12 2 2 4-4" ${s}/>`,
    cloud: `<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8a4.5 4.5 0 0 1-.5 10z" ${s}/>`,
    chart: `<path d="M5 20v-5M10 20v-9M15 20v-7M20 20V5" ${s} stroke-width="2"/>`,
    bolt: `<path d="M13 2 4 14h7l-1 8 9-12h-7z" ${s}/>`,
    chip: `<rect x="6" y="6" width="12" height="12" rx="2" ${s}/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" ${s}/><path d="M10 10h4v4h-4z" ${s}/>`,
    layers: `<path d="m12 3 9 5-9 5-9-5z" ${s}/><path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" ${s}/>`,
    palette: `<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-.9-.7-1.3-.7-2.2 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z" ${s}/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7" r="1.2" fill="currentColor"/>`,
    upload: `<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" ${s}/>`,
    printer: `<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" ${s}/><rect x="7" y="14" width="10" height="7" rx="1" ${s}/>`,
    snow: `<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" ${s}/>`,
    heart: `<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" ${s}/>`,
    search: `<circle cx="11" cy="11" r="7" ${s}/><path d="m20 20-4-4" ${s}/>`,
    pin: `<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" ${s}/><circle cx="12" cy="9" r="2.5" ${s}/>`,
    mall: `<path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6" ${s}/>`,
    hotel: `<path d="M3 20V6M3 16h18v4M21 16v-4a3 3 0 0 0-3-3h-7v7M7 12a1.5 1.5 0 1 0 0-.1" ${s}/>`,
    campus: `<path d="M2 9l10-5 10 5-10 5z" ${s}/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" ${s}/>`,
    plane: `<path d="M10.5 3.5c.8-.8 2.2-.8 3 0s.8 2.2 0 3L11 9l2 9-2 2-3.5-6.5L4 17l1 3-1.5 1.5L1.5 17 0 14.5 1.5 13 4 14l3.5-3.5L1 7l2-2 9 2z" ${s} transform="translate(2 1)"/>`,
    events: `<circle cx="8" cy="8" r="3" ${s}/><circle cx="17" cy="9" r="2.5" ${s}/><path d="M2 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 8 0" ${s}/>`,
    office: `<rect x="4" y="3" width="16" height="18" rx="1" ${s}/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" ${s}/>`,
    gym: `<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" ${s} stroke-width="2"/>`,
    linkedin: `<path d="M6 9v9M6 6v.01M10 18v-5a3 3 0 0 1 6 0v5M10 9v9" ${s} stroke-width="2"/>`,
    youtube: `<rect x="2" y="5" width="20" height="14" rx="4" ${s}/><path d="m10 9 5 3-5 3z" fill="currentColor"/>`,
    instagram: `<rect x="3" y="3" width="18" height="18" rx="5" ${s}/><circle cx="12" cy="12" r="4" ${s}/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>`,
    facebook: `<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" ${s}/>`,
    apple: `<path d="M16 3c-1.3.2-2.7 1-3.3 2.3-.5 1-.4 2 .2 2 1.3-.1 2.6-1 3.1-2.2.4-.9.2-1.9 0-2.1zM12 8c-1 0-2-1-3.5-1C6 7 4 9 4 12.5S6.5 21 8.5 21c1.2 0 1.8-.8 3.5-.8s2.1.8 3.5.8c1.7 0 3.1-2.5 3.8-4.4-2-.8-2.8-2.9-2.3-4.8.3-1 1-1.9 2-2.4C18 8 16.6 7 15.2 7 13.8 7 13 8 12 8z" ${s}/>`,
    gplay: `<path d="M5 3.5v17c0 .6.7 1 1.2.7l14-8.3c.5-.3.5-1.1 0-1.4l-14-8.6C5.7 2.6 5 3 5 3.5zM5 4l10 8L5 20M15 12l-3 3" ${s}/>`,
    star: `<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" ${s}/>`,
  };
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${Object.entries(icons)
    .map(([id, p]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${p}</symbol>`)
    .join("")}</svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);
})();
