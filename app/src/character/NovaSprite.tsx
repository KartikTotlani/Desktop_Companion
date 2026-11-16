import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import manifestJson from "./nova/manifest.json";
import { parseManifest } from "./manifest.ts";
import { CanvasPlayer, browserDeps } from "./canvasPlayer.ts";
import { createPlaceholderAtlases } from "./placeholderAtlases.ts";

// Thin React wrapper around CanvasPlayer. It is NOT used by App.tsx yet (renderer spike).
// It never calls window or Tauri APIs; hide/show is reported by the parent via pause()/resume().

const parsed = parseManifest(manifestJson);
if (!parsed.ok) console.error("Invalid character manifest:", parsed.errors);

export interface NovaSpriteHandle {
  /** Send "click" or "hoverEnter". Unknown events are ignored. */
  send(event: string): void;
  pause(): void;
  resume(): void;
}

export interface NovaSpriteProps {
  ref?: Ref<NovaSpriteHandle>;
  className?: string;
}

function createDomCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function NovaSprite({ ref, className }: NovaSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<CanvasPlayer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      send: (event: string) => playerRef.current?.send(event),
      pause: () => playerRef.current?.pause(),
      resume: () => playerRef.current?.resume(),
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !parsed.ok) return;
    const manifest = parsed.manifest;
    const atlases = createPlaceholderAtlases(manifest, createDomCanvas);
    const player = new CanvasPlayer(manifest, canvas, atlases, browserDeps(), window.devicePixelRatio);
    playerRef.current = player;
    player.start();

    // Re-apply the scale when the display scale changes.
    let query: MediaQueryList | null = null;
    const onScaleChange = () => {
      player.setPixelRatio(window.devicePixelRatio);
      bind();
    };
    const bind = () => {
      query?.removeEventListener("change", onScaleChange);
      query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      query.addEventListener("change", onScaleChange);
    };
    bind();

    return () => {
      query?.removeEventListener("change", onScaleChange);
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  if (!parsed.ok) return null;
  const { w, h } = parsed.manifest.logicalSize;
  return <canvas ref={canvasRef} className={className} style={{ display: "block", width: w, height: h }} />;
}
