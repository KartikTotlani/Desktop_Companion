import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import manifestJson from "./nova/manifest.prototype.json";
import { parseManifest } from "./manifest.ts";
import { CanvasPlayer, browserDeps } from "./canvasPlayer.ts";
import { browserImageLoader, loadAtlases } from "./atlasLoader.ts";
import { createPlaceholderAtlases } from "./placeholderAtlases.ts";

// Thin React wrapper around CanvasPlayer. It never calls window or Tauri APIs; the parent feeds it
// "click" / "hoverEnter" through the ref and (later) pause()/resume() when the window is hidden.
//
// Atlases are bundled by Vite from ./nova/atlases/*.webp. If a file is missing the clip falls back
// to the generated placeholder and a warning is logged, so the app still runs.

const parsed = parseManifest(manifestJson);
if (!parsed.ok) console.error("Invalid character manifest:", parsed.errors);

const assetUrls = import.meta.glob("./nova/atlases/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function resolveAtlasUrl(atlasPath: string): string {
  const url = assetUrls[`./nova/${atlasPath}`];
  if (!url) throw new Error(`atlas not bundled: ${atlasPath}`);
  return url;
}

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
    let cancelled = false;

    const set = loadAtlases(manifest, browserImageLoader, {
      resolveUrl: resolveAtlasUrl,
      onClipLoaded: () => player.refresh(),
    });
    const player = new CanvasPlayer(manifest, canvas, set.atlases, browserDeps(), window.devicePixelRatio);
    playerRef.current = player;
    player.start();

    // Any clip that failed to load falls back to the generated placeholder.
    void set.done.then(() => {
      if (cancelled || set.errors.length === 0) return;
      console.warn("Nova atlases failed to load; using placeholders:", set.errors);
      const placeholders = createPlaceholderAtlases(manifest, createDomCanvas);
      for (const { clip } of set.errors) {
        const fallback = placeholders.get(clip);
        if (fallback) set.atlases.set(clip, fallback);
      }
      player.refresh();
    });

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
      cancelled = true;
      query?.removeEventListener("change", onScaleChange);
      player.destroy();
      set.dispose();
      playerRef.current = null;
    };
  }, []);

  if (!parsed.ok) return null;
  const { w, h } = parsed.manifest.logicalSize;
  return <canvas ref={canvasRef} className={className} style={{ display: "block", width: w, height: h }} />;
}
