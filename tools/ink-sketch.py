# Pen-and-ink sketch of a render, as SVG (the "before" of a project's cover reveal).
#
#   pip install opencv-python-headless
#   python3 tools/ink-sketch.py images/<render>.jpg images/<render>-ink.svg [skip.json]
#
# The render's cast-shadow boundaries look like edges to the line finder but aren't real lines, so a
# skip file lists them by hand (coordinates in render pixels); shade is shown by hatching instead:
#   {"lines": [[[x, y], [x, y], ...], ...],   polylines: drop strokes lying along them (within 10 px)
#    "boxes": [[x0, y0, x1, y1, maxLen], ...]} areas: drop strokes inside shorter than maxLen
#
import cv2, numpy as np, sys, math, random

src, out = sys.argv[1], sys.argv[2]
import json
skip = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
img = cv2.imread(src); h, w = img.shape[:2]
random.seed(11); rng = np.random.default_rng(11)
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
paths = []

def f(v): return f"{v:.1f}"

# ── Vegetation mask (green / olive, saturated) ──
gf = g.astype(np.float32)
texture = np.sqrt(np.maximum(cv2.blur(gf * gf, (9, 9)) - cv2.blur(gf, (9, 9)) ** 2, 0))  # leaves are busy, glass is flat
veg = ((hsv[..., 0] > 25) & (hsv[..., 0] < 95) & (hsv[..., 1] > 60) & (hsv[..., 2] > 35) & (texture > 14)).astype(np.uint8)
veg = cv2.morphologyEx(veg, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
veg = cv2.morphologyEx(veg, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
vegd = cv2.dilate(veg, np.ones((9, 9), np.uint8))

# ── 1. Building lines: straight segments, drawn like a fine-liner ──
gs = cv2.bilateralFilter(g, 5, 25, 5)
def near_polyline(px, py, pts, tol=10):
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        vx, vy = bx - ax, by - ay
        t = max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
        if math.hypot(px - ax - t * vx, py - ay - t * vy) <= tol: return True
    return False

def skipped(seg, n):
    x1, y1, x2, y2 = seg
    for pts in skip.get("lines", []):
        if near_polyline(x1, y1, pts) and near_polyline(x2, y2, pts): return True
    for x0, y0, xa, ya, maxlen in skip.get("boxes", []):
        if n < maxlen and all(x0 <= x <= xa and y0 <= y <= ya for x, y in ((x1, y1), (x2, y2))): return True
    return False

lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
boost = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(16, 16)).apply(cv2.bilateralFilter(g, 7, 30, 7))
extra = lsd.detect(boost)[0].reshape(-1, 4)
extra = extra[np.hypot(extra[:, 2] - extra[:, 0], extra[:, 3] - extra[:, 1]) >= 35]   # only real edges, not stone grain
segs = np.vstack([lsd.detect(gs)[0].reshape(-1, 4), extra])                          # faint white-on-white edges too
L = np.hypot(segs[:, 2] - segs[:, 0], segs[:, 3] - segs[:, 1])
keep = []
for i in np.argsort(-L):
    if L[i] < 9: break
    a = segs[i]; mid = (a[:2] + a[2:]) / 2
    if vegd[int(min(h - 1, mid[1])), int(min(w - 1, mid[0]))]: continue  # planting is drawn separately
    if skipped(a, L[i]): continue                                              # a shadow edge, not a line
    ang = math.atan2(a[3] - a[1], a[2] - a[0]) % math.pi
    dup = False
    for j in keep[-400:]:
        b = segs[j]; ab = math.atan2(b[3] - b[1], b[2] - b[0]) % math.pi
        da = min(abs(ang - ab), math.pi - abs(ang - ab))
        if da < 0.06:
            off = abs((b[2] - b[0]) * (mid[1] - b[1]) - (b[3] - b[1]) * (mid[0] - b[0])) / max(L[j], 1)
            if off < 3 and np.hypot(*(mid - (b[:2] + b[2:]) / 2)) < 0.5 * (L[i] + L[j]): dup = True; break
    if not dup: keep.append(i)

# Join pieces of the same edge into one stroke (same direction, on the same line, small gap)
lines = [list(map(float, segs[i])) for i in keep]
def angle(l): return math.atan2(l[3] - l[1], l[2] - l[0]) % math.pi
def proj(l, x, y):
    n = math.hypot(l[2] - l[0], l[3] - l[1]) or 1
    ux, uy = (l[2] - l[0]) / n, (l[3] - l[1]) / n
    return (x - l[0]) * ux + (y - l[1]) * uy, abs(-(x - l[0]) * uy + (y - l[1]) * ux)
merged = True
while merged:
    merged = False
    lines.sort(key=lambda l: -math.hypot(l[2] - l[0], l[3] - l[1]))
    out_ = []
    used = [False] * len(lines)
    for i, a_ in enumerate(lines):
        if used[i]: continue
        for j in range(i + 1, len(lines)):
            if used[j]: continue
            b_ = lines[j]
            da = abs(angle(a_) - angle(b_)); da = min(da, math.pi - da)
            if da > 0.035: continue
            n = math.hypot(a_[2] - a_[0], a_[3] - a_[1])
            t1, d1 = proj(a_, b_[0], b_[1]); t2, d2 = proj(a_, b_[2], b_[3])
            if max(d1, d2) > 2.5: continue
            lo, hi = min(t1, t2), max(t1, t2)
            if lo > n + 22 or hi < -22: continue          # too far apart along the line
            t0, t3 = min(0, lo), max(n, hi)
            ux, uy = (a_[2] - a_[0]) / n, (a_[3] - a_[1]) / n
            a_ = [a_[0] + ux * t0, a_[1] + uy * t0, a_[0] + ux * t3, a_[1] + uy * t3]
            used[j] = True; merged = True
        out_.append(a_)
    lines = out_

# Close corners: extend an end to where it meets a neighbouring edge, if that is close
def intersect(a_, b_):
    x1, y1, x2, y2 = a_; x3, y3, x4, y4 = b_
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-6: return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return x1 + t * (x2 - x1), y1 + t * (y2 - y1)
SNAP = 14
for a_ in lines:
    for end in (0, 2):
        ex, ey = a_[end], a_[end + 1]
        best = None
        for b_ in lines:
            if b_ is a_: continue
            da = abs(angle(a_) - angle(b_)); da = min(da, math.pi - da)
            if da < 0.35: continue                        # only real corners
            p = intersect(a_, b_)
            if not p or math.hypot(p[0] - ex, p[1] - ey) > SNAP: continue
            tb, db = proj(b_, *p); nb = math.hypot(b_[2] - b_[0], b_[3] - b_[1])
            if tb < -SNAP or tb > nb + SNAP: continue     # the corner must be at the other edge too
            dist = math.hypot(p[0] - ex, p[1] - ey)
            if best is None or dist < best[0]: best = (dist, p)
        if best: a_[end], a_[end + 1] = best[1]

segs = np.array(lines, np.float32)
L = np.hypot(segs[:, 2] - segs[:, 0], segs[:, 3] - segs[:, 1])
keep = list(range(len(segs)))
for i in keep:
    x1, y1, x2, y2 = segs[i]; n = L[i]
    if n < 1: continue
    ux, uy = (x2 - x1) / n, (y2 - y1) / n
    o1, o2 = random.uniform(0.5, 2.5), random.uniform(0.5, 2.5)  # just meets the corners
    x1, y1, x2, y2 = x1 - ux * o1, y1 - uy * o1, x2 + ux * o2, y2 + uy * o2
    bow = 0
    mx, my = (x1 + x2) / 2 - uy * bow, (y1 + y2) / 2 + ux * bow
    jx, jy = 0, 0
    wgt = 2.2 if n > 160 else 1.6 if n > 60 else 1.1
    paths.append(f'<path d="M{f(x1+jx)} {f(y1+jy)}Q{f(mx)} {f(my)} {f(x2)} {f(y2)}" stroke-width="{wgt}"/>')

# ── 2. Shadow hatching: parallel diagonal strokes clipped to the dark areas ──
dark = (cv2.GaussianBlur(g, (0, 0), 2) < 85).astype(np.uint8) & (1 - vegd)
dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
spacing, ang = 7, math.radians(55)
dx, dy = math.cos(ang), math.sin(ang)
diag = int(math.hypot(w, h))
for k in range(-diag, diag, spacing):
    # line through (k * -dy, k * dx) offset along the normal, sampled along its direction
    ox, oy = w / 2 - dy * k, h / 2 + dx * k
    run = None
    for t in range(-diag, diag, 3):
        x, y = ox + dx * t, oy + dy * t
        inside = 0 <= x < w and 0 <= y < h and dark[int(y), int(x)]
        if inside and run is None: run = (x, y)
        if not inside and run is not None:
            if math.hypot(x - run[0], y - run[1]) > 14:
                ex, ey = x - dx * 3, y - dy * 3
                paths.append(f'<path d="M{f(run[0])} {f(run[1])}L{f(ex)} {f(ey)}" stroke-width="0.8"/>')
            run = None

# ── 3. Planting: scribbly "cloud" outlines plus a few inner scribbles ──
cnts, _ = cv2.findContours(veg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
for c in cnts:
    if cv2.contourArea(c) < 250: continue
    pts = c[:, 0, :].astype(float)
    step = 4
    d = []
    for j in range(0, len(pts), step):
        x, y = pts[j]
        r = random.uniform(0.5, 2.5)
        d.append((x + random.uniform(-r, r), y + random.uniform(-r, r)))
    if len(d) < 3: continue
    s = f"M{f(d[0][0])} {f(d[0][1])}"
    for j in range(1, len(d)):
        px, py = d[j - 1]; x, y = d[j]
        cx, cy = (px + x) / 2 + random.uniform(-2.5, 2.5), (py + y) / 2 + random.uniform(-2.5, 2.5)
        s += f"Q{f(cx)} {f(cy)} {f(x)} {f(y)}"
    paths.append(f'<path d="{s}" stroke-width="1.3"/>')
    x0, y0, bw, bh = cv2.boundingRect(c)
    for _ in range(int(cv2.contourArea(c) / 900)):                # leaf scribbles inside
        x, y = random.uniform(x0, x0 + bw), random.uniform(y0, y0 + bh)
        if not veg[int(min(y, h - 1)), int(min(x, w - 1))]: continue
        s = f"M{f(x)} {f(y)}"
        for _ in range(4):
            x += random.uniform(-9, 9); y += random.uniform(-6, 6)
            s += f"L{f(x)} {f(y)}"
        paths.append(f'<path d="{s}" stroke-width="1.1"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet">'
       f'<rect width="{w}" height="{h}" fill="#fff"/>'
       f'<g fill="none" stroke="#141414" stroke-linecap="round" stroke-linejoin="round">' + "".join(paths) + "</g></svg>\n")
open(out, "w").write(svg)
print(len(paths), "strokes,", len(svg) // 1024, "KB")
