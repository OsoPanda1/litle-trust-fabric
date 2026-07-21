import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils";

const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase36(buf: Uint8Array): string {
  let num = BigInt("0x" + bytesToHex(buf));
  if (num === BigInt(0)) return "0";
  let res = "";
  const base = BigInt(36);
  while (num > BigInt(0)) {
    res = BASE36[Number(num % base)] + res;
    num = num / base;
  }
  return res;
}

function hashContent(content: string | Uint8Array): string {
  const data = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const h = sha256(data);
  return toBase36(h);
}

const CSV_PREFIX = "LTL";

function seededShuffle(seed: number, length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  let s = seed;
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export interface CsvOptions {
  documentId: string;
  content: string | Uint8Array;
  randomnessSeed?: number;
}

export interface CsvResult {
  csv: string;
  prefix: string;
  hashPart: string;
  idPart: string;
  randomnessConfig: number;
  decomposition: Array<{ pos: number; source: "hash" | "id" | "prefix" | "random" }>;
}

export function generateCsv({ documentId, content, randomnessSeed }: CsvOptions): CsvResult {
  const hashBase36 = hashContent(content);
  const idBytes = sha256(new TextEncoder().encode(documentId));
  const idBase36 = toBase36(idBytes).slice(0, 12).padStart(12, "0");

  const hashChars = hashBase36.padStart(21, "0").slice(0, 21);
  const idChars = idBase36.padStart(7, "0").slice(0, 7);

  const seed = randomnessSeed ?? (parseInt(hashChars.slice(0, 4), 36) % 65536);
  const rConfig = seed % 16;

  const positions: Array<"prefix" | "hash" | "id" | "random"> = [];
  const result: string[] = [];

  for (let i = 0; i < 3; i++) {
    result.push(CSV_PREFIX[i]);
    positions.push("prefix");
  }

  const interleave = seededShuffle(seed, 28);
  let hidx = 0;
  let iidx = 0;
  for (const idx of interleave) {
    if (idx < 21) {
      result.push(hashChars[hidx++]);
      positions.push("hash");
    } else {
      result.push(idChars[iidx++]);
      positions.push("id");
    }
  }

  result.push(BASE36[rConfig]);
  positions.push("random");

  const fullCsv = result.join("");

  const decomposition = result.map((_ch, i) => ({
    pos: i,
    source: positions[i] as "hash" | "id" | "prefix" | "random",
  }));

  return {
    csv: fullCsv,
    prefix: CSV_PREFIX,
    hashPart: hashChars,
    idPart: idChars,
    randomnessConfig: rConfig,
    decomposition,
  };
}

export function parseCsv(csv: string): { isValid: boolean; prefix: string; hashPart: string; idPart: string; randomnessConfig: number } {
  if (csv.length !== 32) return { isValid: false, prefix: "", hashPart: "", idPart: "", randomnessConfig: 0 };
  if (csv.slice(0, 3) !== CSV_PREFIX) return { isValid: false, prefix: "", hashPart: "", idPart: "", randomnessConfig: 0 };

  const rConfig = parseInt(csv[31], 36);
  const interleave = seededShuffle(rConfig, 28);

  let hashChars = "";
  let idChars = "";
  let pos = 3;

  for (const idx of interleave) {
    if (idx < 21) {
      hashChars += csv[pos];
    } else {
      idChars += csv[pos];
    }
    pos++;
  }

  return {
    isValid: true,
    prefix: CSV_PREFIX,
    hashPart: hashChars,
    idPart: idChars,
    randomnessConfig: rConfig,
  };
}

export function verifyCsv(csv: string, { documentId, content }: CsvOptions): boolean {
  const parsed = parseCsv(csv);
  if (!parsed.isValid) return false;

  const expected = generateCsv({ documentId, content, randomnessSeed: parsed.randomnessConfig });
  return csv === expected.csv;
}
