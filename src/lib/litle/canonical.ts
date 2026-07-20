import { bech32m } from "bech32";

// Encode the 512-byte LITLE container as the canonical `litle1...` string
// (Bech32m) used on cover, legal page, database column and marketplace UI.
export function encodeLitleToCanonicalString(litleBytes: Uint8Array): string {
  if (litleBytes.length !== 512) throw new Error("LITLE payload must be 512 bytes");
  const words = bech32m.toWords(litleBytes);
  return bech32m.encode("litle", words, 2048);
}

export function decodeCanonicalStringToLitle(canonicalStr: string): Uint8Array {
  const decoded = bech32m.decode(canonicalStr, 2048);
  if (decoded.prefix !== "litle") throw new Error(`Unknown LITLE prefix: ${decoded.prefix}`);
  const bytes = new Uint8Array(bech32m.fromWords(decoded.words));
  if (bytes.length !== 512) throw new Error(`Corrupt LITLE payload: ${bytes.length}B`);
  return bytes;
}
