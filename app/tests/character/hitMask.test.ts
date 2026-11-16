// Tests for the silhouette hit mask.
//   node --experimental-strip-types --test tests/character/hitMask.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildHitMask, decodeHitMask, isHit } from "../../src/character/hitMask.ts";
import type { PixelFrame } from "../../src/character/hitMask.ts";

/** A width x height RGBA frame; `paint(x, y)` returns the alpha for that pixel. */
function frame(width: number, height: number, paint: (x: number, y: number) => number): PixelFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data[(y * width + x) * 4 + 3] = paint(x, y);
  }
  return { width, height, data };
}

const square = (x0: number, y0: number, x1: number, y1: number, alpha = 255) =>
  (x: number, y: number) => (x >= x0 && x < x1 && y >= y0 && y < y1 ? alpha : 0);

describe("buildHitMask", () => {
  it("marks opaque cells and leaves transparent ones empty (no dilation)", () => {
    const m = buildHitMask([frame(40, 40, square(8, 8, 20, 20))], { dilate: 0 })!;
    assert.deepEqual([m.w, m.h], [10, 10]);
    assert.equal(m.cells[2 * 10 + 2], 1); // inside (cells 2..4)
    assert.equal(m.cells[4 * 10 + 4], 1);
    assert.equal(m.cells[1 * 10 + 1], 0); // outside
    assert.equal(m.cells[5 * 10 + 5], 0);
  });

  it("ignores faint glow below the alpha threshold", () => {
    const f = frame(40, 40, (x, y) => (x >= 8 && x < 20 && y >= 8 && y < 20 ? 255 : x >= 24 && x < 36 && y >= 24 && y < 36 ? 50 : 0));
    const m = buildHitMask([f], { dilate: 0 })!;
    assert.equal(m.cells[7 * 10 + 7], 0, "glow region is not a hit");
    assert.equal(m.cells[2 * 10 + 2], 1);
  });

  it("grows the silhouette by the dilation radius, clamped to the grid", () => {
    const m = buildHitMask([frame(40, 40, square(16, 16, 20, 20))], { dilate: 2 })!;
    // single opaque cell at (4,4) grows to cells 2..6
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const inside = x >= 2 && x <= 6 && y >= 2 && y <= 6;
        assert.equal(m.cells[y * 10 + x], inside ? 1 : 0, `cell ${x},${y}`);
      }
    }
    const edge = buildHitMask([frame(40, 40, square(0, 0, 4, 4))], { dilate: 2 })!;
    assert.equal(edge.cells[0], 1);
    assert.equal(edge.cells[2 * 10 + 2], 1);
    assert.equal(edge.cells[3 * 10 + 3], 0);
  });

  it("is the union of several frames and skips frames of a different size", () => {
    const a = frame(40, 40, square(0, 0, 4, 4));
    const b = frame(40, 40, square(36, 36, 40, 40));
    const odd = frame(20, 20, () => 255);
    const m = buildHitMask([a, b, odd], { dilate: 0 })!;
    assert.equal(m.cells[0], 1);
    assert.equal(m.cells[99], 1);
    assert.equal(m.cells[55], 0);
  });

  it("handles sizes that are not a multiple of the block and returns null for no frames", () => {
    const m = buildHitMask([frame(10, 6, () => 255)], { block: 4, dilate: 0 })!;
    assert.deepEqual([m.w, m.h], [3, 2]);
    assert.ok(m.cells.every((c) => c === 1));
    assert.equal(buildHitMask([]), null);
    assert.equal(buildHitMask([{ width: 0, height: 0, data: [] }]), null);
  });
});

describe("isHit", () => {
  const mask = buildHitMask([frame(40, 40, square(8, 8, 20, 20))], { dilate: 0 });
  const logical = { w: 20, h: 20 }; // mask covers a 20 x 20 logical box (scale 0.5)

  it("maps logical coordinates onto mask cells independently of scale", () => {
    assert.equal(isHit(mask, 5, 5, logical), true); // pixel (10,10) of the 40px frame
    assert.equal(isHit(mask, 1, 1, logical), false);
    assert.equal(isHit(mask, 15, 15, logical), false);
  });

  it("is false outside the box and for non-finite coordinates", () => {
    for (const [x, y] of [[-1, 5], [5, -1], [20, 5], [5, 20], [NaN, 5], [5, Infinity]]) {
      assert.equal(isHit(mask, x, y, logical), false, `${x},${y}`);
    }
  });

  it("treats every point inside the box as a hit when there is no mask", () => {
    assert.equal(isHit(null, 1, 1, logical), true);
    assert.equal(isHit(null, 25, 1, logical), false);
  });
});

describe("decodeHitMask", () => {
  const encode = (cells: number[]) => {
    const bytes = new Uint8Array(Math.ceil(cells.length / 8));
    cells.forEach((c, i) => { if (c) bytes[i >> 3] |= 1 << (7 - (i & 7)); });
    return Buffer.from(bytes).toString("base64");
  };
  const cells = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1]; // 5 x 2

  it("decodes a packed mask (row-major, most significant bit first)", () => {
    const m = decodeHitMask({ w: 5, h: 2, alphaThreshold: 96, dilate: 2, data: encode(cells) })!;
    assert.deepEqual([...m.cells], cells);
  });

  it("returns null for missing, malformed or wrong-length data", () => {
    assert.equal(decodeHitMask(undefined), null);
    assert.equal(decodeHitMask({ w: 5, h: 2, alphaThreshold: 96, dilate: 2, data: "%%%not base64" }), null);
    assert.equal(decodeHitMask({ w: 5, h: 2, alphaThreshold: 96, dilate: 2, data: encode([1, 0, 1]) + "AAAA" }), null);
  });
});
