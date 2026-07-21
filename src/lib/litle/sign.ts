import { blake3 } from "@noble/hashes/blake3";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha2.js";
import { shake256 } from "@noble/hashes/sha3";
import {
  LitleContainerEngine,
  type LitleMetadata,
  type LitleUnpackedContainer,
  type ContainerProfile,
} from "./litle";
import {
  encodeLitleToCanonicalString,
  decodeCanonicalStringToLitle,
} from "./canonical";
import {
  Dilithium5Provider,
  pqcHash,
  concat,
  getPqcProvider,
  ML_DSA_PARAMS,
  entropyBytes,
} from "./pqc";
import type { PqcProfile } from "./pqc";

export const LITLE_BLOCK_BYTES = 64;
export const MERKLE_AST_HASH_BYTES = 64;
export const COVER_ART_HASH_BYTES = 32;
export const PQC_IDENTITY_SEED_BYTES = 128;
export const DILITHIUM_STANDIN_SIG_BYTES = 256;

const encoder = new TextEncoder();

export function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

type ChapterHasher = (texts: string[], dkLen: number) => Uint8Array;

function merkleAstHashGeneric(
  chapterTexts: string[],
  hashFn: (data: Uint8Array, opts: { dkLen: number }) => Uint8Array,
  dkLen: number,
): Uint8Array {
  if (chapterTexts.length === 0) return hashFn(encoder.encode("∅"), { dkLen });
  let layer = chapterTexts.map((t) => hashFn(encoder.encode(t), { dkLen }));
  while (layer.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : left;
      next.push(hashFn(concat(left, right), { dkLen }));
    }
    layer = next;
  }
  return layer[0];
}

export function merkleAstHash(chapterTexts: string[]): Uint8Array {
  return merkleAstHashGeneric(chapterTexts, blake3, MERKLE_AST_HASH_BYTES);
}

export function merkleAstHashPqc(chapterTexts: string[], dkLen: number = 64): Uint8Array {
  return merkleAstHashGeneric(
    chapterTexts,
    (data, opts) => pqcHash(data, opts.dkLen),
    dkLen,
  );
}

export function coverArtHash32(coverPrompt: string | null | undefined): Uint8Array {
  return blake3(encoder.encode(coverPrompt ?? ""), { dkLen: COVER_ART_HASH_BYTES });
}

export function coverArtHashPqc(coverPrompt: string | null | undefined): Uint8Array {
  return pqcHash(encoder.encode(coverPrompt ?? ""), 32);
}

export function derivePqcSeed(authorSecret: string): Uint8Array {
  const a = shake256(encoder.encode(`litle-pqc-seed-A|${authorSecret}`), { dkLen: 64 });
  const b = shake256(encoder.encode(`litle-pqc-seed-B|${authorSecret}`), { dkLen: 64 });
  const out = new Uint8Array(PQC_IDENTITY_SEED_BYTES);
  out.set(a, 0);
  out.set(b, 64);
  return out;
}

export function derivePqcSeedLarge(authorSecret: string, outputLen: number = 3072): Uint8Array {
  const chunks = Math.ceil(outputLen / 64);
  const out = new Uint8Array(outputLen);
  for (let i = 0; i < chunks; i++) {
    const chunk = shake256(encoder.encode(`litle-pqc-seed-v2|${i}|${authorSecret}`), { dkLen: 64 });
    const offset = i * 64;
    const len = Math.min(64, outputLen - offset);
    out.set(chunk.slice(0, len), offset);
  }
  return out;
}

export function condensedSignature(
  blockA: Uint8Array,
  blockB: Uint8Array,
  authorSecret: string,
): Uint8Array {
  const msg = concat(blockA, blockB);
  const key = encoder.encode(`litle-dilithium5-key|${authorSecret}`);
  const s1 = hmac(sha512 as any, key, msg);
  const s2 = hmac(sha512 as any, key, s1);
  const s3 = hmac(sha512 as any, key, s2);
  const s4 = hmac(sha512 as any, key, s3);
  const out = new Uint8Array(DILITHIUM_STANDIN_SIG_BYTES);
  out.set(s1, 0);
  out.set(s2, 64);
  out.set(s3, 128);
  out.set(s4, 192);
  return out;
}

