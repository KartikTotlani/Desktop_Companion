import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import manifestJson from "./nova/manifest.prototype.json";
import { parseManifest } from "./manifest.ts";
import { CanvasPlayer, browserDeps } from "./canvasPlayer.ts";
import { browserImageLoader, loadAtlases } from "./atlasLoader.ts";
import { createPlaceholderAtlases } from "./placeholderAtlases.ts";
import { frameCell } from "./framePlayer.ts";
import { buildHitMask, decodeHitMask, isHit } from "./hitMask.ts";
import type { HitMask, PixelFrame } from "./hitMask.ts";
import type { CharacterManifest, ClipId } from "./types.ts";

// Thin React wrapper around CanvasPlayer. It never calls window or Tauri APIs; the parent feeds it
// "click" / "hoverEnter" through the ref and (later) pause()/resume() when the window is hidden.
//
// Atlases are bundled by Vite from ./nova/atlases/*.webp. If a file is missing the clip falls back
// to the generated placeholder and a warning is logged, so the app still runs.
//
// Hit testing: a coarse silhouette mask is built once from the standing poses (idle + react) of
// the loaded atlases, or decoded from a precomputed manifest `hit` field. It is queried in
// logical (CSS) pixels, so it is independent of display scaling.

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
  /** Is the point (window client coordinates, CSS px) on the character silhouette? */
  hitTest(clientX: number, clientY: number): boolean;
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

/** Read the pixels of every idle and react frame (one frame at a time, transient memory only). */
function readStandingFrames(m: CharacterManifest, atlases: ReadonlyMap<ClipId, unknown>): PixelFrame[] {
  const { w, h } = m.frameSize;
  const scratch = createDomCanvas(w, h);
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  const frames: PixelFrame[] = [];
  if (!ctx) return frames;
  for (const id of ["idle", "react"] as const) {
    const atlas = atlases.get(id);
    if (!atlas) continue;
    const def = m.clips[id];
    for (let f = 0; f < def.frames; f++) {
      const c = frameCell(def, f, m.frameSize);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(atlas as CanvasImageSource, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
      frames.push(ctx.getImageData(0, 0, w, h));
    }
  }
  return frames;
}

export function NovaSprite({ ref, className }: NovaSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<CanvasPlayer | null>(null);
  const maskRef = useRef<HitMask | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      send: (event: string) => playerRef.current?.send(event),
      hitTest: (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !parsed.ok) return false;
        const rect = canvas.getBoundingClientRect();
        return isHit(maskRef.current, clientX - rect.left, clientY - rect.top, parsed.manifest.logicalSize);
      },
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

    const precomputed = decodeHitMask(manifest.hit);
    maskRef.current = precomputed;
    const rebuildMask = () => {
      if (cancelled || precomputed) return;
      maskRef.current = buildHitMask(readStandingFrames(manifest, set.atlases));
    };

    const set = loadAtlases(manifest, browserImageLoader, {
      resolveUrl: resolveAtlasUrl,
      onClipLoaded: (clip) => {
        if (clip === "idle" || clip === "react") rebuildMask();
        player.refresh();
      },
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
      rebuildMask();
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
      maskRef.current = null;
    };
  }, []);

  if (!parsed.ok) return null;
  const { w, h } = parsed.manifest.logicalSize;
  return <canvas ref={canvasRef} className={className} style={{ display: "block", width: w, height: h }} />;
}
