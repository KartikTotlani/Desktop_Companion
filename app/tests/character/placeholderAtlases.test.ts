// Tests for the placeholder atlas generator (no real canvas needed: a recording fake is used).
//   node --experimental-strip-types --test tests/character/placeholderAtlases.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import { atlasSize } from "../../src/character/framePlayer.ts";
import {
  createPlaceholderAtlases,
  drawPlaceholderFrame,
} from "../../src/character/placeholderAtlases.ts";
import type { PlaceholderCanvas } from "../../src/character/placeholderAtlases.ts";
import type { CharacterManifest } from "../../src/character/types.ts";

function loadManifest(): CharacterManifest {
  const json = JSON.parse(
    readFileSync(new URL("../../src/character/nova/manifest.json", import.meta.url), "utf8"),
  );
  const r = parseManifest(json);
  if (!r.ok) throw new Error(r.errors.join("; "));
  return r.manifest;
}

const m = loadManifest();

/** A context that records method names and swallows property writes. */
function recordingContext(log: string[]): CanvasRenderingContext2D {
  return new Proxy({} as Record<string, unknown>, {
    get: (_t, prop) => (...args: unknown[]) => {
      log.push(`${String(prop)}(${args.length})`);
    },
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
}

describe("createPlaceholderAtlases", () => {
  it("creates one atlas per clip with the layout from the manifest", () => {
    const created: Array<{ w: number; h: number }> = [];
    const log: string[] = [];
    const atlases = createPlaceholderAtlases(m, (w, h) => {
      created.push({ w, h });
      const c: PlaceholderCanvas = { width: w, height: h, getContext: () => recordingContext(log) };
      return c;
    });
    assert.deepEqual([...atlases.keys()].sort(), ["hop", "idle", "react"]);
    assert.deepEqual(created, [
      atlasSize(m.clips.idle, m.frameSize),
      atlasSize(m.clips.hop, m.frameSize),
      atlasSize(m.clips.react, m.frameSize),
    ]);
    assert.deepEqual(created[0], { w: 1320, h: 1080 });
  });

  it("draws every frame inside a balanced save/restore pair", () => {
    const log: string[] = [];
    createPlaceholderAtlases(m, (w, h) => ({ width: w, height: h, getContext: () => recordingContext(log) }));
    const saves = log.filter((l) => l.startsWith("save")).length;
    const restores = log.filter((l) => l.startsWith("restore")).length;
    const totalFrames = m.clips.idle.frames + m.clips.hop.frames + m.clips.react.frames;
    assert.equal(saves, restores);
    assert.equal(saves, totalFrames * 2); // one per cell plus one per character draw
  });

  it("leaves out a clip whose canvas context is unavailable", () => {
    const log: string[] = [];
    let n = 0;
    const atlases = createPlaceholderAtlases(m, (w, h) => {
      n++;
      return { width: w, height: h, getContext: () => (n === 2 ? null : recordingContext(log)) };
    });
    assert.equal(atlases.size, 2);
    assert.equal(atlases.has("hop"), false);
  });
});

describe("drawPlaceholderFrame", () => {
  it("draws every frame of every clip without throwing", () => {
    for (const id of ["idle", "hop", "react"] as const) {
      const frames = m.clips[id].frames;
      for (let f = 0; f < frames; f++) {
        drawPlaceholderFrame(recordingContext([]), id, f, frames, 1.5);
      }
    }
  });

  it("keeps save and restore balanced", () => {
    const log: string[] = [];
    drawPlaceholderFrame(recordingContext(log), "hop", 4, 10, 1.5);
    assert.equal(log.filter((l) => l.startsWith("save")).length, log.filter((l) => l.startsWith("restore")).length);
  });
});
