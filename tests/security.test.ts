import { describe, expect, it } from "vitest";
import { buildIngestSignature, safeCsvCell } from "@/lib/security";

describe("security helpers", () => {
  it("builds stable signature", () => {
    const sig = buildIngestSignature('{"x":1}', "abcdefghijklmnopqrstuvwxyz123456");
    expect(sig).toHaveLength(64);
  });

  it("escapes csv cells", () => {
    expect(safeCsvCell('a"b')).toBe('"a""b"');
  });
});

