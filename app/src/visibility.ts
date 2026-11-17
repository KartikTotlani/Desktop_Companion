// Maps the Rust "nova-visibility" event payload onto pausing the animation. Pure: no Tauri or
// React imports, so it is testable. The sprite itself never touches Tauri APIs.

export const VISIBILITY_EVENT = "nova-visibility";

export interface Pausable {
  pause(): void;
  resume(): void;
}

/** `false` (window hidden) pauses, `true` (window shown) resumes; anything else is ignored. */
export function applyVisibility(target: Pausable | null | undefined, payload: unknown): void {
  if (!target) return;
  if (payload === false) target.pause();
  else if (payload === true) target.resume();
}
