// Tests for the pure animation state machine. Run with Node's built-in runner (no new dependencies):
//   node --experimental-strip-types --test tests/character/stateMachine.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import {
  advance,
  clipDurationMs,
  createInitialState,
  send,
  shiftTime,
} from "../../src/character/stateMachine.ts";
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
const HOP_MS = clipDurationMs(m.clips.hop); // 10 frames at 15 fps
const REACT_MS = clipDurationMs(m.clips.react); // 6 frames at 12 fps

describe("durations", () => {
  it("are derived from frames and fps", () => {
    assert.equal(REACT_MS, 500);
    assert.ok(Math.abs(HOP_MS - 10000 / 15) < 1e-9);
  });

  it("use per-frame durations when present", () => {
    assert.equal(clipDurationMs({ ...m.clips.hop, durations: [100, 50, 50, 100, 100, 100, 100, 100, 100, 100] }), 900);
  });
});

describe("initial state and idle", () => {
  it("starts in idle with nothing queued", () => {
    assert.deepEqual(createInitialState(5), { clip: "idle", clipStartedAt: 5, queued: false, lastHoverAt: null });
  });

  it("falls back to time 0 for a non-finite start time", () => {
    assert.equal(createInitialState(NaN).clipStartedAt, 0);
  });

  it("idle loops forever and never changes on its own", () => {
    const s0 = createInitialState(0);
    for (const t of [1, 1000, 123456, 1e9]) assert.deepEqual(advance(m, s0, t), s0);
  });
});

describe("interaction mapping", () => {
  it("click starts hop from idle", () => {
    const s = send(m, createInitialState(0), "click", 1000);
    assert.deepEqual(s, { clip: "hop", clipStartedAt: 1000, queued: false, lastHoverAt: null });
  });

  it("hoverEnter starts react from idle", () => {
    const s = send(m, createInitialState(0), "hoverEnter", 1000);
    assert.deepEqual(s, { clip: "react", clipStartedAt: 1000, queued: false, lastHoverAt: 1000 });
  });
});

describe("one-shots return to idle", () => {
  it("hop plays, then returns to idle at its exact end time", () => {
    const hop = send(m, createInitialState(0), "click", 1000);
    assert.equal(advance(m, hop, 1000 + HOP_MS - 0.001).clip, "hop");
    const done = advance(m, hop, 1000 + HOP_MS);
    assert.equal(done.clip, "idle");
    assert.equal(done.clipStartedAt, 1000 + HOP_MS);
  });

  it("react plays, then returns to idle at its exact end time", () => {
    const react = send(m, createInitialState(0), "hoverEnter", 0);
    assert.equal(advance(m, react, REACT_MS - 0.001).clip, "react");
    const done = advance(m, react, REACT_MS);
    assert.equal(done.clip, "idle");
    assert.equal(done.clipStartedAt, REACT_MS);
  });

  it("still lands on idle when the timer is very late", () => {
    const hop = send(m, createInitialState(0), "click", 0);
    assert.equal(advance(m, hop, 60_000).clip, "idle");
  });
});

describe("interruption and priorities", () => {
  it("click interrupts react and starts hop", () => {
    const react = send(m, createInitialState(0), "hoverEnter", 0);
    const s = send(m, react, "click", 100);
    assert.deepEqual(s, { clip: "hop", clipStartedAt: 100, queued: false, lastHoverAt: 0 });
  });

  it("hoverEnter does not interrupt hop and is not queued", () => {
    const hop = send(m, createInitialState(0), "click", 0);
    const s = send(m, hop, "hoverEnter", 100);
    assert.deepEqual(s, hop);
    assert.equal(s.lastHoverAt, null);
  });

  it("hoverEnter does not restart or queue react while it plays", () => {
    const react = send(m, createInitialState(0), "hoverEnter", 0);
    assert.deepEqual(send(m, react, "hoverEnter", 100), react);
  });
});

