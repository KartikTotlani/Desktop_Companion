// Tests for pure frame selection and timing. Run with Node's built-in runner:
//   node --experimental-strip-types --test tests/character/framePlayer.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import { clipDurationMs, createInitialState, send } from "../../src/character/stateMachine.ts";
import {
  atlasSize,
  backingSize,
  describeFrame,
  frameCell,
  frameIndexAt,
} from "../../src/character/framePlayer.ts";
import type { CharacterManifest, MachineState } from "../../src/character/types.ts";

function loadManifest(): CharacterManifest {
  const json = JSON.parse(
    readFileSync(new URL("../../src/character/nova/manifest.json", import.meta.url), "utf8"),
  );
  const r = parseManifest(json);
  if (!r.ok) throw new Error(r.errors.join("; "));
  return r.manifest;
}

const m = loadManifest();
const { idle, hop, react } = m.clips;
const HOP_MS = clipDurationMs(hop);

describe("frameIndexAt", () => {
  it("steps through a looping clip and wraps", () => {
    assert.equal(frameIndexAt(idle, 0), 0);
    assert.equal(frameIndexAt(idle, 99.9), 0);
    assert.equal(frameIndexAt(idle, 100), 1);
    assert.equal(frameIndexAt(idle, 1199), 11);
    assert.equal(frameIndexAt(idle, 1200), 0);
    assert.equal(frameIndexAt(idle, 2500), 1);
  });

  it("holds the last frame of a one-shot at and after its end", () => {
    assert.equal(frameIndexAt(hop, 0), 0);
    assert.equal(frameIndexAt(hop, HOP_MS - 1), 9);
    assert.equal(frameIndexAt(hop, HOP_MS), 9);
    assert.equal(frameIndexAt(hop, HOP_MS * 5), 9);
    assert.equal(frameIndexAt(react, 500), 5);
  });

  it("hits every frame in order for a one-shot with a non-terminating frame time", () => {
    const seen: number[] = [];
    for (let i = 0; i < hop.frames; i++) seen.push(frameIndexAt(hop, (i * 1000) / hop.fps));
    assert.deepEqual(seen, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("treats negative and non-finite elapsed time as the first frame", () => {
    for (const e of [-5, NaN, -Infinity]) assert.equal(frameIndexAt(idle, e), 0);
  });

  it("honours per-frame durations", () => {
    const def = { ...idle, frames: 3, durations: [100, 50, 50] };
    assert.equal(frameIndexAt(def, 0), 0);
    assert.equal(frameIndexAt(def, 99), 0);
    assert.equal(frameIndexAt(def, 100), 1);
    assert.equal(frameIndexAt(def, 149), 1);
    assert.equal(frameIndexAt(def, 150), 2);
    assert.equal(frameIndexAt(def, 199), 2);
    assert.equal(frameIndexAt(def, 200), 0); // loop wraps
  });
});

describe("frameCell and atlasSize", () => {
  it("maps frames to row-major atlas cells", () => {
    assert.deepEqual(frameCell(idle, 0, m.frameSize), { sx: 0, sy: 0, sw: 330, sh: 360 });
    assert.deepEqual(frameCell(idle, 5, m.frameSize), { sx: 330, sy: 360, sw: 330, sh: 360 });
    assert.deepEqual(frameCell(idle, 11, m.frameSize), { sx: 990, sy: 720, sw: 330, sh: 360 });
  });

  it("clamps out-of-range and invalid frames", () => {
    assert.deepEqual(frameCell(idle, 99, m.frameSize), frameCell(idle, 11, m.frameSize));
    assert.deepEqual(frameCell(idle, -3, m.frameSize), frameCell(idle, 0, m.frameSize));
    assert.deepEqual(frameCell(idle, NaN, m.frameSize), frameCell(idle, 0, m.frameSize));
  });

  it("atlas sizes match the approved specification", () => {
    assert.deepEqual(atlasSize(idle, m.frameSize), { w: 1320, h: 1080 });
    assert.deepEqual(atlasSize(hop, m.frameSize), { w: 1320, h: 1080 });
    assert.deepEqual(atlasSize(react, m.frameSize), { w: 1320, h: 720 });
  });

  it("every frame cell lies inside its atlas", () => {
    for (const def of [idle, hop, react]) {
      const a = atlasSize(def, m.frameSize);
      for (let f = 0; f < def.frames; f++) {
        const c = frameCell(def, f, m.frameSize);
        assert.ok(c.sx >= 0 && c.sy >= 0 && c.sx + c.sw <= a.w && c.sy + c.sh <= a.h);
      }
    }
  });
});

describe("backingSize", () => {
  it("scales with devicePixelRatio and never exceeds the shipped frame", () => {
    assert.deepEqual(backingSize(m.logicalSize, 1, m.frameSize), { w: 220, h: 240 });
    assert.deepEqual(backingSize(m.logicalSize, 1.25, m.frameSize), { w: 275, h: 300 });
    assert.deepEqual(backingSize(m.logicalSize, 1.5, m.frameSize), { w: 330, h: 360 });
    assert.deepEqual(backingSize(m.logicalSize, 2, m.frameSize), { w: 330, h: 360 });
  });

  it("treats an invalid ratio as 1", () => {
    for (const r of [NaN, 0, -2, Infinity]) {
      assert.deepEqual(backingSize(m.logicalSize, r, m.frameSize), { w: 220, h: 240 });
    }
  });
});

describe("describeFrame", () => {
  it("describes idle and the time to the next frame", () => {
    const s0 = createInitialState(0);
    const v = describeFrame(m, s0, 0);
    assert.equal(v.clip, "idle");
    assert.equal(v.frame, 0);
    assert.deepEqual(v.cell, { sx: 0, sy: 0, sw: 330, sh: 360 });
    assert.equal(v.wakeInMs, 100);
    assert.equal(describeFrame(m, s0, 50).wakeInMs, 50);
  });

  it("follows the state machine: click starts hop, then idle resumes", () => {
    const hopState = send(m, createInitialState(0), "click", 1000);
    const v = describeFrame(m, hopState, 1000);
    assert.equal(v.clip, "hop");
    assert.equal(v.frame, 0);
    assert.ok(Math.abs(v.wakeInMs - 1000 / 15) < 1e-6);
    const end = describeFrame(m, hopState, 1000 + HOP_MS);
    assert.equal(end.clip, "idle");
    assert.equal(end.state.clipStartedAt, 1000 + HOP_MS);
  });

  it("on a one-shot's last frame, wakes at the clip end", () => {
    const hopState = send(m, createInitialState(0), "click", 0);
    const t = (9 * 1000) / 15 + 1; // one ms into the last frame
    const v = describeFrame(m, hopState, t);
    assert.equal(v.frame, 9);
    assert.ok(Math.abs(t + v.wakeInMs - HOP_MS) < 1e-6);
  });

  it("scheduling by wakeInMs visits every idle frame exactly once per loop", () => {
    const s = createInitialState(0);
    let t = 0;
    let prev = describeFrame(m, s, t).frame;
    for (let i = 0; i < 40; i++) {
      t += describeFrame(m, s, t).wakeInMs;
      const next = describeFrame(m, s, t).frame;
      assert.equal(next, (prev + 1) % idle.frames, `wake ${i} at t=${t}`);
      prev = next;
    }
  });

  it("scheduling by wakeInMs visits every hop frame in order", () => {
    const s = send(m, createInitialState(0), "click", 0);
    let t = 0;
    const frames = [describeFrame(m, s, t).frame];
    while (frames.length < hop.frames) {
      t += describeFrame(m, s, t).wakeInMs;
      frames.push(describeFrame(m, s, t).frame);
    }
    assert.deepEqual(frames, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("always asks for a wake-up of at least 1 ms", () => {
    const hopState = send(m, createInitialState(0), "click", 0);
    for (let t = 0; t < 3000; t += 7.3) {
      assert.ok(describeFrame(m, hopState, t).wakeInMs >= 1);
    }
  });

  it("never throws and falls back to idle on corrupted state or time", () => {
    const bad: unknown[] = [
      null,
      undefined,
      42,
      { clip: "walk", clipStartedAt: 0, queued: false, lastHoverAt: null },
      { clip: "hop", clipStartedAt: NaN, queued: false, lastHoverAt: null },
    ];
    for (const b of bad) {
      for (const t of [100, NaN, Infinity]) {
        const v = describeFrame(m, b as MachineState, t);
        assert.equal(v.clip, "idle", `${JSON.stringify(b)} at ${t}`);
        assert.ok(v.wakeInMs >= 1);
      }
    }
  });
});
