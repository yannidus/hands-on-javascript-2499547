"""Writes the Shanana icon set as individual SVG files.
All icons are outline style, stroke = currentColor, round caps/joins, no fills,
so they recolor in Figma or CSS. Grids: UI 24px, process/impact 48px, heritage 64px."""
import os
OUT = os.path.join(os.path.dirname(__file__), "..", "icons")

def svg(size, body, sw):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}" '
            f'fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">\n'
            f'  {body}\n</svg>\n')

UI = {  # 24px grid, 1.5 stroke
 "arrow-right": '<path d="M3 12h17M14 6l6 6-6 6"/>',
 "arrow-left": '<path d="M21 12H4M10 6l-6 6 6 6"/>',
 "chevron-left": '<path d="M15 4l-8 8 8 8"/>',
 "chevron-right": '<path d="M9 4l8 8-8 8"/>',
 "chevron-down": '<path d="M5 9l7 7 7-7"/>',
 "menu": '<path d="M4 9h16M4 15h16"/>',
 "close": '<path d="M6 6l12 12M18 6L6 18"/>',
 "play": '<path d="M7 4.5l12 7.5-12 7.5z"/>',
 "pause": '<path d="M8 5v14M16 5v14"/>',
 "rotate-360": '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
 "drag-horizontal": '<path d="M2 12h20M6 8l-4 4 4 4M18 8l4 4-4 4"/>',
 "info": '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.01"/>',
 "check-circle": '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>',
 "alert-circle": '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16.5v.01"/>',
 "mail": '<rect x="3" y="5.5" width="18" height="13" rx="1"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
 "phone": '<path d="M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 6.8 6.8L16 14l4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.1A1.5 1.5 0 0 1 5 3.5z"/>',
 "map-pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 "globe": '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.8 2.8 4 6 4 9.5s-1.2 6.7-4 9.5c-2.8-2.8-4-6-4-9.5s1.2-6.7 4-9.5z"/>',
 "external-link": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>',
 "minus": '<path d="M5 12h14"/>',
 "lock": '<rect x="5" y="10.5" width="14" height="10" rx="1"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
 "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5"/>',
 "box": '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
}
PROCESS = {  # 48px grid, 1.5 stroke
 "harvest": '<circle cx="18" cy="30" r="7"/><circle cx="31" cy="33" r="6"/><path d="M18 23c0-8 5-13 13-15M31 27c0-6-1-11 0-16"/><path d="M31 11c4-2 8-1 10 2-3 2-7 2-10-2z"/>',
 "depulp": '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="5"/><path d="M24 10v9M24 29v9M10 24h9M29 24h9"/>',
 "ferment": '<path d="M12 14h24l-2.5 24h-19z"/><path d="M16 24c2.5 2.5 5-2.5 8 0s5.5-2.5 8 0"/><circle cx="21" cy="31" r="1.2"/><circle cx="27" cy="33" r="1.2"/><path d="M10 14h28"/>',
 "wash": '<path d="M24 7c7 10 12 16 12 22a12 12 0 0 1-24 0c0-6 5-12 12-22z"/><path d="M18 30a6 6 0 0 0 6 6"/>',
 "dry": '<circle cx="24" cy="18" r="6"/><path d="M24 5v3M24 28v3M11 18h3M34 18h3M14.8 8.8l2.1 2.1M31.1 25.1l2.1 2.1M14.8 27.2l2.1-2.1M31.1 10.9l2.1-2.1"/><path d="M7 39h34M11 35h26"/>',
 "package": '<path d="M15 9h18l1.5 4H13.5z"/><path d="M13.5 13h21l-1.5 27h-18z"/><circle cx="24" cy="25" r="4.5"/><path d="M19.5 34h9"/>',
 "export": '<path d="M6 30h36l-5 9H11z"/><path d="M12 30V20h14v10M26 24h8l3 6M17 20v-6h5v6"/><path d="M4 43c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2"/>',
 "warehouse": '<path d="M6 40V18l18-10 18 10v22"/><path d="M13 40V25h22v15M13 30h22M13 35h22"/>',
 "storefront": '<path d="M8 20v20h32V20"/><path d="M6 12h36l-2 8H8z"/><path d="M14 20a4 4 0 0 1-8 0M22 20a4 4 0 0 1-8 0M30 20a4 4 0 0 1-8 0M38 20a4 4 0 0 1-8 0"/><path d="M20 40V30h8v10"/>',
 "cup": '<path d="M9 18h26v10a11 11 0 0 1-11 11h-4A11 11 0 0 1 9 28z"/><path d="M35 21h3a4 4 0 0 1 0 8h-3.5M6 42h32"/><path d="M17 6c-2 3 2 5 0 8M23 6c-2 3 2 5 0 8M29 6c-2 3 2 5 0 8"/>',
 "altitude": '<path d="M4 40l13-20 7 9 6-10 14 21z"/><path d="M4 14h40" stroke-dasharray="2 4"/><path d="M4 9h40" stroke-dasharray="2 4"/>',
 "climate": '<path d="M24 6v24"/><circle cx="24" cy="35" r="6"/><path d="M24 6a3 3 0 0 1 3 3v20.5a6 6 0 0 1-6 0V9a3 3 0 0 1 3-3z"/><path d="M33 12h6M33 18h4M33 24h6"/>',
 "soil": '<path d="M4 20h40"/><path d="M8 28h4M18 26h3M28 29h5M37 27h3M12 35h4M24 36h3M34 37h4M6 42h36"/><path d="M24 20v-9M24 14c-4-1-7-4-7-8 4 0 7 3 7 8zM24 12c3-1 6-3 6-7-4 0-6 3-6 7z"/>',
}
IMPACT = {  # 48px grid
 "women-community": '<circle cx="16" cy="15" r="5"/><circle cx="32" cy="15" r="5"/><path d="M6 40c0-9 4-15 10-15s10 6 10 15M22 40c0-9 4-15 10-15s10 6 10 15"/><path d="M12 33h8M28 33h8"/>',
 "education": '<path d="M24 14C19 10 12 9 6 10v26c6-1 13 0 18 4 5-4 12-5 18-4V10c-6-1-13 0-18 4z"/><path d="M24 14v26"/>',
 "family-income": '<path d="M8 40V24l16-13 16 13v16z"/><path d="M24 26v10M27 28h-4.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H20"/>',
 "employment": '<rect x="7" y="16" width="34" height="24" rx="2"/><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M7 26h34M21 26v4h6v-4"/>',
 "value-chain": '<circle cx="9" cy="24" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="39" cy="24" r="4"/><path d="M13 24h7M28 24h7"/><path d="M33 20l2 4-2 4M18 20l2 4-2 4"/>',
 "trade-connection": '<circle cx="12" cy="30" r="5"/><circle cx="36" cy="18" r="5"/><path d="M15 26c4-10 11-13 17-9" stroke-dasharray="2 3"/><path d="M29 15l3 2-2 3"/>',
}
HERITAGE = {  # 64px grid, 1.5 stroke
 "sun": '<circle cx="32" cy="32" r="12"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/>',
 "people": '<circle cx="22" cy="18" r="6"/><circle cx="42" cy="18" r="6"/><path d="M10 52c0-12 5-20 12-20s12 8 12 20M30 52c0-12 5-20 12-20s12 8 12 20"/>',
 "bean": '<g transform="rotate(-28 32 32)"><ellipse cx="32" cy="32" rx="13" ry="20"/><path d="M32 12c7 11-7 29 0 40"/></g>',
 "bag": '<path d="M18 8h28v48H18z"/><path d="M18 13h28"/><circle cx="32" cy="28" r="7"/><path d="M24 42h16M27 47h10"/>',
 "mountains": '<path d="M4 52l18-26 10 13 8-11 20 24z"/><circle cx="46" cy="14" r="5"/>',
 "geometric-band": '<path d="M4 38l7-12 7 12 7-12 7 12 7-12 7 12 7-12 7 12"/><path d="M4 44h56M4 20h56"/>',
}
BRAND = {
 "emblem-sun-bean": None, "favicon": None,
}

