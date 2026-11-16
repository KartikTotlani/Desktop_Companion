// Pure animation state machine for the character.
// No React, DOM, canvas, timers or Tauri imports. Time is always passed in (ms),
// so behaviour is deterministic and testable. All functions are immutable:
// they return a new state (or the same state when nothing changes) and never throw
// on bad input.
//
// Rules (first release: idle, hop, react):
//   click      -> hop
//   hoverEnter -> react (subject to a cooldown)
//   hop and react are one-shots that return to idle; idle loops forever.
//   Priorities idle < react < hop. A looping clip is interrupted by any higher
//   priority clip; a one-shot only by clips in its `interruptibleBy` list.
//   A repeat of the playing clip is ignored, or queued once when `retrigger: "queue"`.

import type { CharacterManifest, ClipDef, ClipId, InteractionEvent, MachineState } from "./types.ts";
import { CLIP_IDS } from "./types.ts";

/** Safety bound for chained transitions in a single advance call. */
const MAX_CHAIN = 8;

export interface SendOptions {
  /** Return false for clips whose assets are not loaded; their events are ignored. */
  isAvailable?: (clip: ClipId) => boolean;
}

const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

const isClipId = (v: unknown): v is ClipId =>
  typeof v === "string" && (CLIP_IDS as readonly string[]).includes(v);

/** Initial state: idle starting at `now` (0 if `now` is not a finite number). */
export function createInitialState(now: number): MachineState {
  return {
    clip: "idle",
    clipStartedAt: Number.isFinite(now) ? now : 0,
    queued: false,
    lastHoverAt: null,
  };
}

/** Total duration of one play-through of a clip, in ms. */
export function clipDurationMs(def: ClipDef): number {
  if (def.durations && def.durations.length > 0) {
    return def.durations.reduce((sum, d) => sum + d, 0);
  }
  return (def.frames * 1000) / def.fps;
}

/** Return a valid state; reset to idle at `now` when the given state is corrupted. */
function normalize(m: CharacterManifest, state: MachineState, now: number): MachineState {
  const s = state as unknown;
  const valid =
    typeof s === "object" &&
    s !== null &&
    isClipId((s as MachineState).clip) &&
    has(m.clips, (s as MachineState).clip) &&
    Number.isFinite((s as MachineState).clipStartedAt) &&
    typeof (s as MachineState).queued === "boolean" &&
    ((s as MachineState).lastHoverAt === null || Number.isFinite((s as MachineState).lastHoverAt));
  return valid ? state : createInitialState(now);
}

/**
 * Apply time passing: finished one-shots follow `next` (or repeat once when queued).
 * Looping clips never end. Non-finite `now` leaves the state unchanged.
 */
export function advance(m: CharacterManifest, state: MachineState, now: number): MachineState {
  if (!Number.isFinite(now)) return state;
  let s = normalize(m, state, now);
  for (let i = 0; i < MAX_CHAIN; i++) {
    const def = m.clips[s.clip];
    if (def.loop) return s;
    const end = s.clipStartedAt + clipDurationMs(def);
    if (now < end) return s;
    if (s.queued) {
      s = { ...s, clipStartedAt: end, queued: false };
    } else {
      const next: ClipId = def.next !== undefined && has(m.clips, def.next) ? def.next : "idle";
      s = { ...s, clip: next, clipStartedAt: end, queued: false };
    }
  }
  return s;
}

/**
 * Shift all stored timestamps by `deltaMs` so a paused animation resumes on the same
 * frame (call with the length of the pause). Non-finite or zero deltas change nothing.
 */
export function shiftTime(state: MachineState, deltaMs: number): MachineState {
  if (!Number.isFinite(deltaMs) || deltaMs === 0) return state;
  return {
    ...state,
    clipStartedAt: state.clipStartedAt + deltaMs,
    lastHoverAt: state.lastHoverAt === null ? null : state.lastHoverAt + deltaMs,
  };
}

function available(opts: SendOptions, clip: ClipId): boolean {
  if (!opts.isAvailable) return true;
  try {
    return opts.isAvailable(clip) === true;
  } catch {
    return false;
  }
}

/**
 * Handle an interaction event at time `now`. Unknown events, non-finite times,
 * missing or unavailable target clips, cooldown hits and disallowed interruptions
 * all leave the (time-advanced) state unchanged.
 */
export function send(
  m: CharacterManifest,
  state: MachineState,
  event: string,
  now: number,
  opts: SendOptions = {},
): MachineState {
  if (!Number.isFinite(now)) return state;
  const s = advance(m, state, now);

  if (typeof event !== "string" || !has(m.events, event)) return s;
  const target = m.events[event as InteractionEvent];
  if (!isClipId(target) || !has(m.clips, target)) return s;
  if (!available(opts, target)) return s;

  // Hover cooldown. A clock that went backwards does not block the event.
  if (event === "hoverEnter" && s.lastHoverAt !== null) {
    const since = now - s.lastHoverAt;
    if (since >= 0 && since < m.hoverCooldownMs) return s;
  }

  const current = m.clips[s.clip];
  const wanted = m.clips[target];

  if (target === s.clip) {
    if (current.retrigger === "queue" && !s.queued) return { ...s, queued: true };
    return s;
  }

  const higher = wanted.priority > current.priority;
  const allowed = current.loop
    ? higher
    : higher && (current.interruptibleBy ?? []).includes(target);
  if (!allowed) return s;

  return {
    clip: target,
    clipStartedAt: now,
    queued: false,
    lastHoverAt: event === "hoverEnter" ? now : s.lastHoverAt,
  };
}
