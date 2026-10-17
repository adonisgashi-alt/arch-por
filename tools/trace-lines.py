# Traces the straight edges of a render into an SVG of lines that "draw themselves" in the hero.
#
#   pip install opencv-python-headless
#   python3 tools/trace-lines.py images/hyatt-13.jpg images/hyatt-13-lines.svg
#
# Each <line> carries its own start delay (--d) and duration (--t): the longest lines (outline,
# ground, tower edges) go first, then the details sweep in from left to right.
import json, random, sys
import cv2, numpy as np

src, out = sys.argv[1], sys.argv[2]
MIN_LEN, OVERSHOOT = 18, 6  # px in the source image; lines run slightly past corners, like a hand drawing

img = cv2.imread(src); h, w = img.shape[:2]
g = cv2.bilateralFilter(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 9, 40, 9)  # flatten texture, keep hard edges
segs = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD).detect(g)[0].reshape(-1, 4)
L = np.hypot(segs[:, 2] - segs[:, 0], segs[:, 3] - segs[:, 1])
segs, L = segs[L >= MIN_LEN], L[L >= MIN_LEN]

# Drop near-duplicates (a thin line is detected once per side)
keep = []
for i in np.argsort(-L):
    a = segs[i]; mid = (a[:2] + a[2:]) / 2; ang = np.arctan2(a[3] - a[1], a[2] - a[0]) % np.pi
    def same(j):
        b = segs[j]; ab = np.arctan2(b[3] - b[1], b[2] - b[0]) % np.pi
        da = min(abs(ang - ab), np.pi - abs(ang - ab))
        off = abs((b[2] - b[0]) * (mid[1] - b[1]) - (b[3] - b[1]) * (mid[0] - b[0])) / max(L[j], 1)
        return da < 0.05 and np.hypot(*(mid - (b[:2] + b[2:]) / 2)) < 0.5 * max(L[i], L[j]) and off < 6
    if not any(same(j) for j in keep): keep.append(i)

random.seed(7)
lines = []
for rank, i in enumerate(keep):  # keep is longest-first
    x1, y1, x2, y2 = segs[i]; n = L[i]
    dx, dy = (x2 - x1) / n * OVERSHOOT, (y2 - y1) / n * OVERSHOOT
    x1, y1, x2, y2 = x1 - dx, y1 - dy, x2 + dx, y2 + dy
    if rank < 50: d = rank / 50 * 0.7
    else: d = 0.5 + ((x1 + x2) / 2 / w) * 1.6 + random.random() * 0.15
    t = 0.5 + 0.6 * min(n / 600, 1)
    lines.append((d, f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" pathLength="1" style="--d:{d:.2f}s;--t:{t:.2f}s"/>'))
lines.sort()
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
       + "".join(l for _, l in lines) + "</svg>\n")
open(out, "w").write(svg)
print(f"{len(lines)} lines, drawing takes ~{max(d for d, _ in lines) + 1.1:.1f}s -> {out}")
