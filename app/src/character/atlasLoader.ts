// Atlas image loading with error handling and cleanup. Independent of React, the DOM and
// Tauri: the image loader is injected (see `browserImageLoader` for the real one).
//
// `loadAtlases` returns immediately with a live `atlases` map that fills as clips load, so a
// CanvasPlayer can start at once and call `refresh()` when a clip arrives. A clip that fails to
// load (or has the wrong size) is left out and reported in `errors`; the state machine then
// treats that clip as unavailable.

import type { CharacterManifest, ClipId } from "./types.ts";
import { CLIP_IDS } from "./types.ts";
import { atlasSize } from "./framePlayer.ts";

/** A decoded image. `close` exists on ImageBitmap and frees its decoded memory. */
export interface LoadedImage {
  width?: number;
  height?: number;
  close?(): void;
}

export type ImageLoader = (url: string) => Promise<LoadedImage>;

export interface AtlasLoadError {
  clip: ClipId;
  url: string;
  message: string;
}

export interface AtlasSet {
  /** Live map: clips appear here as they finish loading. */
  readonly atlases: Map<ClipId, unknown>;
  readonly errors: AtlasLoadError[];
  /** Settles when every clip has loaded or failed. Never rejects. */
  readonly done: Promise<void>;
  /** Close all images and discard any load still in flight. Safe to call repeatedly. */
  dispose(): void;
}

export interface LoadOptions {
  /** Turn the manifest's atlas path into a loadable URL (default: unchanged). */
  resolveUrl?: (atlasPath: string) => string;
  onClipLoaded?: (clip: ClipId) => void;
  onError?: (error: AtlasLoadError) => void;
}

/** Real loader: fetch + createImageBitmap. Only use in a browser/webview. */
export const browserImageLoader: ImageLoader = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${url}`);
  return createImageBitmap(await response.blob());
};

function closeQuietly(image: LoadedImage | null | undefined): void {
  try {
    image?.close?.();
  } catch {
    // Closing is best effort.
  }
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function loadAtlases(
  m: CharacterManifest,
  loader: ImageLoader,
  opts: LoadOptions = {},
): AtlasSet {
  const atlases = new Map<ClipId, unknown>();
  const errors: AtlasLoadError[] = [];
  let disposed = false;

  const fail = (clip: ClipId, url: string, message: string): void => {
    const error: AtlasLoadError = { clip, url, message };
    errors.push(error);
    try {
      opts.onError?.(error);
    } catch {
      // A throwing callback must not break loading.
    }
  };

  const loadOne = async (clip: ClipId): Promise<void> => {
    const def = m.clips[clip];
    let url = def.atlas;
    let image: LoadedImage | null | undefined;
    try {
      if (opts.resolveUrl) url = opts.resolveUrl(def.atlas);
      image = await loader(url);
    } catch (e) {
      if (!disposed) fail(clip, url, messageOf(e));
      return;
    }
    if (disposed) {
      closeQuietly(image);
      return;
    }
    if (!image || typeof image !== "object") {
      fail(clip, url, "loader returned no image");
      return;
    }
    const expected = atlasSize(def, m.frameSize);
    if (
      typeof image.width === "number" &&
      typeof image.height === "number" &&
      (image.width !== expected.w || image.height !== expected.h)
    ) {
      fail(
        clip,
        url,
        `atlas size ${image.width}x${image.height} does not match expected ${expected.w}x${expected.h}`,
      );
      closeQuietly(image);
      return;
    }
    atlases.set(clip, image);
    try {
      opts.onClipLoaded?.(clip);
    } catch {
      // A throwing callback must not break loading.
    }
  };

  const done = Promise.all(CLIP_IDS.map((clip) => loadOne(clip))).then(() => undefined);

  return {
    atlases,
    errors,
    done,
    dispose(): void {
      disposed = true;
      for (const image of atlases.values()) closeQuietly(image as LoadedImage);
      atlases.clear();
    },
  };
}
