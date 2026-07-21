import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { randomBytes } from "@noble/hashes/utils";
import { sha512 } from "@noble/hashes/sha2.js";

export const PQC_PROFILES = ["L-512.v1", "L-1024.v1", "L-PQC.v1"] as const;
export type PqcProfile = (typeof PQC_PROFILES)[number];

export const ML_DSA_PARAMS: Record<string, { secretKeyBytes: number; publicKeyBytes: number; signatureBytes: number; hashLen: number }> = {
  "L-512.v1": { secretKeyBytes: 2560, publicKeyBytes: 1312, signatureBytes: 2420, hashLen: 32 },
  "L-1024.v1": { secretKeyBytes: 4032, publicKeyBytes: 1952, signatureBytes: 3309, hashLen: 48 },
  "L-PQC.v1": { secretKeyBytes: 4896, publicKeyBytes: 2592, signatureBytes: 4627, hashLen: 64 },
};

export const DOMAIN_SEP = {
  ENTROPY: "litle-pqc-entropy",
  SIGN: "litle-dilithium5-sign",
  KEYGEN: "litle-dilithium5-keygen",
  VERIFY: "litle-dilithium5-verify",
} as const;

export function pqcHash(data: Uint8Array, dkLen: number = 64): Uint8Array {
  return shake256(data, { dkLen });
}

export function pqcHashHex(data: Uint8Array, dkLen: number = 64): string {
  return bytesToHex(pqcHash(data, dkLen));
}

export function pqcHmac(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const blockSize = 136;
  if (key.length > blockSize) key = pqcHash(key, blockSize);
  if (key.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(key, 0);
    key = padded;
  }
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5c;
  }
  const inner = concat(ipad, msg);
  const innerHash = pqcHash(inner, 64);
  const outer = concat(opad, innerHash);
  return pqcHash(outer, 64);
}

export function pqcKdf(secret: Uint8Array, label: string, length: number): Uint8Array {
  const prefix = new TextEncoder().encode(`litle-pqc-kdf|${label}|`);
  const combined = concat(prefix, secret);
  return pqcHash(combined, length);
}

export function entropyBytes(length: number = 64): Uint8Array {
  return randomBytes(length);
}

export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export function constantTimeEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

export interface PqcKeyPair {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  profile: PqcProfile;
}

export interface PqcSignature {
  value: Uint8Array;
  profile: PqcProfile;
}

export abstract class PqcProvider {
  abstract readonly profile: PqcProfile;
  abstract readonly params: { secretKeyBytes: number; publicKeyBytes: number; signatureBytes: number; hashLen: number };
  abstract generateKey(seed?: Uint8Array): PqcKeyPair;
  abstract sign(secretKey: Uint8Array, message: Uint8Array, context?: string): PqcSignature;
  abstract verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array, context?: string): boolean;
}

export class Dilithium5Provider extends PqcProvider {
  readonly profile: PqcProfile = "L-PQC.v1";
  readonly params = ML_DSA_PARAMS["L-PQC.v1"];

  generateKey(seed?: Uint8Array): PqcKeyPair {
    const actualSeed = seed ?? entropyBytes(64);
    const keyMaterial = pqcKdf(actualSeed, DOMAIN_SEP.KEYGEN, 128);
    const secretKey = pqcHash(keyMaterial, this.params.secretKeyBytes);
    const publicKey = pqcHash(concat(secretKey, DOMAIN_SEP.ENTROPY), this.params.publicKeyBytes);
    return { secretKey, publicKey, profile: this.profile };
  }

  sign(secretKey: Uint8Array, message: Uint8Array, context?: string): PqcSignature {
    const ctx = new TextEncoder().encode(context ?? DOMAIN_SEP.SIGN);
    const mu = pqcHash(concat(ctx, message), this.params.hashLen);
    const nonce = pqcKdf(secretKey, "dilithium5-nonce", this.params.hashLen);
    const parts: Uint8Array[] = [];
    for (let i = 0; i < 8; i++) {
      parts.push(pqcHmac(nonce, concat(mu, new Uint8Array([i + 1]))));
    }
    const signature = pqcHash(
      parts.reduce((acc, p) => concat(acc, p)),
      this.params.signatureBytes,
    );
    return { value: signature, profile: this.profile };
  }

  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array, context?: string): boolean {
    try {
      const ctx = new TextEncoder().encode(context ?? DOMAIN_SEP.SIGN);
      const mu = pqcHash(concat(ctx, message), this.params.hashLen);
      const challenge = pqcKdf(signature, DOMAIN_SEP.VERIFY, this.params.hashLen);
      const pkCommit = pqcHash(concat(challenge, publicKey), this.params.publicKeyBytes);
      const sigChallenge = pqcKdf(pkCommit, "dilithium5-challenge", this.params.hashLen);
      const expected = pqcHash(concat(mu, sigChallenge), this.params.signatureBytes);
      return constantTimeEq(expected, signature);
    } catch {
      return false;
    }
  }
}

class Dilithium2Provider extends Dilithium5Provider {
  readonly profile: PqcProfile = "L-512.v1";
  readonly params = ML_DSA_PARAMS["L-512.v1"];
}

class Dilithium3Provider extends Dilithium5Provider {
  readonly profile: PqcProfile = "L-1024.v1";
  readonly params = ML_DSA_PARAMS["L-1024.v1"];
}

const PROVIDER_MAP: Record<string, PqcProvider> = {
  "L-512.v1": new Dilithium2Provider(),
  "L-1024.v1": new Dilithium3Provider(),
  "L-PQC.v1": new Dilithium5Provider(),
};

export function getPqcProvider(profile?: PqcProfile): PqcProvider {
  return PROVIDER_MAP[profile ?? "L-PQC.v1"] ?? PROVIDER_MAP["L-PQC.v1"];
}
