// Silhouette hit mask. Pure: no DOM, canvas, React or Tauri imports.
// A mask is a coarse grid (one cell per `block` frame pixels) marking where the character is
// opaque. It is built once from the standing-pose pixels (or decoded from a precomputed manifest
// `hit` field) and queried with logical (CSS) pixel coordinates, so it is independent of DPI.

import type { HitMaskDef, Size } from "./types.ts";

export interface HitMask {
  w: number;
  h: number;
  /** One byte per cell: 1 = hit, 0 = transparent. Row-major. */
  cells: Uint8Array;
}

/** RGBA pixel data of one frame (ImageData satisfies this). */
export interface PixelFrame {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

export interface BuildOptions {
  /** Alpha (0-255) at or above which a pixel counts as part of the character. */
  alphaThreshold?: number;
  /** Frame pixels per mask cell. */
  block?: number;
  /** Cells to grow the silhouette by, for forgiving hit testing. */
  dilate?: number;
}

/**
 * Union of the opaque pixels of all frames, shrunk by `block` and dilated by `dilate` cells.
 * Frames whose size differs from the first are skipped. Returns null for no usable frames.
 */
export function buildHitMask(frames: readonly PixelFrame[], opts: BuildOptions = {}): HitMask | null {
  if (frames.length === 0) return null;
  const { width, height } = frames[0];
  if (!(width > 0) || !(height > 0)) return null;
  const alphaThreshold = opts.alphaThreshold ?? 96;
  const block = Math.max(1, Math.floor(opts.block ?? 4));
  const dilate = Math.max(0, Math.floor(opts.dilate ?? 2));
  const w = Math.ceil(width / block);
  const h = Math.ceil(height / block);

  const base = new Uint8Array(w * h);
  for (const f of frames) {
    if (f.width !== width || f.height !== height) continue;
    for (let y = 0; y < height; y++) {
      const rowCells = Math.floor(y / block) * w;
      const rowPixels = y * width;
      for (let x = 0; x < width; x++) {
        if (f.data[(rowPixels + x) * 4 + 3] >= alphaThreshold) base[rowCells + Math.floor(x / block)] = 1;
      }
    }
  }
  if (dilate === 0) return { w, h, cells: base };

  // Separable square dilation: horizontal pass, then vertical pass.
  const horiz = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!base[y * w + x]) continue;
      for (let dx = -dilate; dx <= dilate; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w) horiz[y * w + nx] = 1;
      }
    }
  }
  const cells = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!horiz[y * w + x]) continue;
      for (let dy = -dilate; dy <= dilate; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) cells[ny * w + x] = 1;
      }
    }
  }
  return { w, h, cells };
}

/** Decode a precomputed manifest mask (base64, 1 bit per cell, row-major, most significant bit first). */
export function decodeHitMask(def: HitMaskDef | undefined): HitMask | null {
  if (!def) return null;
  let bytes: Uint8Array;
  try {
    const binary = atob(def.data);
    bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
  if (bytes.length !== Math.ceil((def.w * def.h) / 8)) return null;
  const cells = new Uint8Array(def.w * def.h);
  for (let i = 0; i < cells.length; i++) cells[i] = (bytes[i >> 3] >> (7 - (i & 7))) & 1;
  return { w: def.w, h: def.h, cells };
}

/**
 * Is the logical point (x, y) on the character? `logical` is the size the mask covers (the
 * canvas size in CSS pixels). With no mask every point inside the box counts as a hit, which
 * preserves the behaviour of a fully interactive window.
 */
export function isHit(mask: HitMask | null, x: number, y: number, logical: Size): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < 0 || y < 0 || x >= logical.w || y >= logical.h) return false;
  if (!mask) return true;
  const cx = Math.floor((x / logical.w) * mask.w);
  const cy = Math.floor((y / logical.h) * mask.h);
  return mask.cells[cy * mask.w + cx] === 1;
}