def write(group, icons, size, sw):
    d = os.path.join(OUT, group); os.makedirs(d, exist_ok=True)
    for name, body in icons.items():
        open(os.path.join(d, f"{name}.svg"), "w").write(svg(size, body, sw))

write("ui", UI, 24, 1.5)
write("process", PROCESS, 48, 1.5)
write("impact", IMPACT, 48, 1.5)
write("heritage", HERITAGE, 64, 1.5)

# Brand marks (filled/colored, not currentColor)
d = os.path.join(OUT, "brand")
open(os.path.join(d, "emblem-sun-bean.svg"), "w").write('''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="-200 -200 400 400">
  <!-- Placeholder emblem from the illustrative render — NOT the official Shanana logo. -->
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2c993"/><stop offset=".45" stop-color="#b8935a"/><stop offset="1" stop-color="#8a6b3c"/></linearGradient></defs>
  <g fill="none" stroke="url(#g)">
    <circle r="132" stroke-width="2"/>
    <circle r="120" stroke-width="1" stroke-dasharray="2 6"/>
''' + "\n".join(f'    <path d="M0 -150V-176" stroke="#c4a068" stroke-width="3" stroke-linecap="round" transform="rotate({a})"/>' for a in range(0, 360, 15)) + '''
    <path d="M-96 40 L-72 8 L-48 40 L-24 8 L0 40 L24 8 L48 40 L72 8 L96 40" stroke-width="1.6"/>
    <path d="M-84 58 H84" stroke-width="1"/>
    <g transform="translate(0 -34) rotate(-28)"><ellipse rx="34" ry="50" stroke-width="3"/><path d="M0 -50 C 16 -22, -16 18, 0 50" stroke-width="3"/></g>
  </g>
</svg>
''')
import shutil
shutil.copy(os.path.join(os.path.dirname(__file__), "..", "..", "shanana-coffee", "assets", "img", "favicon.svg"), os.path.join(d, "favicon.svg"))
open(os.path.join(d, "wordmark.svg"), "w").write('''<svg xmlns="http://www.w3.org/2000/svg" width="520" height="140" viewBox="0 0 520 140">
  <!-- Typeset website wordmark (Cormorant Garamond + Manrope). Replace with the official logo when supplied. -->
  <text x="260" y="76" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="72" font-weight="500" letter-spacing="22" fill="#111110">SHANANA</text>
  <text x="260" y="116" text-anchor="middle" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="26" fill="#8a6b3c">COFFEE</text>
</svg>
''')
print("icons written")

