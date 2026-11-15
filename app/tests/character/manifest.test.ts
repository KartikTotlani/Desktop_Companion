// Tests for the manifest validator. Run with Node's built-in runner (no new dependencies):
//   node --experimental-strip-types --test tests/character/manifest.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest, REQUIRED_EVENT_MAP, DEFAULT_HOVER_COOLDOWN_MS } from "../../src/character/manifest.ts";

const raw = (): Record<string, any> =>
  JSON.parse(
    readFileSync(new URL("../../src/character/nova/manifest.json", import.meta.url), "utf8"),
  );

function errorsFor(mutate: (m: Record<string, any>) => void): string[] {
  const m = raw();
  mutate(m);
  const r = parseManifest(m);
  assert.equal(r.ok, false, "expected the manifest to be rejected");
  return r.ok ? [] : r.errors;
}

describe("shipped manifest", () => {
  it("is valid and defines exactly idle, hop and react", () => {
    const r = parseManifest(raw());
    assert.equal(r.ok, true, r.ok ? "" : r.errors.join("; "));
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.manifest.clips).sort(), ["hop", "idle", "react"]);
  });

  it("idle loops; hop and react are one-shots that return to idle", () => {
    const r = parseManifest(raw());
    assert.ok(r.ok);
    if (!r.ok) return;
    const { idle, hop, react } = r.manifest.clips;
    assert.equal(idle.loop, true);
    assert.equal(hop.loop, false);
    assert.equal(react.loop, false);
    assert.equal(hop.next, "idle");
    assert.equal(react.next, "idle");
    assert.ok(idle.priority < react.priority && react.priority < hop.priority);
  });

  it("enforces click -> hop and hoverEnter -> react", () => {
    assert.deepEqual(REQUIRED_EVENT_MAP, { click: "hop", hoverEnter: "react" });
    const r = parseManifest(raw());
    assert.ok(r.ok);
    if (r.ok) assert.deepEqual(r.manifest.events, { click: "hop", hoverEnter: "react" });
  });
});