describe("rapid clicks", () => {
  it("queues exactly one extra hop; more clicks are dropped", () => {
    const hop = send(m, createInitialState(0), "click", 0);
    const queued = send(m, hop, "click", 100);
    assert.equal(queued.clip, "hop");
    assert.equal(queued.queued, true);
    assert.deepEqual(send(m, queued, "click", 200), queued);
    assert.deepEqual(send(m, queued, "click", 300), queued);
  });

  it("plays the queued hop right after the first, then returns to idle", () => {
    let s = send(m, createInitialState(0), "click", 0);
    s = send(m, s, "click", 100);
    const second = advance(m, s, HOP_MS);
    assert.deepEqual(second, { clip: "hop", clipStartedAt: HOP_MS, queued: false, lastHoverAt: null });
    const done = advance(m, second, HOP_MS + HOP_MS);
    assert.equal(done.clip, "idle");
    assert.equal(done.clipStartedAt, HOP_MS + HOP_MS);
  });

  it("settles on idle when both hops finished while the timer was stalled", () => {
    let s = send(m, createInitialState(0), "click", 0);
    s = send(m, s, "click", 100);
    const done = advance(m, s, 100_000);
    assert.equal(done.clip, "idle");
    assert.equal(done.queued, false);
    assert.equal(done.clipStartedAt, HOP_MS + HOP_MS);
  });

  it("a click after the hop ended (before any timer ran) starts a fresh hop instead of queueing", () => {
    const hop = send(m, createInitialState(0), "click", 0);
    const s = send(m, hop, "click", HOP_MS + 50);
    assert.deepEqual(s, { clip: "hop", clipStartedAt: HOP_MS + 50, queued: false, lastHoverAt: null });
  });
});

describe("hover cooldown", () => {
  it("blocks hover reactions inside the cooldown and allows them afterwards", () => {
    let s = send(m, createInitialState(0), "hoverEnter", 0); // react, accepted at t=0
    s = advance(m, s, 600);
    assert.equal(s.clip, "idle");
    assert.equal(send(m, s, "hoverEnter", 1000).clip, "idle");
    assert.equal(send(m, s, "hoverEnter", 1499).clip, "idle");
    const again = send(m, s, "hoverEnter", 1500);
    assert.equal(again.clip, "react");
    assert.equal(again.lastHoverAt, 1500);
  });

  it("a click does not start the hover cooldown", () => {
    let s = send(m, createInitialState(0), "click", 0);
    s = advance(m, s, HOP_MS + 10);
    assert.equal(send(m, s, "hoverEnter", HOP_MS + 20).clip, "react");
  });

  it("does not block when the clock went backwards", () => {
    let s = send(m, createInitialState(0), "hoverEnter", 5000);
    s = advance(m, s, 5600);
    assert.equal(send(m, s, "hoverEnter", 100).clip, "react");
  });
});

