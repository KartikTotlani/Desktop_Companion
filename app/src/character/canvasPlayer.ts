// Canvas player core. Drives the pure state machine and frame selection and draws atlas cells.
// It knows nothing about React or Tauri. Timers, frames and the clock are injected so it can be
// tested in Node with fakes; `browserDeps()` supplies the real ones.
//
// Behaviour: draws only when the visible frame (or canvas size) changes, wakes with one
// setTimeout per visible change (no animation-frame loop), draws inside a single
// requestAnimationFrame callback, and does nothing while paused or destroyed.

import type { CharacterManifest, ClipId, MachineState } from "./types.ts";
import { createInitialState, send as sendEvent, shiftTime } from "./stateMachine.ts";
import { backingSize, describeFrame } from "./framePlayer.ts";
import type { FrameCell } from "./framePlayer.ts";

/** The subset of a 2D context the player uses (CanvasRenderingContext2D satisfies it). */
export interface PlayerContext {
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: "low" | "medium" | "high";
  clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(
    image: unknown,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
}

/** The subset of a canvas the player uses (HTMLCanvasElement satisfies it). */
export interface PlayerSurface {
  width: number;
  height: number;
  getContext(contextId: "2d"): PlayerContext | null;
}

export interface PlayerDeps {
  now(): number;
  setTimer(callback: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
  requestFrame(callback: () => void): unknown;
  cancelFrame(handle: unknown): void;
}

/** Real browser dependencies. Only call this in a browser/webview. */
export function browserDeps(): PlayerDeps {
  return {
    now: () => performance.now(),
    setTimer: (cb, ms) => setTimeout(cb, ms),
    clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    requestFrame: (cb) => requestAnimationFrame(() => cb()),
    cancelFrame: (h) => cancelAnimationFrame(h as number),
  };
}

interface Target {
  clip: ClipId;
  frame: number;
  cell: FrameCell;
}

export class CanvasPlayer {
  private readonly manifest: CharacterManifest;
  private readonly surface: PlayerSurface;
  private readonly atlases: ReadonlyMap<ClipId, unknown>;
  private readonly deps: PlayerDeps;
  private state: MachineState;
  private pixelRatio: number;
  private timer: unknown = null;
  private frameHandle: unknown = null;
  private target: Target | null = null;
  private drawnKey = "";
  private paused = false;
  private pausedAt = 0;
  private destroyed = false;

  constructor(
    manifest: CharacterManifest,
    surface: PlayerSurface,
    atlases: ReadonlyMap<ClipId, unknown>,
    deps: PlayerDeps,
    pixelRatio = 1,
  ) {
    this.manifest = manifest;
    this.surface = surface;
    this.atlases = atlases;
    this.deps = deps;
    this.pixelRatio = pixelRatio;
    this.state = createInitialState(deps.now());
  }

  /** Begin playing from idle. */
  start(): void {
    if (this.destroyed) return;
    this.state = createInitialState(this.deps.now());
    this.applyBackingSize();
    this.tick();
  }

  /** Feed an interaction event ("click" or "hoverEnter"). Ignored while paused or destroyed. */
  send(event: string): void {
    if (this.destroyed || this.paused) return;
    this.state = sendEvent(this.manifest, this.state, event, this.deps.now(), {
      isAvailable: (clip) => this.atlases.has(clip),
    });
    this.tick();
  }

  /** Stop all timers and drawing (window hidden). */
  pause(): void {
    if (this.destroyed || this.paused) return;
    this.paused = true;
    this.pausedAt = this.deps.now();
    this.cancelTimer();
    this.cancelFrame();
  }

  /** Continue from the same frame the animation was paused on. */
  resume(): void {
    if (this.destroyed || !this.paused) return;
    this.paused = false;
    this.state = shiftTime(this.state, this.deps.now() - this.pausedAt);
    this.drawnKey = "";
    this.tick();
  }

  /** Change the display scale; resizes the backing store and redraws. */
  setPixelRatio(pixelRatio: number): void {
    if (this.destroyed) return;
    this.pixelRatio = pixelRatio;
    this.applyBackingSize();
    if (!this.paused) this.tick();
  }

  /** Call when an atlas finished loading late: redraws the current frame. */
  refresh(): void {
    if (this.destroyed || this.paused) return;
    this.drawnKey = "";
    this.tick();
  }

  /** Release timers. Safe to call more than once. */
  destroy(): void {
    this.destroyed = true;
    this.cancelTimer();
    this.cancelFrame();
    this.target = null;
  }

  /** Current machine state (for diagnostics and tests). */
  getState(): MachineState {
    return this.state;
  }

  private tick(): void {
    if (this.destroyed || this.paused) return;
    this.cancelTimer();
    const view = describeFrame(this.manifest, this.state, this.deps.now());
    this.state = view.state;
    this.target = { clip: view.clip, frame: view.frame, cell: view.cell };
    const key = `${view.clip}:${view.frame}:${this.surface.width}x${this.surface.height}`;
    if (key !== this.drawnKey && this.frameHandle === null) {
      this.frameHandle = this.deps.requestFrame(() => {
        this.frameHandle = null;
        this.draw();
      });
    }
    this.timer = this.deps.setTimer(() => {
      this.timer = null;
      this.tick();
    }, view.wakeInMs);
  }

  private draw(): void {
    const target = this.target;
    if (this.destroyed || this.paused || !target) return;
    const atlas = this.atlases.get(target.clip) ?? this.atlases.get("idle");
    const ctx = this.surface.getContext("2d");
    if (!atlas || !ctx) return;
    const { width, height } = this.surface;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const c = target.cell;
    ctx.drawImage(atlas, c.sx, c.sy, c.sw, c.sh, 0, 0, width, height);
    this.drawnKey = `${target.clip}:${target.frame}:${width}x${height}`;
  }

  private applyBackingSize(): void {
    const size = backingSize(this.manifest.logicalSize, this.pixelRatio, this.manifest.frameSize);
    if (this.surface.width !== size.w || this.surface.height !== size.h) {
      // Assigning a canvas size clears it, so force a redraw.
      this.surface.width = size.w;
      this.surface.height = size.h;
      this.drawnKey = "";
    }
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      this.deps.clearTimer(this.timer);
      this.timer = null;
    }
  }

  private cancelFrame(): void {
    if (this.frameHandle !== null) {
      this.deps.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }
}
