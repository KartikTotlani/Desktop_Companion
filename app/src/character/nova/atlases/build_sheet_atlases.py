#!/usr/bin/env python3
"""
Build PROTOTYPE sprite atlases from the NOVA character sheet (the sheet with Idle/React/Hop rows).

This is a stop-gap: it cuts the poses out of the sheet, applies ONE uniform scale, anchors the feet
and packs 330x360 cells in a 4-column grid. The source poses were not drawn as a consistent
animation set, so expect some frame-to-frame variation. Replace with true production frames later.

Usage:  python build_sheet_atlases.py <sheet.png> <out_dir>
Needs:  Pillow, numpy.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

CELL_W, CELL_H, COLUMNS = 330, 360, 4
ANCHOR_X, ANCHOR_Y = 165, 336
STAND_H = 225          # 150 logical px at 1.5x
ALPHA_MIN = 20

# (x0, y0, x1, y1) search band per clip, boxes to erase (row labels), expected frame count.
BANDS = {
    "idle":  dict(box=(420, 0, 1536, 276),   erase=[(428, 4, 696, 44)],    count=7, gap=3),
    "react": dict(box=(420, 277, 1536, 538), erase=[(428, 277, 636, 312)], count=6, gap=8, cuts=[623, 778, 945, 1094, 1268]),
    "hop":   dict(box=(415, 539, 1536, 776), erase=[(428, 538, 626, 575)], count=6, gap=8, cuts=[594, 763, 932, 1109, 1290]),
}
# Upward offset in shipped px for each hop frame (the sheet poses carry no height information).
HOP_LIFT = [0, 45, 66, 54, 0, 0]
# Per-frame durations in ms.
DURATIONS = {
    "idle":  [600, 600, 700, 140, 600, 600, 700],
    "react": [110, 130, 130, 130, 130, 160],
    "hop":   [110, 90, 110, 110, 100, 120],
}

def runs_of_true(v, min_gap=8):
    """Index ranges of True values; gaps shorter than min_gap are bridged."""
    idx = np.flatnonzero(v)
    if idx.size == 0:
        return []
    out, start, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > min_gap:
            out.append((start, prev + 1)); start = i
        prev = i
    out.append((start, prev + 1))
    return out

def label_components(mask):
    """8-connected components of a boolean mask -> list of (pixel list)."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    comps = []
    for y0 in range(h):
        for x0 in range(w):
            if mask[y0, x0] and not seen[y0, x0]:
                stack = [(y0, x0)]; seen[y0, x0] = True; px = []
                while stack:
                    y, x = stack.pop(); px.append((y, x))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                                seen[ny, nx] = True; stack.append((ny, nx))
                comps.append(px)
    return comps

def clean_fragments(sub):
    """Drop pieces of neighbouring poses and hairlines; keep the main figure and small effects."""
    mask = sub[..., 3] > ALPHA_MIN
    comps = label_components(mask)
    if not comps:
        return sub
    main = max(comps, key=len)
    h, w = mask.shape
    keep = np.zeros_like(mask)
    for px in comps:
        ys = [p[0] for p in px]; xs = [p[1] for p in px]
        bw, bh = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
        if px is not main and (len(px) < 12 or min(bw, bh) <= 3 or min(xs) == 0 or max(xs) == w - 1):
            continue
        for y, x in px:
            keep[y, x] = True
    out = sub.copy()
    out[~keep, 3] = 0
    return out

def cut_frames(arr, spec, name):
    x0, y0, x1, y1 = spec["box"]
    band = arr[y0:y1, x0:x1].copy()
    for ex0, ey0, ex1, ey1 in spec["erase"]:
        band[max(ey0 - y0, 0):max(ey1 - y0, 0), max(ex0 - x0, 0):max(ex1 - x0, 0), 3] = 0
    opaque = band[..., 3] > ALPHA_MIN
    if spec.get("cuts"):          # poses that overlap horizontally: split at fixed x positions
        edges = [0] + [c - x0 for c in spec["cuts"]] + [band.shape[1]]
        runs = [(a, b) for a, b in zip(edges, edges[1:])]
    else:
        runs = runs_of_true(opaque.any(axis=0), spec['gap'])
        runs = [r for r in runs if r[1] - r[0] >= 40]
    if len(runs) != spec["count"]:
        raise SystemExit(f"{name}: expected {spec['count']} frames, found {len(runs)}: {runs}")
    frames = []
    for a, b in runs:
        sub = clean_fragments(band[:, a:b].copy())
        occ = sub[..., 3] > ALPHA_MIN
        ys = np.flatnonzero(occ.any(axis=1)); xs = np.flatnonzero(occ.any(axis=0))
        sub = sub[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1].copy()
        sub[..., 3] = np.where(sub[..., 3] > 6, sub[..., 3], 0)
        frames.append(sub)
    return frames

def resize_premult(img, scale):
    h, w = img.shape[:2]
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    if (nw, nh) == (w, h):
        return img
    f = img.astype(np.float32)
    a = f[..., 3:4] / 255.0
    pm = np.concatenate([f[..., :3] * a, f[..., 3:4]], axis=2)
    chans = [np.asarray(Image.fromarray(pm[..., i]).resize((nw, nh), Image.LANCZOS), dtype=np.float32) for i in range(4)]
    pm2 = np.stack(chans, axis=2)
    alpha = np.clip(pm2[..., 3:4], 0, 255)
    rgb = np.where(alpha > 0.5, pm2[..., :3] / np.maximum(alpha / 255.0, 1e-6), 0)
    return np.clip(np.concatenate([rgb, alpha], axis=2), 0, 255).astype(np.uint8)