describe("manifest rejection", () => {
  it("never throws on junk input", () => {
    for (const junk of [undefined, null, 42, "x", true, [], {}, () => 1, NaN]) {
      const r = parseManifest(junk);
      assert.equal(r.ok, false);
      if (!r.ok) assert.ok(r.errors.length > 0);
    }
  });

  it("rejects a wrong schema version", () => {
    assert.ok(errorsFor((m) => { m.schema = 2; }).some((e) => e.includes("schema")));
  });

  it("rejects missing clips", () => {
    for (const id of ["idle", "hop", "react"]) {
      const errs = errorsFor((m) => { delete m.clips[id]; });
      assert.ok(errs.some((e) => e.includes(`clips.${id} is required`)), errs.join("; "));
    }
  });

  it("rejects a non-object clips field", () => {
    assert.ok(errorsFor((m) => { m.clips = []; }).some((e) => e.includes("clips")));
  });

  it("rejects one-shots that loop or do not return to idle", () => {
    assert.ok(errorsFor((m) => { m.clips.hop.loop = true; }).some((e) => e.includes("one-shot")));
    assert.ok(errorsFor((m) => { m.clips.react.next = "hop"; }).some((e) => e.includes('next must be "idle"')));
    assert.ok(errorsFor((m) => { delete m.clips.hop.next; }).some((e) => e.includes('next must be "idle"')));
  });

  it("rejects an idle that does not loop", () => {
    assert.ok(errorsFor((m) => { m.clips.idle.loop = false; }).some((e) => e.includes("idle must loop")));
  });

  it("rejects bad numeric fields", () => {
    for (const bad of [0, -1, NaN, Infinity, "12", null]) {
      assert.ok(errorsFor((m) => { m.clips.idle.fps = bad; }).some((e) => e.includes("fps")));
    }
    for (const bad of [0, 1.5, "4"]) {
      assert.ok(errorsFor((m) => { m.clips.idle.frames = bad; }).some((e) => e.includes("frames")));
    }
    assert.ok(errorsFor((m) => { m.clips.idle.columns = 0; }).some((e) => e.includes("columns")));
    assert.ok(errorsFor((m) => { m.clips.hop.priority = -1; }).some((e) => e.includes("priority")));
  });

  it("rejects bad per-frame durations", () => {
    assert.ok(errorsFor((m) => { m.clips.hop.durations = [100, 100]; }).some((e) => e.includes("durations")));
    assert.ok(errorsFor((m) => { m.clips.react.durations = [1, 1, 1, 1, 1, 0]; }).some((e) => e.includes("durations")));
  });

  it("rejects an empty atlas path and unknown clip references", () => {
    assert.ok(errorsFor((m) => { m.clips.hop.atlas = " "; }).some((e) => e.includes("atlas")));
    assert.ok(errorsFor((m) => { m.clips.react.interruptibleBy = ["walk"]; }).some((e) => e.includes("interruptibleBy")));
    assert.ok(errorsFor((m) => { m.clips.hop.retrigger = "replay"; }).some((e) => e.includes("retrigger")));
  });

  it("rejects wrong priority ordering", () => {
    assert.ok(errorsFor((m) => { m.clips.react.priority = 0; }).some((e) => e.includes("react.priority")));
    assert.ok(errorsFor((m) => { m.clips.hop.priority = 1; }).some((e) => e.includes("hop.priority")));
  });

  it("rejects any change to the enforced interaction mapping", () => {
    assert.ok(errorsFor((m) => { m.events.click = "react"; }).some((e) => e.includes("events.click")));
    assert.ok(errorsFor((m) => { m.events.hoverEnter = "hop"; }).some((e) => e.includes("events.hoverEnter")));
    assert.ok(errorsFor((m) => { delete m.events.click; }).some((e) => e.includes("events.click")));
    assert.ok(errorsFor((m) => { m.events = null; }).some((e) => e.includes("events.")));
  });

  it("rejects bad sizes, anchor and cooldown", () => {
    assert.ok(errorsFor((m) => { m.logicalSize = { w: 0, h: 240 }; }).some((e) => e.includes("logicalSize")));
    assert.ok(errorsFor((m) => { m.frameSize = { w: 330 }; }).some((e) => e.includes("frameSize")));
    assert.ok(errorsFor((m) => { m.anchor = { x: -1, y: 2 }; }).some((e) => e.includes("anchor")));
    assert.ok(errorsFor((m) => { m.hoverCooldownMs = -5; }).some((e) => e.includes("hoverCooldownMs")));
  });

  it("rejects an invalid hit mask", () => {
    assert.ok(errorsFor((m) => { m.hit = { w: 83, h: 90, alphaThreshold: 300, dilate: 2, data: "AA==" }; }).some((e) => e.includes("hit")));
    assert.ok(errorsFor((m) => { m.hit = "mask"; }).some((e) => e.includes("hit")));
  });

  it("reports every problem at once", () => {
    const errs = errorsFor((m) => { m.schema = 9; m.clips.hop.fps = 0; m.events.click = "react"; });
    assert.ok(errs.length >= 3, errs.join("; "));
  });
});

describe("manifest normalisation", () => {
  it("applies the default hover cooldown when omitted", () => {
    const m = raw();
    delete m.hoverCooldownMs;
    const r = parseManifest(m);
    assert.ok(r.ok);
    if (r.ok) assert.equal(r.manifest.hoverCooldownMs, DEFAULT_HOVER_COOLDOWN_MS);
  });

  it("ignores unknown clip ids and unknown events instead of failing", () => {
    const m = raw();
    m.clips.walk = { atlas: "atlases/walk.webp" };
    m.events.doubleClick = "walk";
    const r = parseManifest(m);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal("walk" in r.manifest.clips, false);
    assert.equal("doubleClick" in r.manifest.events, false);
  });

  it("accepts a valid hit mask and per-frame durations", () => {
    const m = raw();
    m.hit = { w: 83, h: 90, alphaThreshold: 96, dilate: 2, data: "AAAA" };
    m.clips.react.durations = [80, 80, 80, 80, 80, 80];
    const r = parseManifest(m);
    assert.ok(r.ok, r.ok ? "" : r.errors.join("; "));
    if (r.ok) {
      assert.deepEqual(r.manifest.hit, m.hit);
      assert.deepEqual(r.manifest.clips.react.durations, [80, 80, 80, 80, 80, 80]);
    }
  });

  it("returns a copy: later changes to the input do not affect the result", () => {
    const m = raw();
    const r = parseManifest(m);
    assert.ok(r.ok);
    if (!r.ok) return;
    m.clips.hop.fps = 1;
    m.logicalSize.w = 1;
    assert.equal(r.manifest.clips.hop.fps, 15);
    assert.equal(r.manifest.logicalSize.w, 220);
  });
});
