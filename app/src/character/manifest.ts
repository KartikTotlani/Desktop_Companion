// Manifest validation. Pure: no DOM, React, canvas or Tauri imports.
// `parseManifest` never throws; invalid input yields a list of readable errors.

import type {
  CharacterManifest,
  ClipDef,
  ClipId,
  HitMaskDef,
  InteractionEvent,
  Point,
  Size,
} from "./types.ts";
import { CLIP_IDS, INTERACTION_EVENTS } from "./types.ts";

/** The enforced interaction mapping: click -> hop, hover-enter -> react. */
export const REQUIRED_EVENT_MAP: Readonly<Record<InteractionEvent, ClipId>> = {
  click: "hop",
  hoverEnter: "react",
};

export const DEFAULT_HOVER_COOLDOWN_MS = 1500;

export type ManifestResult =
  | { ok: true; manifest: CharacterManifest }
  | { ok: false; errors: string[] };

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isFiniteNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isPosNum = (v: unknown): v is number => isFiniteNum(v) && v > 0;
const isPosInt = (v: unknown): v is number => isPosNum(v) && Number.isInteger(v);
const isNonNegInt = (v: unknown): v is number =>
  isFiniteNum(v) && Number.isInteger(v) && v >= 0;
const isClipId = (v: unknown): v is ClipId =>
  typeof v === "string" && (CLIP_IDS as readonly string[]).includes(v);

function parseSize(raw: unknown, path: string, errors: string[]): Size | null {
  if (!isRec(raw) || !isPosInt(raw.w) || !isPosInt(raw.h)) {
    errors.push(`${path} must be an object with positive integer w and h`);
    return null;
  }
  return { w: raw.w, h: raw.h };
}

function parsePoint(raw: unknown, path: string, errors: string[]): Point | null {
  if (!isRec(raw) || !isFiniteNum(raw.x) || !isFiniteNum(raw.y) || raw.x < 0 || raw.y < 0) {
    errors.push(`${path} must be an object with non-negative numbers x and y`);
    return null;
  }
  return { x: raw.x, y: raw.y };
}

function parseHit(raw: unknown, errors: string[]): HitMaskDef | null {
  const ok =
    isRec(raw) &&
    isPosInt(raw.w) &&
    isPosInt(raw.h) &&
    isNonNegInt(raw.alphaThreshold) &&
    raw.alphaThreshold <= 255 &&
    isNonNegInt(raw.dilate) &&
    typeof raw.data === "string";
  if (!ok) {
    errors.push(
      "hit must have positive integer w and h, alphaThreshold 0-255, non-negative integer dilate and string data",
    );
    return null;
  }
  const r = raw as Rec;
  return {
    w: r.w as number,
    h: r.h as number,
    alphaThreshold: r.alphaThreshold as number,
    dilate: r.dilate as number,
    data: r.data as string,
  };
}

