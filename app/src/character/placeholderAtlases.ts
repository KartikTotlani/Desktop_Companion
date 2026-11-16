// PLACEHOLDER atlases for the renderer spike. This is NOT Nova artwork: it draws a simple
// stand-in character with the 2D canvas API so the atlas layout, frame selection, timing and
// transparency can be exercised before final art exists. Replace with real WebP atlases later.

import type { CharacterManifest, ClipId } from "./types.ts";
import { CLIP_IDS } from "./types.ts";
import { atlasSize, frameCell } from "./framePlayer.ts";

export interface PlaceholderCanvas {
  width: number;
  height: number;
  getContext(contextId: "2d"): CanvasRenderingContext2D | null;
}

export type CreateCanvas = (width: number, height: number) => PlaceholderCanvas;

/**
 * Draw one placeholder frame in logical coordinates (220 x 240 box, feet anchor at
 * x=110, y=224). `scale` converts logical units to the atlas pixel size.
 */
export function drawPlaceholderFrame(
  ctx: CanvasRenderingContext2D,
  clip: ClipId,
  frame: number,
  frames: number,
  scale: number,
): void {
  const p = frames > 1 ? frame / (frames - 1) : 0; // 0..1 across the clip
  const loopPhase = frames > 0 ? (2 * Math.PI * frame) / frames : 0;

  let lift = 0; // upward offset in logical px
  let squash = 1; // vertical scale around the feet
  let wave = 0; // arm angle in radians
  let eyeScale = 1;
  let capeSway = 0;
  if (clip === "idle") {
    lift = 2 * Math.sin(loopPhase);
    capeSway = 6 * Math.sin(loopPhase + 1);
  } else if (clip === "hop") {
    lift = 40 * Math.sin(Math.PI * p); // returns to 0 at both ends, apex 40 px
    squash = 1 - 0.12 * Math.cos(2 * Math.PI * p) * (1 - Math.sin(Math.PI * p));
    capeSway = -10 * Math.sin(Math.PI * p);
  } else {
    wave = 0.9 * Math.sin(Math.PI * p * 3) * Math.sin(Math.PI * p);
    eyeScale = 1 + 0.35 * Math.sin(Math.PI * p);
  }

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(110, 224 - lift);
  ctx.scale(1, squash);

  // cape (behind)
  ctx.fillStyle = "#2a5bd7";
  ctx.beginPath();
  ctx.moveTo(-26, -78);
  ctx.lineTo(26, -78);
  ctx.lineTo(40 + capeSway, -8);
  ctx.lineTo(-40 + capeSway, -8);
  ctx.closePath();
  ctx.fill();

  // boots and body
  ctx.fillStyle = "#101a3a";
  ctx.fillRect(-20, -16, 16, 16);
  ctx.fillRect(4, -16, 16, 16);
  ctx.fillRect(-24, -76, 48, 62);

  // glowing chest emblem
  ctx.fillStyle = "#29c5ff";
  ctx.fillRect(-9, -62, 18, 18);

  // arms (one waves)
  ctx.strokeStyle = "#101a3a";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-24, -68);
  ctx.lineTo(-38, -40);
  ctx.moveTo(24, -68);
  ctx.lineTo(24 + 16 * Math.cos(-0.4 - wave), -68 + 28 * Math.sin(0.9 + wave));
  ctx.stroke();

  // head, hair, headphones, eyes
  ctx.fillStyle = "#f0b38a";
  ctx.beginPath();
  ctx.arc(0, -112, 38, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "#5a3a22";
  ctx.beginPath();
  ctx.arc(0, -122, 38, Math.PI, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#29c5ff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, -112, 40, Math.PI, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  for (const x of [-14, 14]) {
    ctx.beginPath();
    ctx.ellipse(x, -108, 7, 9 * eyeScale, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = "#1c3fbf";
  for (const x of [-14, 14]) {
    ctx.beginPath();
    ctx.arc(x, -107, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Build one atlas canvas per clip using the manifest's layout. A clip whose canvas or context
 * cannot be created is left out, which makes the state machine treat it as unavailable.
 */
export function createPlaceholderAtlases(
  m: CharacterManifest,
  createCanvas: CreateCanvas,
): Map<ClipId, PlaceholderCanvas> {
  const result = new Map<ClipId, PlaceholderCanvas>();
  const scale = m.frameSize.w / m.logicalSize.w;
  for (const id of CLIP_IDS) {
    const def = m.clips[id];
    const size = atlasSize(def, m.frameSize);
    const canvas = createCanvas(size.w, size.h);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    for (let f = 0; f < def.frames; f++) {
      const cell = frameCell(def, f, m.frameSize);
      ctx.save();
      ctx.translate(cell.sx, cell.sy);
      ctx.beginPath();
      ctx.rect(0, 0, cell.sw, cell.sh);
      ctx.clip();
      drawPlaceholderFrame(ctx, id, f, def.frames, scale);
      ctx.restore();
    }
    result.set(id, canvas);
  }
  return result;
}
