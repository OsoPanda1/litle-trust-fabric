import { describe, it, expect } from "vitest";
import { sealHybridShield, verifyHybridShield, shieldStrength } from "./hybrid-shield";

describe("sealHybridShield", () => {
  it("seals data with L-SHIELD-5 profile", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const shield = sealHybridShield(data, "L-SHIELD-5");
    expect(shield.profile).toBe("L-SHIELD-5");
    expect(shield.overallStatus).toBe("sealed");
    expect(shield.id).toBeDefined();
    expect(shield.layers.length).toBe(5);
  });

  it("seals data with L-SHIELD-3 profile", () => {
    const data = new Uint8Array([1, 2, 3]);
    const shield = sealHybridShield(data, "L-SHIELD-3");
    expect(shield.layers.length).toBe(3);
    expect(shield.overallStatus).toBe("sealed");
  });

  it("all layers report successful", () => {
    const data = new Uint8Array(64).fill(0x42);
    const shield = sealHybridShield(data, "L-SHIELD-5");
    for (const layer of shield.layers) {
      expect(layer.successful).toBe(true);
    }
  });

  it("produces different shields for different data", () => {
    const s1 = sealHybridShield(new Uint8Array([1]));
    const s2 = sealHybridShield(new Uint8Array([2]));
    expect(s1.id).not.toBe(s2.id);
  });

  it("includes quantum fingerprint", () => {
    const data = new Uint8Array(32).fill(0xab);
    const shield = sealHybridShield(data);
    expect(shield.quantumFingerprint.length).toBeGreaterThan(0);
  });

  it("includes entanglement hash for L-SHIELD-5", () => {
    const data = new Uint8Array(32).fill(0xab);
    const shield = sealHybridShield(data, "L-SHIELD-5");
    expect(shield.entanglementHash.length).toBeGreaterThan(0);
  });
});

describe("verifyHybridShield", () => {
  it("verifies unmodified shield successfully", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const shield = sealHybridShield(data, "L-SHIELD-3");
    const result = verifyHybridShield(shield, data);
    expect(result.valid).toBe(true);
    expect(result.similarity).toBeGreaterThan(0.9);
  });

  it("rejects modified data", () => {
    const data = new Uint8Array([1, 2, 3]);
    const shield = sealHybridShield(data, "L-SHIELD-3");
    const tampered = new Uint8Array([1, 2, 255]);
    const result = verifyHybridShield(shield, tampered);
    expect(result.valid).toBe(false);
  });
});

describe("shieldStrength", () => {
  it("returns correct strength by profile", () => {
    expect(shieldStrength("L-SHIELD-3")).toBe(3);
    expect(shieldStrength("L-SHIELD-4")).toBe(4);
    expect(shieldStrength("L-SHIELD-5")).toBe(5);
  });
});