# ---- Overview sheet: every outline icon on one artboard (drag into Figma → editable vectors)
groups = [("UI · 24 px", UI, 24), ("Process & origin · 48 px", PROCESS, 48), ("Impact · 48 px", IMPACT, 48), ("Heritage · 64 px", HERITAGE, 64)]
cols, cell, pad = 8, 140, 60
parts, y = [], pad
parts.append(f'<text x="{pad}" y="{y+10}" font-family="Cormorant Garamond, Georgia, serif" font-size="40" fill="#111110">Shanana Coffee — Icon set</text>')
y += 70
for title, icons, size in groups:
    parts.append(f'<text x="{pad}" y="{y}" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="3" fill="#8a6b3c">{title.upper().replace("&", "&amp;")}</text>')
    y += 24
    for i, (name, body) in enumerate(icons.items()):
        cx, cy = pad + (i % cols) * cell, y + (i // cols) * cell
        s = 48 / size  # display every icon at 48 px
        sw = round(1.5 / s, 3)
        parts.append(f'<rect x="{cx}" y="{cy}" width="{cell-16}" height="{cell-16}" fill="#faf7f2"/>')
        parts.append(f'<g transform="translate({cx + (cell-16-48)/2} {cy+22}) scale({s})" fill="none" stroke="#111110" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{body}</g>')
        parts.append(f'<text x="{cx + (cell-16)/2}" y="{cy+104}" text-anchor="middle" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="11" fill="#6d6860">{name}</text>')
    y += ((len(icons) - 1) // cols + 1) * cell + 40
W = pad * 2 + cols * cell - 16
open(os.path.join(OUT, "..", "icons-overview-sheet.svg"), "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{y}" viewBox="0 0 {W} {y}">\n<rect width="{W}" height="{y}" fill="#ffffff"/>\n' + "\n".join(parts) + "\n</svg>\n")
print("sheet written")
