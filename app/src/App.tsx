import { useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const DRAG_THRESHOLD_PX = 4;

function App() {
  const [reacting, setReacting] = useState(false);
  // Tracks a left-button press that has not yet become a drag.
  const press = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    press.current = { x: e.screenX, y: e.screenY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const start = press.current;
    if (!start) return;
    const moved = Math.hypot(e.screenX - start.x, e.screenY - start.y);
    if (moved > DRAG_THRESHOLD_PX) {
      press.current = null; // it's a drag, not a click
      getCurrentWindow().startDragging().catch(console.error);
    }
  };

  const onMouseUp = () => {
    if (!press.current) return; // drag already started
    press.current = null;
    setReacting(true);
    window.setTimeout(() => setReacting(false), 600);
  };

  return (
    <main
      className="stage"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        className={`nova${reacting ? " react" : ""}`}
        aria-label="Nova placeholder"
      >
        <div className="cape" />
        <div className="body" />
        <div className="head">
          <div className="eye left" />
          <div className="eye right" />
        </div>
      </div>
    </main>
  );
}

export default App;
