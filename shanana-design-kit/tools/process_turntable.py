"""Turns the supplied turntable GIF (shanana-design-kit/source-turntable.gif) into web frames.
 - 9 GIF frames ≈ 45° apart; the last is a near-duplicate of the first (loop), so 8 are kept
 - white point normalised so the studio background becomes pure white (page blends it with multiply)
 - one common 4:5 crop for every frame so the bag doesn't jump while rotating
 - 2× Lanczos upscale + light sharpening  (SOURCE IS ONLY 414 px: replace with higher-res originals)
Run from repo root:  python3 shanana-design-kit/tools/process_turntable.py
"""
import os
from PIL import Image, ImageChops, ImageFilter

SRC = "shanana-design-kit/source-turntable.gif"
OUT = "shanana-coffee/assets/img/products/360"
os.makedirs(OUT, exist_ok=True)
gif = Image.open(SRC)
frames = []
for i in range(gif.n_frames - 1):          # drop duplicate loop frame
    gif.seek(i)
    frames.append(gif.convert("RGB").point(lambda v: min(255, round(v * 255 / 247))))

# union bounding box of non-white pixels
box = None
for f in frames:
    mask = f.convert("L").point(lambda v: 255 if v < 236 else 0)
    b = mask.getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
w, h = box[2] - box[0], box[3] - box[1]
pad = 14
w += pad * 2; h += pad * 2
if w / h > 4 / 5: h = round(w * 5 / 4)
else: w = round(h * 4 / 5)
cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
# pad every frame with white so the crop may extend past the source edge (no dark seams)
M = 40
frames = [ImageChops.invert(ImageChops.invert(f)) for f in frames]
padded = []
for f in frames:
    c = Image.new("RGB", (f.width + 2 * M, f.height + 2 * M), (255, 255, 255)); c.paste(f, (M, M)); padded.append(c)
frames = padded
x0 = round(cx - w / 2) + M
y0 = round(cy - h / 2) + M
crop = (x0, y0, x0 + w, y0 + h)
print("crop", crop, "→", w, "x", h)

for i, f in enumerate(frames):
    c = f.crop(crop).resize((w * 2, h * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    c.save(os.path.join(OUT, f"bag-{i + 1:02d}.webp"), "WEBP", quality=88, method=6)
    print("bag-%02d.webp" % (i + 1), c.size)
frames[0].crop(crop).resize((w * 2, h * 2), Image.LANCZOS).save("shanana-coffee/assets/img/products/bag-front.webp", "WEBP", quality=90, method=6)
