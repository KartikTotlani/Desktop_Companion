// Tests for atlas loading, failure handling and cleanup.
//   node --experimental-strip-types --test tests/character/atlasLoader.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import { loadAtlases } from "../../src/character/atlasLoader.ts";
import type { ImageLoader, LoadedImage } from "../../src/character/atlasLoader.ts";
import type { CharacterManifest, ClipId } from "../../src/character/types.ts";

function loadManifest(): CharacterManifest {
  const json = JSON.parse(
    readFileSync(new URL("../../src/character/nova/manifest.json", import.meta.url), "utf8"),
  );
  const r = parseManifest(json);
  if (!r.ok) throw new Error(r.errors.join("; "));
  return r.manifest;
}

const m = loadManifest();
const SIZES: Record<ClipId, [number, number]> = {
  idle: [1320, 1080],
  hop: [1320, 1080],
  react: [1320, 720],
};

/** Fake images that remember whether they were closed. */
function makeImages() {
  const made: Array<LoadedImage & { url: string; closed: number }> = [];
  const make = (url: string, w?: number, h?: number) => {
    const img = { url, width: w, height: h, closed: 0, close() { img.closed++; } };
    made.push(img);
    return img;
  };
  return { made, make };
}

function sizeFor(url: string): [number, number] {
  const clip = (["idle", "hop", "react"] as const).find((c) => url.includes(c))!;
  return SIZES[clip];
}

describe("loading", () => {
  it("loads every clip, resolving URLs and reporting each arrival", async () => {
    const { make } = makeImages();
    const urls: string[] = [];
    const arrived: string[] = [];
    const set = loadAtlases(
      m,
      async (url) => { urls.push(url); const [w, h] = sizeFor(url); return make(url, w, h); },
      { resolveUrl: (p) => `/assets/${p}`, onClipLoaded: (c) => arrived.push(c) },
    );
    await set.done;
    assert.deepEqual([...set.atlases.keys()].sort(), ["hop", "idle", "react"]);
    assert.deepEqual(set.errors, []);
    assert.deepEqual(urls.sort(), ["/assets/atlases/hop.webp", "/assets/atlases/idle.webp", "/assets/atlases/react.webp"]);
    assert.deepEqual(arrived.sort(), ["hop", "idle", "react"]);
  });

  it("accepts images without size info and images with the exact expected size", async () => {
    const { make } = makeImages();
    const set = loadAtlases(m, async (url) => (url.includes("idle") ? make(url, 1320, 1080) : make(url)));
    await set.done;
    assert.equal(set.atlases.size, 3);
  });

  it("fills the live map as clips arrive", async () => {
    const { make } = makeImages();
    let releaseHop: (() => void) | null = null;
    const loader: ImageLoader = (url) =>
      url.includes("hop")
        ? new Promise((resolve) => { releaseHop = () => resolve(make(url)); })
        : Promise.resolve(make(url));
    const set = loadAtlases(m, loader);
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(set.atlases.has("idle"), true);
    assert.equal(set.atlases.has("hop"), false);
    (releaseHop as unknown as () => void)();
    await set.done;
    assert.equal(set.atlases.has("hop"), true);
  });
});

describe("failures", () => {
  it("leaves out a clip that fails, keeps the others, and does not reject", async () => {
    const { make } = makeImages();
    const reported: string[] = [];
    const set = loadAtlases(
      m,
      async (url) => { if (url.includes("hop")) throw new Error("404 hop.webp"); return make(url); },
      { onError: (e) => reported.push(e.clip) },
    );
    await set.done;
    assert.deepEqual([...set.atlases.keys()].sort(), ["idle", "react"]);
    assert.equal(set.errors.length, 1);
    assert.equal(set.errors[0].clip, "hop");
    assert.match(set.errors[0].message, /404/);
    assert.deepEqual(reported, ["hop"]);
  });

  it("survives a loader that throws synchronously, rejects with a non-Error, or returns nothing", async () => {
    const { make } = makeImages();
    const loader: ImageLoader = ((url: string) => {
      if (url.includes("idle")) throw new Error("sync boom");
      if (url.includes("hop")) return Promise.reject("plain string");
      if (url.includes("react")) return Promise.resolve(null as unknown as LoadedImage);
      return Promise.resolve(make(url));
    }) as ImageLoader;
    const set = loadAtlases(m, loader);
    await set.done;
    assert.equal(set.atlases.size, 0);
    assert.equal(set.errors.length, 3);
    assert.ok(set.errors.some((e) => e.clip === "hop" && e.message === "plain string"));
    assert.ok(set.errors.some((e) => e.clip === "react" && /no image/.test(e.message)));
  });

  it("rejects an atlas of the wrong size and closes it", async () => {
    const { make, made } = makeImages();
    const set = loadAtlases(m, async (url) => (url.includes("react") ? make(url, 100, 100) : make(url)));
    await set.done;
    assert.equal(set.atlases.has("react"), false);
    assert.match(set.errors[0].message, /size 100x100 does not match expected 1320x720/);
    assert.equal(made.find((i) => i.url.includes("react"))!.closed, 1);
  });

  it("survives a throwing resolveUrl and throwing callbacks", async () => {
    const { make } = makeImages();
    const set = loadAtlases(m, async (url) => make(url), {
      resolveUrl: (p) => { if (p.includes("hop")) throw new Error("bad path"); return p; },
      onClipLoaded: () => { throw new Error("callback boom"); },
      onError: () => { throw new Error("callback boom"); },
    });
    await set.done;
    assert.deepEqual([...set.atlases.keys()].sort(), ["idle", "react"]);
    assert.equal(set.errors.length, 1);
  });
});

describe("cleanup", () => {
  it("dispose closes every loaded image, empties the map and is idempotent", async () => {
    const { make, made } = makeImages();
    const set = loadAtlases(m, async (url) => make(url));
    await set.done;
    set.dispose();
    set.dispose();
    assert.equal(set.atlases.size, 0);
    assert.equal(made.length, 3);
    for (const img of made) assert.equal(img.closed, 1);
  });

  it("closes images that finish loading after dispose and never adds them", async () => {
    const { make, made } = makeImages();
    const pending: Array<() => void> = [];
    const arrived: string[] = [];
    const set = loadAtlases(
      m,
      (url) => new Promise((resolve) => { pending.push(() => resolve(make(url))); }),
      { onClipLoaded: (c) => arrived.push(c) },
    );
    set.dispose();
    for (const release of pending) release();
    await set.done;
    assert.equal(set.atlases.size, 0);
    assert.deepEqual(arrived, []);
    assert.equal(made.length, 3);
    for (const img of made) assert.equal(img.closed, 1);
    assert.deepEqual(set.errors, []);
  });

  it("does not report errors for loads that fail after dispose", async () => {
    const pending: Array<() => void> = [];
    const set = loadAtlases(m, () => new Promise((_res, reject) => { pending.push(() => reject(new Error("late"))); }));
    set.dispose();
    for (const fail of pending) fail();
    await set.done;
    assert.deepEqual(set.errors, []);
  });

  it("ignores an image whose close() throws", async () => {
    const set = loadAtlases(m, async () => ({ close() { throw new Error("close failed"); } }));
    await set.done;
    assert.doesNotThrow(() => set.dispose());
  });
});
