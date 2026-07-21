import { bech32m } from "bech32";

const CLASSIC_BYTES = 512;
const PQC_BYTES = 8192;
const PQC_WORD_COUNT = Math.ceil((PQC_BYTES * 8) / 5) + 100;

function getLimit(bytesLen: number): number {
  return bytesLen === PQC_BYTES ? PQC_WORD_COUNT : 2048;
}

export function encodeLitleToCanonicalString(litleBytes: Uint8Array): string {
  const valid = [CLASSIC_BYTES, PQC_BYTES];
  if (!valid.includes(litleBytes.length)) {
    throw new Error(`LITLE payload must be ${CLASSIC_BYTES} or ${PQC_BYTES} bytes, got ${litleBytes.length}`);
  }
  const limit = getLimit(litleBytes.length);
  const words = bech32m.toWords(litleBytes);
  return bech32m.encode("litle", words, limit);
}

export function decodeCanonicalStringToLitle(canonicalStr: string): Uint8Array {
  const limit = canonicalStr.length > 2000 ? PQC_WORD_COUNT : 2048;
  const decoded = bech32m.decode(canonicalStr, limit);
  if (decoded.prefix !== "litle") throw new Error(`Unknown LITLE prefix: ${decoded.prefix}`);
  const bytes = new Uint8Array(bech32m.fromWords(decoded.words));
  const valid = [CLASSIC_BYTES, PQC_BYTES];
  if (!valid.includes(bytes.length)) {
    throw new Error(`Corrupt LITLE payload: ${bytes.length}B`);
  }
  return bytes;
}
