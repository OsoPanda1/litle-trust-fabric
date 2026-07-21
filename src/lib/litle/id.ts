import { sha256 } from "@noble/hashes/sha2.js";
import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";

export type LitleWorkType = "BK" | "RQ" | "DS" | "PL" | "AR" | "MD" | "SW" | "EX" | "DP";

export const LITLE_WORK_TYPES: Record<LitleWorkType, string> = {
  BK: "Book", RQ: "Research", DS: "Dataset", PL: "Pipeline",
  AR: "Article", MD: "AI Model", SW: "Software", EX: "Experiment", DP: "Data Package",
};

export const LITLE_CRYPTO_PROFILES = ["L-512.v1", "L-1024.v1", "L-PQC.v1"] as const;
export type LitleCryptoProfile = (typeof LITLE_CRYPTO_PROFILES)[number];

export interface LitleId {
  namespace: string;
  year: number;
  workType: LitleWorkType;
  cryptoProfile: LitleCryptoProfile;
  suffix: string;
}

const SUFFIX_RE = /^[0-9A-F]{16,64}$/;
const NS_RE = /^[a-z0-9]+(?:\/[a-z0-9]+)*$/;

function assertValid(id: LitleId): void {
  if (!Number.isInteger(id.year) || id.year < 1900 || id.year > 9999) {
    throw new Error(`LITLE-ID: invalid year ${id.year}`);
  }
  if (!LITLE_WORK_TYPES[id.workType]) {
    throw new Error(`LITLE-ID: unknown workType ${id.workType}`);
  }
  if (!SUFFIX_RE.test(id.suffix)) {
    throw new Error(`LITLE-ID: suffix must be 16..64 uppercase hex`);
  }
  if (!NS_RE.test(id.namespace)) {
    throw new Error(`LITLE-ID: namespace must be lowercase slash-separated tokens`);
  }
}

export function toUri(id: LitleId): string {
  assertValid(id);
  return `litle://${id.year}/${id.namespace}/${id.suffix}`;
}

export function toHuman(id: LitleId): string {
  assertValid(id);
  const s = id.suffix.slice(0, 8).toUpperCase().padEnd(8, "0");
  return `LTL-${id.year}-${id.workType}-${s.slice(0, 4)}-${s.slice(4, 8)}-${id.suffix.slice(8, 12)}`;
}

export function toCanonical(id: LitleId): string {
  assertValid(id);
  return `litle:${id.year}:${id.workType}:${id.cryptoProfile}:${id.namespace}:${id.suffix}`;
}

export function parseCanonical(s: string): LitleId {
  const parts = s.split(":");
  if (parts.length !== 6 || parts[0] !== "litle") {
    throw new Error("LITLE-ID: not a canonical string");
  }
  const id: LitleId = {
    year: Number(parts[1]),
    workType: parts[2] as LitleWorkType,
    cryptoProfile: parts[3] as LitleCryptoProfile,
    namespace: parts[4],
    suffix: parts[5],
  };
  assertValid(id);
  return id;
}

export function parseAny(input: string): LitleId {
  const t = input.trim();
  if (t.startsWith("litle:") && !t.startsWith("litle://")) return parseCanonical(t);
  if (t.startsWith("litle://")) {
    const url = new URL(t);
    const year = Number(url.host);
    const segs = url.pathname.split("/").filter(Boolean);
    if (segs.length < 2) throw new Error("LITLE-ID: URI missing suffix");
    const id: LitleId = {
      year,
      namespace: segs.slice(0, -1).join("/"),
      workType: "RQ",
      cryptoProfile: "L-512.v1",
      suffix: segs[segs.length - 1].toUpperCase(),
    };
    assertValid(id);
    return id;
  }
  const m = /^LTL-(\d{4})-([A-Z]{2})-([0-9A-F]{4})-([0-9A-F]{4})(?:-([0-9A-F]{4}))?$/.exec(t);
  if (m) {
    const suffix = `${m[3]}${m[4]}${m[5] ?? ""}`.padEnd(16, "0");
    const id: LitleId = {
      year: Number(m[1]),
      workType: m[2] as LitleWorkType,
      cryptoProfile: "L-512.v1",
      namespace: "unknown",
      suffix,
    };
    assertValid(id);
    return id;
  }
  throw new Error("LITLE-ID: unrecognized format");
}

export function deriveLitleId(input: {
  containerBytes: Uint8Array;
  year: number;
  namespace: string;
  workType: LitleWorkType;
  cryptoProfile?: LitleCryptoProfile;
}): LitleId {
  const profile = input.cryptoProfile ?? "L-512.v1";
  const digest = profile === "L-PQC.v1"
    ? shake256(input.containerBytes, { dkLen: 64 })
    : sha256(input.containerBytes);
  const suffix = bytesToHex(digest.slice(0, 16)).toUpperCase();
  const id: LitleId = {
    year: input.year,
    namespace: input.namespace.toLowerCase(),
    workType: input.workType,
    cryptoProfile: profile,
    suffix,
  };
  assertValid(id);
  return id;
}

export function workTypeLabel(t: LitleWorkType | string): string {
  return LITLE_WORK_TYPES[t as LitleWorkType] ?? t;
}

export class LitleIdEngine {
  static parse(input: string): LitleId & { federationId?: string; pqcCapable?: boolean } {
    const id = parseAny(input);
    const fedMap: Record<string, string> = {
      "tech": "FED1", "crypto": "FED1",
      "sci": "FED2", "standards": "FED2",
      "infra": "FED3", "mesh": "FED3",
      "evidence": "FED4", "lineage": "FED4",
      "curation": "FED5", "redemption": "FED5",
      "kernel": "FED6", "dev": "FED6",
      "audit": "FED7", "compliance": "FED7",
    };
    const ns = id.namespace.split("/")[0].toLowerCase();
    return {
      ...id,
      federationId: fedMap[ns] ?? "FED0",
      pqcCapable: id.cryptoProfile === "L-PQC.v1",
    };
  }

  static format(id: LitleId): { human: string; uri: string; canonical: string } {
    return { human: toHuman(id), uri: toUri(id), canonical: toCanonical(id) };
  }

  static verify(input: string): { valid: boolean; error?: string; pqcCapable?: boolean } {
    try {
      const id = parseAny(input);
      return { valid: true, pqcCapable: id.cryptoProfile === "L-PQC.v1" };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }
}
