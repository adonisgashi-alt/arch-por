# Turns a render into a graphite pencil sketch (used as the "before" of a project's cover reveal).
#
#   pip install opencv-python-headless
#   python3 tools/sketch.py images/<render>.jpg images/<render>-sketch.jpg [blur 8] [smoothing 3] [darkness 1.9]
#
# blur: how wide the pencil shading spreads; smoothing: passes that drop fine texture (more = less detail);
# darkness: >1 makes the graphite heavier.
import cv2, numpy as np, sys
src, out = sys.argv[1], sys.argv[2]
sigma, smooth, gamma = (float(sys.argv[3]) if len(sys.argv) > 3 else 8), (int(sys.argv[4]) if len(sys.argv) > 4 else 3), (float(sys.argv[5]) if len(sys.argv) > 5 else 1.9)
img = cv2.imread(src); h, w = img.shape[:2]
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
for _ in range(smooth): g = cv2.bilateralFilter(g, 9, 30, 7)      # drop fine texture -> roughly half the detail
inv = 255 - g
blur = cv2.GaussianBlur(inv, (0, 0), sigma)
dodge = cv2.divide(g, 255 - blur, scale=256)                          # classic pencil "colour dodge"
sk = np.clip(dodge, 0, 255).astype(np.float32) / 255
sk = sk ** gamma                                                      # darker graphite
# soft graphite shading so dark surfaces read as shaded, not blank
tone = cv2.GaussianBlur(g, (0, 0), 2).astype(np.float32) / 255
sk = sk * (0.42 + 0.58 * np.sqrt(tone))
# crisp outlines from edges, drawn like a firmer pencil pass
edges = cv2.Canny(cv2.GaussianBlur(g, (0, 0), 1.2), 40, 110)
edges = cv2.GaussianBlur(edges.astype(np.float32) / 255, (0, 0), 0.7)
sk = sk * (1 - 0.55 * edges)
# paper grain + light diagonal hatching in the shaded areas
rng = np.random.default_rng(3)
grain = rng.normal(0, 0.035, (h, w)).astype(np.float32)
yy, xx = np.mgrid[0:h, 0:w]
hatch = (((xx + yy) % 7) < 1).astype(np.float32)
shade = np.clip((0.82 - sk) / 0.5, 0, 1)
sk = sk - hatch * shade * 0.12 + grain * (0.4 + shade)
sk = np.clip(sk, 0, 1)
# warm graphite tone on off-white paper
paper = np.array([0.965, 0.975, 0.98], np.float32)   # BGR
ink = np.array([0.22, 0.24, 0.27], np.float32)
col = paper * sk[..., None] + ink * (1 - sk[..., None])
cv2.imwrite(out, (col * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 86])
