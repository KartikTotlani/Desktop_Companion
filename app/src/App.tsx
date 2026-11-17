import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { NovaSprite } from "./character/NovaSprite";
import type { NovaSpriteHandle } from "./character/NovaSprite";
import { createPointerController } from "./pointerController";
import type { PointerController } from "./pointerController";
import { VISIBILITY_EVENT, applyVisibility } from "./visibility";

function App() {
  const sprite = useRef<NovaSpriteHandle>(null);
  const stage = useRef<HTMLElement>(null);
  const controller = useRef<PointerController | null>(null);

  // Drag, click and hover rules live in pointerController (pure, tested). The window stays
  // draggable from anywhere; click-to-hop and hover-to-react only count on Nova's silhouette.
  if (!controller.current) {
    controller.current = createPointerController({
      hitTest: (x, y) => sprite.current?.hitTest(x, y) ?? false,
      send: (event) => sprite.current?.send(event),
      startDrag: () => {
        getCurrentWindow().startDragging().catch(console.error);
      },
      setCursor: (cursor) => {
        if (stage.current) stage.current.style.cursor = cursor;
      },
    });
  }
  const pointer = controller.current;

  // Rust tells us when the tray or a second launch hides/shows the window; pause while hidden.
  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | null = null;
    listen<boolean>(VISIBILITY_EVENT, (e) => applyVisibility(sprite.current, e.payload))
      .then((fn) => {
        if (cancelled) fn();
        else unlisten = fn;
      })
      .catch(console.error);
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return (
    <main
      ref={stage}
      className="stage"
      onMouseDown={(e) => pointer.down(e)}
      onMouseMove={(e) => pointer.move(e)}
      onMouseUp={(e) => pointer.up(e)}
      onMouseLeave={() => pointer.leave()}
    >
      <NovaSprite ref={sprite} />
    </main>
  );
}

export default App;
