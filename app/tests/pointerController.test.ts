// Tests for the overlay pointer rules (drag anywhere; click and hover only on the character).
//   node --experimental-strip-types --test tests/pointerController.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPointerController } from "../src/pointerController.ts";

// A character occupying x 50..150, y 40..200 of a 220 x 240 window; everything else is transparent.
const onCharacter = (x: number, y: number) => x >= 50 && x < 150 && y >= 40 && y < 200;

function setup() {
  const events: string[] = [];
  const cursors: string[] = [];
  let drags = 0;
  const c = createPointerController({
    hitTest: onCharacter,
    send: (e) => events.push(e),
    startDrag: () => { drags++; },
    setCursor: (cur) => cursors.push(cur),
  });
  // Client and screen coordinates differ by a constant window offset.
  const pt = (x: number, y: number) => ({ clientX: x, clientY: y, screenX: x + 500, screenY: y + 300 });
  return { c, events, cursors, drags: () => drags, pt };
}

describe("click", () => {
  it("clicking the character sends click once", () => {
    const { c, events, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.up(pt(100, 100));
    assert.deepEqual(events, ["click"]);
  });

  it("clicking transparent corners does nothing", () => {
    const { c, events, drags, pt } = setup();
    for (const [x, y] of [[2, 2], [218, 2], [2, 238], [218, 238], [10, 120], [100, 230]]) {
      c.down({ ...pt(x, y), button: 0 });
      c.up(pt(x, y));
    }
    assert.deepEqual(events, []);
    assert.equal(drags(), 0);
  });

  it("needs both the press and the release on the character", () => {
    const { c, events, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.up(pt(102, 100 + 120)); // released over transparent space, within drag distance? no: far, but no moves reported
    c.down({ ...pt(5, 5), button: 0 });
    c.up(pt(100, 100));
    assert.deepEqual(events, []);
  });

  it("a tiny jitter within the threshold is still a click; exactly the threshold is too", () => {
    const { c, events, drags, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.move(pt(103, 104)); // distance 5 > 4 would drag; use 3,0 style below
    c.up(pt(103, 104));
    assert.equal(drags(), 1, "5 px movement is a drag");
    assert.deepEqual(events, []);

    const t = setup();
    t.c.down({ ...t.pt(100, 100), button: 0 });
    t.c.move(t.pt(104, 100)); // exactly 4 px
    t.c.up(t.pt(104, 100));
    assert.equal(t.drags(), 0);
    assert.deepEqual(t.events, ["click"]);
  });

  it("ignores non-left buttons", () => {
    const { c, events, drags, pt } = setup();
    c.down({ ...pt(100, 100), button: 2 });
    c.move(pt(160, 100));
    c.up(pt(160, 100));
    assert.deepEqual(events, []);
    assert.equal(drags(), 0);
  });
});

describe("drag", () => {
  it("dragging the character starts one window drag and never sends click", () => {
    const { c, events, drags, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.move(pt(110, 100));
    c.move(pt(130, 100));
    c.up(pt(130, 100));
    assert.equal(drags(), 1);
    assert.deepEqual(events, []);
  });

  it("the window can still be dragged from a transparent area", () => {
    const { c, events, drags, pt } = setup();
    c.down({ ...pt(5, 5), button: 0 });
    c.move(pt(40, 5));
    assert.equal(drags(), 1);
    assert.deepEqual(events, []);
  });

  it("moves after a drag has started do not start another drag", () => {
    const { c, drags, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.move(pt(120, 100));
    c.move(pt(140, 100));
    c.move(pt(160, 100));
    assert.equal(drags(), 1);
  });
});

describe("hover", () => {
  it("sends hoverEnter once when the pointer enters the character", () => {
    const { c, events, pt } = setup();
    c.move(pt(5, 5));
    c.move(pt(30, 100));
    assert.deepEqual(events, []);
    c.move(pt(60, 100));
    c.move(pt(100, 120));
    c.move(pt(140, 150));
    assert.deepEqual(events, ["hoverEnter"]);
  });

  it("sends hoverEnter again after the pointer left and re-entered", () => {
    const { c, events, pt } = setup();
    c.move(pt(100, 100));
    c.move(pt(10, 100));
    c.move(pt(100, 100));
    assert.deepEqual(events, ["hoverEnter", "hoverEnter"]);
  });

  it("switches the cursor only on transitions", () => {
    const { c, cursors, pt } = setup();
    c.move(pt(100, 100));
    c.move(pt(101, 100));
    c.move(pt(102, 100));
    c.move(pt(5, 5));
    c.move(pt(6, 5));
    assert.deepEqual(cursors, ["pointer", "default"]);
  });

  it("does not trigger hover while a button is held", () => {
    const { c, events, pt } = setup();
    c.down({ ...pt(5, 5), button: 0 });
    c.move(pt(8, 5)); // within threshold, over transparent area
    c.move(pt(60, 100)); // would enter the character, but the button is down (this is a drag)
    assert.deepEqual(events, []);
  });

  it("does not react right after a drag is dropped on the character", () => {
    const { c, events, pt } = setup();
    c.down({ ...pt(100, 100), button: 0 });
    c.move(pt(120, 100)); // drag starts
    c.up(pt(120, 100));
    c.move(pt(121, 100)); // pointer events resume over the character
    assert.deepEqual(events, []);
    c.move(pt(5, 5));
    c.move(pt(100, 100));
    assert.deepEqual(events, ["hoverEnter"], "reacts again after leaving and re-entering");
  });

  it("leave() resets hover so the next entry reacts", () => {
    const { c, events, cursors, pt } = setup();
    c.move(pt(100, 100));
    c.leave();
    c.move(pt(100, 100));
    assert.deepEqual(events, ["hoverEnter", "hoverEnter"]);
    assert.deepEqual(cursors, ["pointer", "default", "pointer"]);
  });
});
