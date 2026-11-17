// Tests for the hidden-state pause mapping.
//   node --experimental-strip-types --test tests/visibility.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyVisibility, VISIBILITY_EVENT } from "../src/visibility.ts";

function fake() {
  const calls: string[] = [];
  return { calls, target: { pause: () => calls.push("pause"), resume: () => calls.push("resume") } };
}

describe("applyVisibility", () => {
  it("pauses when hidden and resumes when shown", () => {
    const { calls, target } = fake();
    applyVisibility(target, false);
    applyVisibility(target, true);
    assert.deepEqual(calls, ["pause", "resume"]);
  });

  it("ignores payloads that are not a boolean", () => {
    const { calls, target } = fake();
    for (const p of [undefined, null, 0, 1, "true", "false", {}, []]) applyVisibility(target, p);
    assert.deepEqual(calls, []);
  });

  it("does nothing without a target", () => {
    assert.doesNotThrow(() => applyVisibility(null, false));
    assert.doesNotThrow(() => applyVisibility(undefined, true));
  });

  it("uses the event name emitted by the Rust side", () => {
    assert.equal(VISIBILITY_EVENT, "nova-visibility");
  });
});
