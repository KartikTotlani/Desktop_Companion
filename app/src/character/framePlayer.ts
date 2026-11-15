// Pure frame selection and timing for the character player.
// No React, DOM, canvas, timers or Tauri imports: given the manifest, the state machine
// state and the current time, it returns which atlas cell to draw and how long until the
// next visible change. A later canvas wrapper only has to draw the cell and call
// setTimeout(wakeInMs).

import type { CharacterManifest, ClipDef, ClipId, MachineState, Size } from "./types.ts";
import { advance, createInitialState } from "./stateMachine.ts";

/** Tolerance so exact frame boundaries are not missed through floating-point error. */
const EPS = 1e-9;
/** Never ask the caller to wake sooner than this (avoids zero-delay spinning). */
const MIN_WAKE_MS = 1;

/** Source rectangle inside a clip's atlas, in atlas pixels. */
export interface FrameCell {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface FrameView {
  /** State after applying elapsed time (store this as the new machine state). */
  state: MachineState;
  clip: ClipId;
  frame: number;
  cell: FrameCell;
  /** Milliseconds until the visible frame or clip changes next (at least 1). */
  wakeInMs: number;
}

interface Position {
  frame: number;
  wakeInMs: number;
}

function totalMs(def: ClipDef): number {
  if (def.durations && def.durations.length === def.frames) {
    return def.durations.reduce((sum, d) => sum + d, 0);
  }
  return (def.frames * 1000) / def.fps;
}

function positionAt(def: ClipDef, elapsedMs: number): Position {
  const total = totalMs(def);
  let e = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;

  if (def.loop) {
    e = e % total;
  } else if (e >= total) {
    // Past the end of a one-shot: hold the last frame; the state machine moves on.
    return { frame: def.frames - 1, wakeInMs: MIN_WAKE_MS };
  }

  if (def.durations && def.durations.length === def.frames) {
    let edge = 0;
    for (let i = 0; i < def.frames; i++) {
      edge += def.durations[i];
      if (e < edge - EPS) return { frame: i, wakeInMs: Math.max(MIN_WAKE_MS, edge - e) };
    }
    return { frame: def.frames - 1, wakeInMs: Math.max(MIN_WAKE_MS, total - e) };
  }

  const frameMs = 1000 / def.fps;
  const frame = Math.min(def.frames - 1, Math.floor(e / frameMs + EPS));
  return { frame, wakeInMs: Math.max(MIN_WAKE_MS, (frame + 1) * frameMs - e) };
}

/** Frame index shown `elapsedMs` after a clip started. Loops wrap; one-shots hold the last frame. */
export function frameIndexAt(def: ClipDef, elapsedMs: number): number {
  return positionAt(def, elapsedMs).frame;
}

/** Atlas rectangle for a frame (grid layout: row-major, `columns` per row, no gutter). */
export function frameCell(def: ClipDef, frame: number, frameSize: Size): FrameCell {
  const f = Number.isFinite(frame) ? Math.min(Math.max(Math.trunc(frame), 0), def.frames - 1) : 0;
  const col = f % def.columns;
  const row = Math.floor(f / def.columns);
  return { sx: col * frameSize.w, sy: row * frameSize.h, sw: frameSize.w, sh: frameSize.h };
}

/** Pixel size of a clip's atlas image for the given frame size. */
export function atlasSize(def: ClipDef, frameSize: Size): Size {
  const rows = Math.ceil(def.frames / def.columns);
  return { w: def.columns * frameSize.w, h: rows * frameSize.h };
}

/**
 * Canvas backing-store size: logical size x devicePixelRatio, never larger than the
 * shipped frame (no upscaling). An invalid ratio is treated as 1.
 */
export function backingSize(logical: Size, devicePixelRatio: number, frame: Size): Size {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return {
    w: Math.min(frame.w, Math.max(1, Math.round(logical.w * dpr))),
    h: Math.min(frame.h, Math.max(1, Math.round(logical.h * dpr))),
  };
}

/**
 * One call for the player: advance the state machine to `now`, then describe what to draw
 * and when to wake next. Never throws; a corrupted state is replaced by idle.
 */
export function describeFrame(m: CharacterManifest, state: MachineState, now: number): FrameView {
  const adv = advance(m, state, now);
  const usable =
    typeof adv === "object" &&
    adv !== null &&
    Object.prototype.hasOwnProperty.call(m.clips, adv.clip) &&
    Number.isFinite(adv.clipStartedAt);
  const s = usable ? adv : createInitialState(Number.isFinite(now) ? now : 0);
  const def = m.clips[s.clip];
  const { frame, wakeInMs } = positionAt(def, now - s.clipStartedAt);
  return { state: s, clip: s.clip, frame, cell: frameCell(def, frame, m.frameSize), wakeInMs };
}
