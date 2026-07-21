import { describe, it, expect } from "vitest";
import { Dilithium5Provider, pqcHash, pqcHmac, pqcKdf, constantTimeEq, entropyBytes, concat } from "./pqc";

describe("pqcHash (SHAKE256)", () => {
  it("produces deterministic output", () => {
    const input = new Uint8Array([1, 2, 3, 4, 5]);
    const h1 = pqcHash(input, 32);
    const h2 = pqcHash(input, 32);
    expect(h1).toEqual(h2);
  });

  it("produces variable-length output", () => {
    const input = new Uint8Array([0xde, 0xad]);
    const h32 = pqcHash(input, 32);
    const h64 = pqcHash(input, 64);
    expect(h32.length).toBe(32);
    expect(h64.length).toBe(64);
    expect(h32).not.toEqual(h64);
  });

  it("is sensitive to input changes (avalanche)", () => {
    const a = pqcHash(new Uint8Array([1, 2, 3]), 32);
    const b = pqcHash(new Uint8Array([1, 2, 4]), 32);
    let diff = 0;
    for (let i = 0; i < 32; i++) diff |= a[i] ^ b[i];
    expect(diff).not.toBe(0);
  });
});

describe("pqcHmac", () => {
  it("produces deterministic authentication tags", () => {
    const key = new Uint8Array(32).fill(0x42);
    const msg = new Uint8Array([0x01, 0x02, 0x03]);
    const t1 = pqcHmac(key, msg);
    const t2 = pqcHmac(key, msg);
    expect(t1).toEqual(t2);
  });

  it("produces different tags for different keys", () => {
    const msg = new Uint8Array([0x01, 0x02, 0x03]);
    const t1 = pqcHmac(new Uint8Array(32).fill(0x42), msg);
    const t2 = pqcHmac(new Uint8Array(32).fill(0x43), msg);
    let diff = 0;
    for (let i = 0; i < 64; i++) diff |= t1[i] ^ t2[i];
    expect(diff).not.toBe(0);
  });
});

describe("pqcKdf", () => {
  it("derives key material deterministically", () => {
    const secret = new Uint8Array(32).fill(0xaa);
    const k1 = pqcKdf(secret, "test-label", 48);
    const k2 = pqcKdf(secret, "test-label", 48);
    expect(k1).toEqual(k2);
    expect(k1.length).toBe(48);
  });

  it("derives different keys for different labels", () => {
    const secret = new Uint8Array(32).fill(0xaa);
    const k1 = pqcKdf(secret, "label-a", 32);
    const k2 = pqcKdf(secret, "label-b", 32);
    expect(k1).not.toEqual(k2);
  });
});

describe("constantTimeEq", () => {
  it("returns true for equal buffers", () => {
    expect(constantTimeEq(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
  });

  it("returns false for different buffers", () => {
    expect(constantTimeEq(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(constantTimeEq(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
  });
});

describe("entropyBytes", () => {
  it("produces requested length", () => {
    expect(entropyBytes(32).length).toBe(32);
    expect(entropyBytes(64).length).toBe(64);
  });

  it("produces different values on successive calls", () => {
    const a = entropyBytes(16);
    const b = entropyBytes(16);
    let allSame = true;
    for (let i = 0; i < 16; i++) {
      if (a[i] !== b[i]) { allSame = false; break; }
    }
    expect(allSame).toBe(false);
  });
});

describe("concat", () => {
  it("concatenates two Uint8Arrays", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([4, 5]);
    const c = concat(a, b);
    expect([...c]).toEqual([1, 2, 3, 4, 5]);
    expect(c.length).toBe(5);
  });
});

describe("Dilithium5Provider", () => {
  const provider = new Dilithium5Provider();

  it("has correct profile and params", () => {
    expect(provider.profile).toBe("L-PQC.v1");
    expect(provider.params.secretKeyBytes).toBe(4896);
    expect(provider.params.publicKeyBytes).toBe(2592);
    expect(provider.params.signatureBytes).toBe(4627);
  });

  it("generates a key pair", () => {
    const kp = provider.generateKey();
    expect(kp.secretKey.length).toBe(4896);
    expect(kp.publicKey.length).toBe(2592);
    expect(kp.profile).toBe("L-PQC.v1");
  });

  it("signs and verifies a message", () => {
    const kp = provider.generateKey();
    const msg = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const sig = provider.sign(kp.secretKey, msg);
    expect(sig.value.length).toBe(4627);
    expect(sig.profile).toBe("L-PQC.v1");
    const valid = provider.verify(kp.publicKey, msg, sig.value);
    expect(valid).toBe(true);
  });

  it("rejects signature on different message", () => {
    const kp = provider.generateKey();
    const msg1 = new Uint8Array([0x01, 0x02, 0x03]);
    const msg2 = new Uint8Array([0x01, 0x02, 0x04]);
    const sig = provider.sign(kp.secretKey, msg1);
    const valid = provider.verify(kp.publicKey, msg2, sig.value);
    expect(valid).toBe(false);
  });

  it("rejects signature with wrong public key", () => {
    const kp1 = provider.generateKey();
    const kp2 = provider.generateKey();
    const msg = new Uint8Array([0x01, 0x02, 0x03]);
    const sig = provider.sign(kp1.secretKey, msg);
    const valid = provider.verify(kp2.publicKey, msg, sig.value);
    expect(valid).toBe(false);
  });

  it("produces deterministic signatures with same seed", () => {
    const seed = new Uint8Array(64).fill(0xab);
    const kp1 = provider.generateKey(seed);
    const kp2 = provider.generateKey(seed);
    expect(kp1.secretKey).toEqual(kp2.secretKey);
    expect(kp1.publicKey).toEqual(kp2.publicKey);
  });
});
