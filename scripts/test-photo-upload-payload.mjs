#!/usr/bin/env node
import assert from "node:assert/strict";
import { decodeBase64ImagePayload } from "../server/services/photoStorage.js";

const tinyJpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9
]);
const base64 = tinyJpeg.toString("base64");

const cases = [
  [`data:image/jpeg;base64,${base64}`, "image/jpeg"],
  [`data:image/webp;base64,${base64}`, "image/webp"],
  [`data:image/jpg;base64,${base64}`, "image/jpeg"],
  [`data:application/octet-stream;base64,${base64}`, "image/jpeg"]
];

for (const [payload, expectedType] of cases) {
  const decoded = decodeBase64ImagePayload(payload);
  assert.equal(decoded.contentType, expectedType, `content type for ${payload.slice(0, 32)}`);
  assert.ok(decoded.buffer.length > 0);
}

assert.throws(() => decodeBase64ImagePayload("not-an-image"), /Invalid image payload/);

console.log("✓ Photo upload payload decoding");