function parseClip(raw: unknown, id: ClipId, errors: string[]): ClipDef | null {
  const path = `clips.${id}`;
  if (!isRec(raw)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  const before = errors.length;

  if (typeof raw.atlas !== "string" || raw.atlas.trim() === "") {
    errors.push(`${path}.atlas must be a non-empty string`);
  }
  if (!isPosInt(raw.columns)) errors.push(`${path}.columns must be a positive integer`);
  if (!isPosInt(raw.frames)) errors.push(`${path}.frames must be a positive integer`);
  if (!isPosNum(raw.fps)) errors.push(`${path}.fps must be a positive number`);
  if (typeof raw.loop !== "boolean") errors.push(`${path}.loop must be a boolean`);
  if (!isNonNegInt(raw.priority)) errors.push(`${path}.priority must be a non-negative integer`);

  let durations: number[] | undefined;
  if (raw.durations !== undefined) {
    if (
      !Array.isArray(raw.durations) ||
      raw.durations.length !== raw.frames ||
      !raw.durations.every(isPosNum)
    ) {
      errors.push(`${path}.durations must be positive numbers, one per frame`);
    } else {
      durations = (raw.durations as number[]).slice();
    }
  }
  if (raw.next !== undefined && !isClipId(raw.next)) {
    errors.push(`${path}.next must be a known clip id`);
  }
  if (raw.retrigger !== undefined && raw.retrigger !== "ignore" && raw.retrigger !== "queue") {
    errors.push(`${path}.retrigger must be "ignore" or "queue"`);
  }
  let interruptibleBy: ClipId[] | undefined;
  if (raw.interruptibleBy !== undefined) {
    if (!Array.isArray(raw.interruptibleBy) || !raw.interruptibleBy.every(isClipId)) {
      errors.push(`${path}.interruptibleBy must be an array of known clip ids`);
    } else {
      interruptibleBy = (raw.interruptibleBy as ClipId[]).slice();
    }
  }
  if (raw.preload !== undefined && typeof raw.preload !== "boolean") {
    errors.push(`${path}.preload must be a boolean`);
  }

  if (errors.length > before) return null;

  const def: ClipDef = {
    atlas: raw.atlas as string,
    columns: raw.columns as number,
    frames: raw.frames as number,
    fps: raw.fps as number,
    loop: raw.loop as boolean,
    priority: raw.priority as number,
  };
  if (durations !== undefined) def.durations = durations;
  if (raw.next !== undefined) def.next = raw.next as ClipId;
  if (raw.retrigger !== undefined) def.retrigger = raw.retrigger as "ignore" | "queue";
  if (interruptibleBy !== undefined) def.interruptibleBy = interruptibleBy;
  if (raw.preload !== undefined) def.preload = raw.preload as boolean;
  return def;
}

/**
 * Validate an untrusted manifest object and return a normalised copy.
 * Unknown clip ids (e.g. future "walk") and unknown event names are ignored.
 */
export function parseManifest(input: unknown): ManifestResult {
  const errors: string[] = [];
  if (!isRec(input)) {
    return { ok: false, errors: ["manifest must be an object"] };
  }

  if (input.schema !== 1) errors.push("schema must be 1");
  if (typeof input.character !== "string" || input.character.trim() === "") {
    errors.push("character must be a non-empty string");
  }
  if (typeof input.version !== "string") errors.push("version must be a string");

  const logicalSize = parseSize(input.logicalSize, "logicalSize", errors);
  const frameSize = parseSize(input.frameSize, "frameSize", errors);
  const anchor = parsePoint(input.anchor, "anchor", errors);

  let hoverCooldownMs = DEFAULT_HOVER_COOLDOWN_MS;
  if (input.hoverCooldownMs !== undefined) {
    if (isFiniteNum(input.hoverCooldownMs) && input.hoverCooldownMs >= 0) {
      hoverCooldownMs = input.hoverCooldownMs;
    } else {
      errors.push("hoverCooldownMs must be a non-negative number");
    }
  }

  const rawClips = input.clips;
  const parsed: Partial<Record<ClipId, ClipDef>> = {};
  if (!isRec(rawClips)) {
    errors.push("clips must be an object");
  } else {
    for (const id of CLIP_IDS) {
      if (!Object.prototype.hasOwnProperty.call(rawClips, id)) {
        errors.push(`clips.${id} is required`);
        continue;
      }
      const def = parseClip(rawClips[id], id, errors);
      if (def) parsed[id] = def;
    }
  }

  const { idle, hop, react } = parsed;
  if (idle && hop && react) {
    if (!idle.loop) errors.push("clips.idle must loop");
    for (const id of ["hop", "react"] as const) {
      const def = parsed[id] as ClipDef;
      if (def.loop) errors.push(`clips.${id} must be a one-shot (loop: false)`);
      if (def.next !== "idle") errors.push(`clips.${id}.next must be "idle"`);
    }
    if (!(react.priority > idle.priority)) {
      errors.push("clips.react.priority must be greater than clips.idle.priority");
    }
    if (!(hop.priority > react.priority)) {
      errors.push("clips.hop.priority must be greater than clips.react.priority");
    }
  }

  const rawEvents = input.events;
  for (const ev of INTERACTION_EVENTS) {
    if (!isRec(rawEvents) || rawEvents[ev] !== REQUIRED_EVENT_MAP[ev]) {
      errors.push(`events.${ev} must be "${REQUIRED_EVENT_MAP[ev]}"`);
    }
  }

  let hit: HitMaskDef | null = null;
  if (input.hit !== undefined) hit = parseHit(input.hit, errors);

  if (errors.length > 0 || !logicalSize || !frameSize || !anchor || !idle || !hop || !react) {
    return { ok: false, errors };
  }

  const manifest: CharacterManifest = {
    schema: 1,
    character: input.character as string,
    version: input.version as string,
    logicalSize,
    frameSize,
    anchor,
    hoverCooldownMs,
    clips: { idle, hop, react },
    events: { ...REQUIRED_EVENT_MAP },
  };
  if (hit) manifest.hit = hit;
  return { ok: true, manifest };
}
