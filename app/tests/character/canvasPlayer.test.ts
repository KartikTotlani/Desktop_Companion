// Tests for the canvas player core using fake timers, frames and a recording canvas.
//   node --experimental-strip-types --test tests/character/canvasPlayer.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import { clipDurationMs } from "../../src/character/stateMachine.ts";
import { CanvasPlayer } from "../../src/character/canvasPlayer.ts";
import type { PlayerContext, PlayerDeps, PlayerSurface } from "../../src/character/canvasPlayer.ts";
import type { CharacterManifest, ClipId } from "../../src/character/types.ts";

function loadManifest(): CharacterManifest {
  const json = JSON.parse(
    readFileSync(new URL("../../src/character/nova/manifest.json", import.meta.url), "utf8"),
  );
  const r = parseManifest(json);
  if (!r.ok) throw new Error(r.errors.join("; "));
  return r.manifest;
}

const m = loadManifest();
const HOP_MS = clipDurationMs(m.clips.hop);

interface DrawCall {
  image: unknown;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dw: number;
  dh: number;
}

/** Fake clock, timers and animation frames driven by the test. */
function makeHarness(opts: { atlases?: ClipId[]; dpr?: number } = {}) {
  let t = 0;
  let nextId = 1;
  const timers = new Map<number, { at: number; cb: () => void }>();
  const frames = new Map<number, () => void>();
  const calls: DrawCall[] = [];
  let clears = 0;

  const ctx: PlayerContext = {
    imageSmoothingEnabled: false,
    imageSmoothingQuality: "low",
    clearRect: () => { clears++; },
    drawImage: (image, sx, sy, sw, sh, _dx, _dy, dw, dh) => { calls.push({ image, sx, sy, sw, sh, dw, dh }); },
  };
  const surface: PlayerSurface = { width: 300, height: 150, getContext: () => ctx };

  const deps: PlayerDeps = {
    now: () => t,
    setTimer: (cb, ms) => { const id = nextId++; timers.set(id, { at: t + ms, cb }); return id; },
    clearTimer: (h) => { timers.delete(h as number); },
    requestFrame: (cb) => { const id = nextId++; frames.set(id, cb); return id; },
    cancelFrame: (h) => { frames.delete(h as number); },
  };

  const ids: ClipId[] = opts.atlases ?? ["idle", "hop", "react"];
  const atlases = new Map<ClipId, unknown>(ids.map((id) => [id, { atlas: id }]));
  const player = new CanvasPlayer(m, surface, atlases, deps, opts.dpr ?? 1);

  const flush = () => {
    const pending = [...frames.entries()];
    frames.clear();
    for (const [, cb] of pending) cb();
  };
  /** Run timers due up to `ms`, flushing frames after each, then set the clock to `ms`. */
  const advanceTo = (ms: number) => {
    for (;;) {
      let nextAt = Infinity;
      let nextKey = -1;
      for (const [k, v] of timers) if (v.at < nextAt) { nextAt = v.at; nextKey = k; }
      if (nextKey === -1 || nextAt > ms) break;
      const timer = timers.get(nextKey)!;
      timers.delete(nextKey);
      t = Math.max(t, timer.at);
      timer.cb();
      flush();
    }
    t = ms;
  };
  return { player, surface, calls, timers, frames, flush, advanceTo, setTime: (v: number) => { t = v; }, clears: () => clears, atlases };
}

describe("startup and drawing", () => {
  it("draws idle frame 0 into a backing store sized for the pixel ratio", () => {
    const h = makeHarness({ dpr: 1 });
    h.player.start();
    assert.equal(h.surface.width, 220);
    assert.equal(h.surface.height, 240);
    assert.equal(h.calls.length, 0, "drawing waits for the animation frame");
    h.flush();
    assert.equal(h.calls.length, 1);
    const c = h.calls[0];
    assert.deepEqual(c.image, { atlas: "idle" });
    assert.deepEqual([c.sx, c.sy, c.sw, c.sh, c.dw, c.dh], [0, 0, 330, 360, 220, 240]);
    assert.equal(h.clears(), 1);
  });

  it("sizes the backing store for 150% scaling", () => {
    const h = makeHarness({ dpr: 1.5 });
    h.player.start();
    h.flush();
    assert.deepEqual([h.surface.width, h.surface.height], [330, 360]);
    assert.deepEqual([h.calls[0].dw, h.calls[0].dh], [330, 360]);
  });

  it("advances one frame per wake-up and only draws when the frame changes", () => {
    const h = makeHarness();
    h.player.start();
    h.flush();
    h.advanceTo(100);
    assert.equal(h.calls.length, 2);
    assert.equal(h.calls[1].sx, 330); // frame 1
    h.advanceTo(199);
    assert.equal(h.calls.length, 2, "no draw between frame boundaries");
    h.advanceTo(200);
    assert.equal(h.calls.length, 3);
    assert.equal(h.calls[2].sx, 660); // frame 2
  });

  it("keeps exactly one pending wake-up", () => {
    const h = makeHarness();
    h.player.start();
    assert.equal(h.timers.size, 1);
    h.advanceTo(350);
    assert.equal(h.timers.size, 1);
  });

  it("coalesces several ticks before an animation frame into one draw", () => {
    const h = makeHarness();
    h.player.start();
    h.player.send("hoverEnter");
    h.player.send("click");
    assert.equal(h.frames.size, 1);
    h.flush();
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.calls[0].image, { atlas: "hop" });
  });

  it("does not throw and draws nothing when the idle atlas is missing", () => {
    const h = makeHarness({ atlases: ["hop", "react"] });
    h.player.start();
    h.flush();
    h.advanceTo(500);
    assert.equal(h.calls.length, 0);
  });
});

