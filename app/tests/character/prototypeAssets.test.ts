// Guards the bundled prototype assets: the manifest is valid and every atlas file exists with
// exactly the size the manifest layout implies. Catches a wrong or missing atlas before runtime.
//   node --experimental-strip-types --test tests/character/prototypeAssets.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { parseManifest } from "../../src/character/manifest.ts";
import { atlasSize } from "../../src/character/framePlayer.ts";

const dir = new URL("../../src/character/nova/", import.meta.url);

function webpSize(buf: Buffer): { w: number; h: number } {
  assert.equal(buf.toString("ascii", 0, 4), "RIFF", "not a RIFF file");
  assert.equal(buf.toString("ascii", 8, 12), "WEBP", "not a WebP file");
  const kind = buf.toString("ascii", 12, 16);
  if (kind === "VP8X") {
    return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  }
  if (kind === "VP8L") {
    assert.equal(buf[20], 0x2f, "bad VP8L signature");
    const b = buf.readUInt32LE(21);
    return { w: 1 + (b & 0x3fff), h: 1 + ((b >>> 14) & 0x3fff) };
  }
  if (kind === "VP8 ") {
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`unknown WebP chunk ${kind}`);
}

describe("prototype manifest and atlases", () => {
  const r = parseManifest(JSON.parse(readFileSync(new URL("manifest.prototype.json", dir), "utf8")));

  it("manifest is valid", () => {
    assert.equal(r.ok, true, r.ok ? "" : r.errors.join("; "));
  });

  for (const id of ["idle", "react", "hop"] as const) {
    it(`${id} atlas exists and matches the manifest layout`, () => {
      assert.ok(r.ok);
      if (!r.ok) return;
      const def = r.manifest.clips[id];
      const url = new URL(def.atlas, dir);
      assert.ok(existsSync(url), `missing ${def.atlas} (copy it into src/character/nova/atlases/)`);
      assert.deepEqual(webpSize(readFileSync(url)), atlasSize(def, r.manifest.frameSize));
    });
  }
});
