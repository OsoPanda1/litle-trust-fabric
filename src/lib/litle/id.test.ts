import { describe, it, expect } from "vitest";
import { toUri, toHuman, toCanonical, parseCanonical, parseAny, deriveLitleId, LitleIdEngine } from "./id";
import type { LitleId } from "./id";

const SAMPLE_ID: LitleId = {
  namespace: "tech/ia",
  year: 2026,
  workType: "RQ",
  cryptoProfile: "L-512.v1",
  suffix: "A1B2C3D4E5F67890",
};

describe("toUri", () => {
  it("produces correct URI", () => {
    const uri = toUri(SAMPLE_ID);
    expect(uri).toBe("litle://2026/tech/ia/A1B2C3D4E5F67890");
  });
});

describe("toHuman", () => {
  it("produces correct human form", () => {
    const h = toHuman(SAMPLE_ID);
    expect(h).toMatch(/^LTL-2026-RQ-/);
    expect(h.length).toBeGreaterThanOrEqual(22);
  });
});

describe("toCanonical / parseCanonical", () => {
  it("round-trips canonical form", () => {
    const c = toCanonical(SAMPLE_ID);
    const parsed = parseCanonical(c);
    expect(parsed).toEqual(SAMPLE_ID);
  });
});

describe("parseAny", () => {
  it("parses URI form", () => {
    const parsed = parseAny("litle://2026/tech/ia/A1B2C3D4E5F67890");
    expect(parsed.year).toBe(2026);
    expect(parsed.namespace).toBe("tech/ia");
  });

  it("parses canonical form", () => {
    const c = toCanonical(SAMPLE_ID);
    const parsed = parseAny(c);
    expect(parsed).toEqual(SAMPLE_ID);
  });

  it("parses human form", () => {
    const h = toHuman(SAMPLE_ID);
    const parsed = parseAny(h);
    expect(parsed.year).toBe(2026);
  });

  it("throws on invalid input", () => {
    expect(() => parseAny("")).toThrow();
    expect(() => parseAny("not-a-litle-id")).toThrow();
  });
});

describe("deriveLitleId", () => {
  it("derives a valid ID from container bytes", () => {
    const id = deriveLitleId({
      containerBytes: new Uint8Array([1, 2, 3, 4]),
      year: 2026,
      namespace: "test",
      workType: "RQ",
    });
    expect(id.year).toBe(2026);
    expect(id.workType).toBe("RQ");
    expect(id.namespace).toBe("test");
    expect(id.suffix.length).toBe(32);
  });

  it("uses L-PQC.v1 profile when specified", () => {
    const id = deriveLitleId({
      containerBytes: new Uint8Array([1, 2, 3, 4]),
      year: 2026,
      namespace: "test",
      workType: "RQ",
      cryptoProfile: "L-PQC.v1",
    });
    expect(id.cryptoProfile).toBe("L-PQC.v1");
  });

  it("produces different IDs for different content", () => {
    const id1 = deriveLitleId({ containerBytes: new Uint8Array([1]), year: 2026, namespace: "a", workType: "RQ" });
    const id2 = deriveLitleId({ containerBytes: new Uint8Array([2]), year: 2026, namespace: "a", workType: "RQ" });
    expect(id1.suffix).not.toBe(id2.suffix);
  });
});

describe("LitleIdEngine", () => {
  it("parse returns federation and capability flags", () => {
    const result = LitleIdEngine.parse("LTL-2026-RQ-A1B2-C3D4");
    expect(result.federationId).toBeDefined();
    expect(result.pqcCapable).toBe(false);
  });

  it("verify returns valid for correct input", () => {
    const result = LitleIdEngine.verify("LTL-2026-RQ-A1B2-C3D4");
    expect(result.valid).toBe(true);
  });

  it("verify returns invalid for garbage", () => {
    const result = LitleIdEngine.verify("not-valid");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("format returns all three forms", () => {
    const fmt = LitleIdEngine.format(SAMPLE_ID);
    expect(fmt.human).toContain("LTL-2026");
    expect(fmt.uri).toContain("litle://");
    expect(fmt.canonical).toContain("litle:");
  });
});
