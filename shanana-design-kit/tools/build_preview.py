"""Builds a single-file, self-contained interactive homepage preview from the real site code.
  shanana-design-kit/homepage-preview.html             fragment (for the Artifact publisher)
  shanana-design-kit/homepage-preview-standalone.html  full HTML document (open locally / host anywhere)
Images are embedded as data: URIs; links to other pages show a notice instead of navigating."""
import base64, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
S = R / "shanana-coffee"
rd = lambda p: (S / p).read_text()
uri = lambda p: "data:image/webp;base64," + base64.b64encode((S / p).read_bytes()).decode()

frames = [uri(f"assets/img/products/360/bag-{i:02d}.webp") for i in range(1, 9)]

css = rd("assets/css/main.css")
css += """
/* ---- preview overrides ---- */
.site-header { top: env(safe-area-inset-top, 0px); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 120; background: #fff; }
.container { padding-left: max(var(--gutter), env(safe-area-inset-left, 0px)); padding-right: max(var(--gutter), env(safe-area-inset-right, 0px)); }
.preview-toast { position: fixed; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 20px); z-index: 300; max-width: min(92vw, 440px);
  background: var(--ink); color: #fff; padding: 14px 20px; font-size: .86rem; line-height: 1.5; border-left: 2px solid var(--gold); opacity: 0; pointer-events: none; transition: opacity .3s, transform .3s; }
.preview-toast.is-on { opacity: 1; transform: translate(-50%, 0); }
"""

cfg = rd("assets/js/config.js")
cfg = re.sub(r"frontImage: \"[^\"]+\"", f'frontImage: "{frames[0]}"', cfg)
cfg = re.sub(r"frames: Array\.from\([^\n]+\)\n", "frames: " + "[" + ",".join(f'"{f}"' for f in frames) + "]\n", cfg)
assert "Array.from" not in cfg.split("media:")[1].split("impactMetrics")[0]

body = re.search(r"<body[^>]*>(.*)</body>", rd("index.html"), re.S).group(1)
body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
body = re.sub(r"<script[^>]*></script>", "", body)
body = body.replace("assets/img/products/360/bag-01.webp", frames[0])
body = body.replace(' fetchpriority="high"', "")
for name in ("hills-clouds", "drying-beds"):
    body = body.replace(f"assets/img/nyaruguru/{name}.webp", uri(f"assets/img/nyaruguru/{name}.webp"))
assert "assets/img" not in body, "unresolved asset path"

notice = """
document.body.classList.add("page-home");
(function () {
  var toast = document.createElement("div"); toast.className = "preview-toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast);
  var t;
  function show(msg) { toast.textContent = msg; toast.classList.add("is-on"); clearTimeout(t); t = setTimeout(function () { toast.classList.remove("is-on"); }, 3200); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href");
    if (h.charAt(0) === "#") return;
    e.preventDefault();
    var page = (h.split("?")[0].split("#")[0] || "").replace(".html", "");
    show("Preview shows the homepage only. “" + (page || "that link") + "” opens in the full site.");
  });
})();
"""
js = "\n".join(rd(f"assets/js/{n}") for n in ["catalog.js", "viewer.js", "main.js"])

fragment = f"""<title>Shanana Coffee</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600&display=swap">
<style>
{css}
</style>
{body}
<script>
{cfg}
</script>
<script>
{js}
</script>
<script>
{notice}
</script>
"""
(R / "shanana-design-kit/homepage-preview.html").write_text(fragment)
standalone = ("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">"
  "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">"
  "<style>[hidden]{display:none!important}</style></head><body>\n" + fragment + "\n</body></html>\n")
(R / "shanana-design-kit/homepage-preview-standalone.html").write_text(standalone)
print("fragment KB:", len(fragment) // 1024, " standalone KB:", len(standalone) // 1024)