export interface SignInput {
  chapterTexts: string[];
  coverPrompt: string | null | undefined;
  version: { major: number; minor: number; patch: number };
  flags: number;
  authorSecret: string;
  profile?: ContainerProfile;
}

export interface SignOutput {
  container: Uint8Array;
  canonical: string;
  unpacked: LitleUnpackedContainer;
}

export function buildLitleSignature(input: SignInput): SignOutput {
  const pqcProfile: ContainerProfile = input.profile ?? "classic";
  const usePqc = pqcProfile === "pqc";

  const blockA = usePqc
    ? merkleAstHashPqc(input.chapterTexts, 64)
    : merkleAstHash(input.chapterTexts);

  const metadata: LitleMetadata = {
    timestampUtcMs: BigInt(Date.now()),
    versionMajor: input.version.major,
    versionMinor: input.version.minor,
    versionPatch: input.version.patch,
    coverArtHash: usePqc ? coverArtHashPqc(input.coverPrompt) : coverArtHash32(input.coverPrompt),
    flags: input.flags,
    pqcProfile: usePqc ? 1 : undefined,
  };

  const cBlockSize = usePqc ? 3072 : 128;
  const dBlockSize = usePqc ? 4992 : 256;

  const scratch = LitleContainerEngine.packContainer(
    {
      merkleAstHash: blockA,
      metadata,
      pqcIdentitySeed: new Uint8Array(cBlockSize),
      dilithiumSignature: new Uint8Array(dBlockSize),
      containerProfile: pqcProfile,
    },
    pqcProfile,
  );

  const blockB = scratch.slice(LITLE_BLOCK_BYTES, LITLE_BLOCK_BYTES * 2);

  let pqcSeed: Uint8Array;
  let sig: Uint8Array;

  if (usePqc) {
    const provider = new Dilithium5Provider();
    const seedMaterial = derivePqcSeedLarge(input.authorSecret, 64);
    const keyPair = provider.generateKey(seedMaterial);
    pqcSeed = concat(keyPair.secretKey, keyPair.publicKey);
    const msgToSign = concat(blockA, blockB);
    const signature = provider.sign(keyPair.secretKey, msgToSign);
    sig = concat(signature.value, keyPair.publicKey);
  } else {
    pqcSeed = derivePqcSeed(input.authorSecret);
    sig = condensedSignature(blockA, blockB, input.authorSecret);
  }

  const unpacked: LitleUnpackedContainer = {
    merkleAstHash: blockA,
    metadata,
    pqcIdentitySeed: pqcSeed,
    dilithiumSignature: sig,
    containerProfile: pqcProfile,
  };

  const container = LitleContainerEngine.packContainer(unpacked, pqcProfile);
  const canonical = encodeLitleToCanonicalString(container);

  return { container, canonical, unpacked };
}

export function verifyLitleSignature(canonical: string, authorSecret: string): boolean {
  try {
    const bytes = decodeCanonicalStringToLitle(canonical);
    return verifyLitleBytes(bytes, authorSecret);
  } catch {
    return false;
  }
}

export function verifyLitleBytes(bytes: Uint8Array, authorSecret: string): boolean {
  try {
    const unpacked = LitleContainerEngine.unpackContainer(bytes);
    const blockA = unpacked.merkleAstHash;
    const blockB = bytes.slice(LITLE_BLOCK_BYTES, LITLE_BLOCK_BYTES * 2);
    const usePqc = unpacked.containerProfile === "pqc";

    if (usePqc) {
      const params = ML_DSA_PARAMS["L-PQC.v1"];
      const sigLen = params.signatureBytes;
      const pkLen = params.publicKeyBytes;
      if (unpacked.dilithiumSignature.length < sigLen + pkLen) return false;
      const signature = unpacked.dilithiumSignature.slice(0, sigLen);
      const publicKey = unpacked.dilithiumSignature.slice(sigLen, sigLen + pkLen);
      const provider = getPqcProvider("L-PQC.v1");
      return provider.verify(publicKey, concat(blockA, blockB), signature);
    }

    const expectedSig = condensedSignature(blockA, blockB, authorSecret);
    return constantTimeEquals(expectedSig, unpacked.dilithiumSignature);
  } catch {
    return false;
  }
}
