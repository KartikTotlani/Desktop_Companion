// Pointer interaction rules for the overlay window. Pure: no React, DOM or Tauri imports, so the
// rules are testable. The window stays fully draggable (preserving the existing behaviour); only
// click-to-hop and hover-to-react are restricted to the character silhouette.
//
//   press + move beyond the threshold  -> window drag (from anywhere), never a click
//   press + release without dragging   -> "click" only if both ends are on the character
//   pointer enters the character       -> "hoverEnter" once (not while a button is down)

export interface PointerPoint {
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
}

export interface PointerController {
  down(e: PointerPoint & { button: number }): void;
  move(e: PointerPoint): void;
  up(e: PointerPoint): void;
  leave(): void;
}

export interface PointerControllerOptions {
  /** Is the point (window client coordinates, CSS px) on the character? */
  hitTest(clientX: number, clientY: number): boolean;
  send(event: "click" | "hoverEnter"): void;
  startDrag(): void;
  setCursor?(cursor: "pointer" | "default"): void;
  /** Movement (screen px) beyond which a press becomes a drag. */
  dragThresholdPx?: number;
}

export function createPointerController(opts: PointerControllerOptions): PointerController {
  const threshold = opts.dragThresholdPx ?? 4;
  let press: { sx: number; sy: number; onCharacter: boolean } | null = null;
  let hovering = false;

  const setHovering = (over: boolean): void => {
    if (over === hovering) return;
    hovering = over;
    opts.setCursor?.(over ? "pointer" : "default");
    if (over) opts.send("hoverEnter");
  };

  return {
    down(e) {
      if (e.button !== 0) return;
      press = { sx: e.screenX, sy: e.screenY, onCharacter: opts.hitTest(e.clientX, e.clientY) };
    },

    move(e) {
      if (press) {
        const moved = Math.hypot(e.screenX - press.sx, e.screenY - press.sy);
        if (moved > threshold) {
          press = null; // a drag, not a click
          // Assume the pointer stays over the character while dragging so that dropping the
          // window does not immediately trigger a hover reaction.
          hovering = true;
          opts.startDrag();
        }
        return;
      }
      setHovering(opts.hitTest(e.clientX, e.clientY));
    },

    up(e) {
      const current = press;
      press = null;
      if (!current) return; // a drag already started, or no press
      if (current.onCharacter && opts.hitTest(e.clientX, e.clientY)) opts.send("click");
    },

    leave() {
      setHovering(false);
    },
  };
}