describe("invalid input is handled safely", () => {
  const s0 = createInitialState(0);

  it("ignores unknown event names, including prototype keys", () => {
    for (const ev of ["doubleClick", "hoverLeave", "", "click ", "__proto__", "constructor", "toString", "hasOwnProperty"]) {
      assert.deepEqual(send(m, s0, ev, 10), s0, `event ${JSON.stringify(ev)}`);
    }
  });

  it("ignores non-string events", () => {
    for (const ev of [42, null, undefined, {}, []]) {
      assert.deepEqual(send(m, s0, ev as unknown as string, 10), s0);
    }
  });

  it("returns the same state for a non-finite time", () => {
    for (const t of [NaN, Infinity, -Infinity]) {
      assert.equal(send(m, s0, "click", t), s0);
      assert.equal(advance(m, s0, t), s0);
    }
  });

  it("resets a corrupted state to idle at the current time", () => {
    const bad: unknown[] = [
      { clip: "walk", clipStartedAt: 5, queued: false, lastHoverAt: null },
      { clip: "idle", clipStartedAt: NaN, queued: false, lastHoverAt: null },
      { clip: "idle", clipStartedAt: 5, queued: "yes", lastHoverAt: null },
      { clip: "idle", clipStartedAt: 5, queued: false, lastHoverAt: "x" },
      { clip: "constructor", clipStartedAt: 5, queued: false, lastHoverAt: null },
      null,
      undefined,
      42,
    ];
    for (const b of bad) {
      assert.deepEqual(advance(m, b as MachineState, 100), createInitialState(100), JSON.stringify(b));
      assert.equal(send(m, b as MachineState, "click", 100).clip, "hop");
    }
  });

  it("ignores events whose target clip is unavailable", () => {
    const noHop = { isAvailable: (c: string) => c !== "hop" };
    assert.deepEqual(send(m, s0, "click", 10, noHop), s0);
    assert.equal(send(m, s0, "hoverEnter", 10, noHop).clip, "react");
  });

  it("treats a throwing or non-boolean availability check as unavailable", () => {
    const throwing = { isAvailable: () => { throw new Error("boom"); } };
    assert.deepEqual(send(m, s0, "click", 10, throwing), s0);
    const sloppy = { isAvailable: () => undefined as unknown as boolean };
    assert.deepEqual(send(m, s0, "click", 10, sloppy), s0);
  });

  it("ignores events whose clip is missing from the manifest", () => {
    const broken = structuredClone(m) as unknown as { clips: Record<string, unknown> };
    delete broken.clips.hop;
    assert.deepEqual(send(broken as unknown as CharacterManifest, s0, "click", 10), s0);
  });

  it("falls back to idle when the current clip disappeared from the manifest", () => {
    const hop = send(m, s0, "click", 0);
    const broken = structuredClone(m) as unknown as { clips: Record<string, unknown> };
    delete broken.clips.hop;
    assert.deepEqual(advance(broken as unknown as CharacterManifest, hop, 50), createInitialState(50));
  });

  it("falls back to idle when a one-shot's next clip is missing", () => {
    const odd = structuredClone(m);
    odd.clips.react.next = "nope" as never;
    const react = send(odd, s0, "hoverEnter", 0);
    assert.equal(advance(odd, react, REACT_MS).clip, "idle");
  });
});

describe("purity", () => {
  it("never mutates its input state", () => {
    const frozen = Object.freeze(createInitialState(0));
    const hop = Object.freeze(send(m, frozen, "click", 0));
    const queued = send(m, hop, "click", 10);
    assert.notEqual(queued, hop);
    assert.equal(hop.queued, false);
    assert.equal(advance(m, hop, 1e6).clip, "idle");
    assert.equal(hop.clip, "hop");
  });
});

describe("shiftTime (pause and resume)", () => {
  it("moves the clip start and the hover timestamp by the pause length", () => {
    const s: MachineState = { clip: "react", clipStartedAt: 100, queued: false, lastHoverAt: 100 };
    assert.deepEqual(shiftTime(s, 5000), { clip: "react", clipStartedAt: 5100, queued: false, lastHoverAt: 5100 });
  });

  it("keeps a null hover timestamp and does not mutate its input", () => {
    const s = Object.freeze(createInitialState(10));
    assert.deepEqual(shiftTime(s, 40), { clip: "idle", clipStartedAt: 50, queued: false, lastHoverAt: null });
    assert.equal(s.clipStartedAt, 10);
  });

  it("ignores zero and non-finite deltas", () => {
    const s = createInitialState(10);
    for (const d of [0, NaN, Infinity, -Infinity]) assert.equal(shiftTime(s, d), s);
  });

  it("a paused hop resumes on the same frame", () => {
    const hop = send(m, createInitialState(0), "click", 1000);
    const resumed = shiftTime(hop, 60_000);
    assert.equal(advance(m, resumed, 61_000 + 100).clip, "hop");
    assert.equal(advance(m, resumed, 61_000 + HOP_MS).clip, "idle");
  });
});