def feet_x(img):
    h = img.shape[0]
    band = img[int(h * 0.90):, :, 3] > ALPHA_MIN
    xs = np.flatnonzero(band.any(axis=0))
    return float(xs.mean()) if xs.size else img.shape[1] / 2

def place(cell, img, lift):
    h, w = img.shape[:2]
    fx = feet_x(img)
    x = int(round(ANCHOR_X - fx)); y = int(round(ANCHOR_Y - lift - h))
    if x < 8 or x + w > CELL_W - 8 or y < 8 or y + h > CELL_H - 8:
        raise SystemExit(f"frame {w}x{h} at ({x},{y}) violates the 8px safe margin")
    cell[y:y + h, x:x + w] = img

def main(sheet, out):
    out = Path(out); (out / "atlases").mkdir(parents=True, exist_ok=True)
    arr = np.array(Image.open(sheet).convert("RGBA"))
    cut = {n: cut_frames(arr, s, n) for n, s in BANDS.items()}
    scale = STAND_H / float(np.median([f.shape[0] for f in cut["idle"]]))
    print(f"uniform scale {scale:.3f} (idle median height -> {STAND_H}px)")
    manifest = {"schema": 1, "character": "nova", "version": "0.1.0-prototype",
                "logicalSize": {"w": 220, "h": 240}, "frameSize": {"w": CELL_W, "h": CELL_H},
                "anchor": {"x": ANCHOR_X, "y": ANCHOR_Y}, "hoverCooldownMs": 1500, "clips": {},
                "events": {"click": "hop", "hoverEnter": "react"}}
    meta = {"idle": dict(loop=True, priority=0, preload=True),
            "react": dict(loop=False, priority=1, next="idle", interruptibleBy=["hop"]),
            "hop": dict(loop=False, priority=2, next="idle", retrigger="queue")}
    cells = {}
    for name, frames in cut.items():
        n = len(frames); rows = -(-n // COLUMNS)
        atlas = np.zeros((rows * CELL_H, COLUMNS * CELL_W, 4), np.uint8)
        cells[name] = []
        for i, f in enumerate(frames):
            cell = np.zeros((CELL_H, CELL_W, 4), np.uint8)
            place(cell, resize_premult(f, scale), HOP_LIFT[i] if name == "hop" else 0)
            r, c = divmod(i, COLUMNS)
            atlas[r * CELL_H:(r + 1) * CELL_H, c * CELL_W:(c + 1) * CELL_W] = cell
            cells[name].append(cell)
        Image.fromarray(atlas, "RGBA").save(out / "atlases" / f"{name}.webp", lossless=True, quality=100, method=6)
        d = DURATIONS[name]; assert len(d) == n
        manifest["clips"][name] = dict(atlas=f"atlases/{name}.webp", columns=COLUMNS, frames=n,
                                       fps=round(1000 * n / sum(d), 3), durations=d, **meta[name])
    (out / "manifest.prototype.json").write_text(json.dumps(manifest, indent=2) + "\n")
    # Preview: contact sheet and an animated GIF on a dark and a light background.
    tile = 220
    def bg(color): return Image.new("RGBA", (CELL_W, CELL_H), color)
    names = list(cells)
    sheet_img = Image.new("RGBA", (max(len(v) for v in cells.values()) * 165, len(names) * 180), (40, 44, 58, 255))
    for r, nme in enumerate(names):
        for c, cell in enumerate(cells[nme]):
            t = Image.alpha_composite(bg((40, 44, 58, 255)), Image.fromarray(cell, "RGBA")).resize((165, 180), Image.LANCZOS)
            sheet_img.paste(t, (c * 165, r * 180))
    sheet_img.convert("RGB").save(out / "contact_sheet.png")
    seq = [("idle", i) for i in range(len(cells["idle"]))] * 2 + [("react", i) for i in range(len(cells["react"]))] \
        + [("idle", 0)] + [("hop", i) for i in range(len(cells["hop"]))] + [("idle", 0)]
    gif, gifd = [], []
    for nme, i in seq:
        fr = Image.fromarray(cells[nme][i], "RGBA")
        pair = Image.new("RGBA", (CELL_W * 2, CELL_H))
        pair.paste(Image.alpha_composite(bg((32, 36, 50, 255)), fr), (0, 0))
        pair.paste(Image.alpha_composite(bg((226, 232, 240, 255)), fr), (CELL_W, 0))
        gif.append(pair.convert("RGB").resize((CELL_W, CELL_H // 2 + 0 if False else CELL_H // 1), Image.LANCZOS).resize((int(CELL_W * 2 * 0.6), int(CELL_H * 0.6)), Image.LANCZOS))
        gifd.append(DURATIONS[nme][i])
    gif[0].save(out / "preview.gif", save_all=True, append_images=gif[1:], duration=gifd, loop=0, optimize=False)
    print("frames:", {k: len(v) for k, v in cells.items()})

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