describe("interaction", () => {
  it("click plays hop then returns to idle", () => {
    const h = makeHarness();
    h.player.start();
    h.flush();
    h.advanceTo(1000);
    h.player.send("click");
    h.flush();
    assert.equal(h.player.getState().clip, "hop");
    assert.deepEqual(h.calls[h.calls.length - 1].image, { atlas: "hop" });
    h.advanceTo(1000 + HOP_MS + 1);
    assert.equal(h.player.getState().clip, "idle");
    assert.deepEqual(h.calls[h.calls.length - 1].image, { atlas: "idle" });
  });

  it("hoverEnter plays react", () => {
    const h = makeHarness();
    h.player.start();
    h.player.send("hoverEnter");
    assert.equal(h.player.getState().clip, "react");
  });

  it("queues one extra hop for rapid clicks", () => {
    const h = makeHarness();
    h.player.start();
    h.player.send("click");
    h.advanceTo(100);
    h.player.send("click");
    h.player.send("click");
    assert.equal(h.player.getState().queued, true);
    h.advanceTo(100000);
    assert.equal(h.player.getState().clip, "idle");
  });

  it("ignores unknown events and events for clips without an atlas", () => {
    const h = makeHarness({ atlases: ["idle", "react"] });
    h.player.start();
    h.player.send("doubleClick");
    h.player.send("click"); // hop atlas unavailable
    assert.equal(h.player.getState().clip, "idle");
    h.player.send("hoverEnter");
    assert.equal(h.player.getState().clip, "react");
  });
});

describe("pause and resume", () => {
  it("pause stops timers and drawing; events are ignored while paused", () => {
    const h = makeHarness();
    h.player.start();
    h.flush();
    h.advanceTo(150);
    h.player.pause();
    assert.equal(h.timers.size, 0);
    assert.equal(h.frames.size, 0);
    const drawn = h.calls.length;
    h.player.send("click");
    h.advanceTo(5000);
    assert.equal(h.calls.length, drawn);
    assert.equal(h.player.getState().clip, "idle");
  });

  it("resume continues on the same frame and keeps the frame cadence", () => {
    const h = makeHarness();
    h.player.start();
    h.flush();
    h.advanceTo(150); // idle frame 1, 50 ms before frame 2
    h.player.pause();
    h.advanceTo(5150); // 5 s hidden
    h.player.resume();
    h.flush();
    assert.equal(h.calls[h.calls.length - 1].sx, 330, "still frame 1");
    h.advanceTo(5199);
    assert.equal(h.calls[h.calls.length - 1].sx, 330);
    h.advanceTo(5200);
    assert.equal(h.calls[h.calls.length - 1].sx, 660, "frame 2 fifty ms after resume");
  });

  it("resumes a paused hop where it stopped instead of skipping it", () => {
    const h = makeHarness();
    h.player.start();
    h.advanceTo(1000);
    h.player.send("click");
    h.advanceTo(1200);
    h.player.pause();
    h.advanceTo(60000);
    h.player.resume();
    assert.equal(h.player.getState().clip, "hop");
    h.advanceTo(60000 + HOP_MS);
    assert.equal(h.player.getState().clip, "idle");
  });

  it("pause and resume are idempotent", () => {
    const h = makeHarness();
    h.player.start();
    h.player.resume(); // not paused: no effect
    h.player.pause();
    h.player.pause();
    h.player.resume();
    h.player.resume();
    assert.equal(h.timers.size, 1);
  });
});

describe("scale changes and teardown", () => {
  it("resizes and redraws when the pixel ratio changes", () => {
    const h = makeHarness({ dpr: 1 });
    h.player.start();
    h.flush();
    h.player.setPixelRatio(1.25);
    h.flush();
    assert.deepEqual([h.surface.width, h.surface.height], [275, 300]);
    const last = h.calls[h.calls.length - 1];
    assert.deepEqual([last.dw, last.dh], [275, 300]);
    assert.equal(h.timers.size, 1);
  });

  it("destroy cancels everything and later calls are no-ops", () => {
    const h = makeHarness();
    h.player.start();
    h.player.destroy();
    assert.equal(h.timers.size, 0);
    assert.equal(h.frames.size, 0);
    h.player.send("click");
    h.player.start();
    h.player.pause();
    h.player.resume();
    h.player.setPixelRatio(2);
    h.player.destroy();
    h.advanceTo(10000);
    assert.equal(h.timers.size, 0);
    assert.equal(h.calls.length, 0);
  });

  it("start twice does not leave two timers (StrictMode-style remount safety)", () => {
    const h = makeHarness();
    h.player.start();
    h.player.start();
    assert.equal(h.timers.size, 1);
  });
});

describe("atlases that arrive late", () => {
  it("draws nothing until idle arrives, then refresh() draws the current frame", () => {
    const h = makeHarness({ atlases: [] });
    h.player.start();
    h.flush();
    assert.equal(h.calls.length, 0);
    h.atlases.set("idle", { atlas: "idle" });
    h.player.refresh();
    h.flush();
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.calls[0].image, { atlas: "idle" });
    assert.equal(h.timers.size, 1);
  });

  it("a click is ignored until the hop atlas has loaded, then works", () => {
    const h = makeHarness({ atlases: ["idle"] });
    h.player.start();
    h.player.send("click");
    assert.equal(h.player.getState().clip, "idle");
    h.atlases.set("hop", { atlas: "hop" });
    h.player.send("click");
    assert.equal(h.player.getState().clip, "hop");
  });

  it("refresh is a no-op while paused or after destroy", () => {
    const h = makeHarness();
    h.player.start();
    h.player.pause();
    h.player.refresh();
    assert.equal(h.timers.size, 0);
    h.player.resume();
    h.player.destroy();
    h.player.refresh();
    assert.equal(h.timers.size, 0);
  });
});
