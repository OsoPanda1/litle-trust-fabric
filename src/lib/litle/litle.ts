// LITLE-512B: fixed-length 512-byte post-quantum-ready book signature container.
// See project spec §2. All offsets are big-endian.

export const LITLE_CONTAINER_SIZE_BYTES = 512;

export const LITLE_OFFSETS = {
  BLOCK_A_START: 0,
  BLOCK_A_END: 64, //   64B: BLAKE3-512 Merkle DAG hash of chapters
  BLOCK_B_START: 64,
  BLOCK_B_END: 128, //  64B: metadata (timestamp, version, flags, cover hash, reserved)
  BLOCK_C_START: 128,
  BLOCK_C_END: 256, // 128B: PQC author identity seed / public component
  BLOCK_D_START: 256,
  BLOCK_D_END: 512, // 256B: Dilithium5-condensed signature over A||B (HMAC placeholder here)
} as const;

export interface LitleMetadata {
  timestampUtcMs: bigint;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
  coverArtHash: Uint8Array; // exactly 32 bytes
  flags: number; // bitmask: 0x01 peer-reviewed, 0x02 commercial, 0x04 draft
}

export interface LitleUnpackedContainer {
  merkleAstHash: Uint8Array; // 64B
  metadata: LitleMetadata;
  pqcIdentitySeed: Uint8Array; // 128B
  dilithiumSignature: Uint8Array; // 256B
}

export class Litle512Engine {
  static packContainer(data: LitleUnpackedContainer): Uint8Array {
    if (data.merkleAstHash.length !== 64) throw new Error("Block A must be 64 bytes");
    if (data.metadata.coverArtHash.length !== 32) throw new Error("coverArtHash must be 32 bytes");
    if (data.pqcIdentitySeed.length !== 128) throw new Error("Block C must be 128 bytes");
    if (data.dilithiumSignature.length !== 256) throw new Error("Block D must be 256 bytes");

    const buf = new Uint8Array(LITLE_CONTAINER_SIZE_BYTES);
    const view = new DataView(buf.buffer);

    // A
    buf.set(data.merkleAstHash, LITLE_OFFSETS.BLOCK_A_START);

    // B
    const { timestampUtcMs, versionMajor, versionMinor, versionPatch, flags, coverArtHash } =
      data.metadata;
    view.setBigUint64(LITLE_OFFSETS.BLOCK_B_START, timestampUtcMs, false);
    view.setUint16(LITLE_OFFSETS.BLOCK_B_START + 8, versionMajor, false);
    view.setUint16(LITLE_OFFSETS.BLOCK_B_START + 10, versionMinor, false);
    view.setUint16(LITLE_OFFSETS.BLOCK_B_START + 12, versionPatch, false);
    view.setUint32(LITLE_OFFSETS.BLOCK_B_START + 14, flags, false);
    buf.set(coverArtHash, LITLE_OFFSETS.BLOCK_B_START + 18);
    // bytes 50..64 reserved (zero)

    // C, D
    buf.set(data.pqcIdentitySeed, LITLE_OFFSETS.BLOCK_C_START);
    buf.set(data.dilithiumSignature, LITLE_OFFSETS.BLOCK_D_START);

    return buf;
  }

  static unpackContainer(buffer: Uint8Array): LitleUnpackedContainer {
    if (buffer.length !== LITLE_CONTAINER_SIZE_BYTES) {
      throw new Error(`LITLE container must be 512 bytes, got ${buffer.length}`);
    }
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const merkleAstHash = buffer.slice(LITLE_OFFSETS.BLOCK_A_START, LITLE_OFFSETS.BLOCK_A_END);
    const timestampUtcMs = view.getBigUint64(LITLE_OFFSETS.BLOCK_B_START, false);
    const versionMajor = view.getUint16(LITLE_OFFSETS.BLOCK_B_START + 8, false);
    const versionMinor = view.getUint16(LITLE_OFFSETS.BLOCK_B_START + 10, false);
    const versionPatch = view.getUint16(LITLE_OFFSETS.BLOCK_B_START + 12, false);
    const flags = view.getUint32(LITLE_OFFSETS.BLOCK_B_START + 14, false);
    const coverArtHash = buffer.slice(
      LITLE_OFFSETS.BLOCK_B_START + 18,
      LITLE_OFFSETS.BLOCK_B_START + 50,
    );
    const pqcIdentitySeed = buffer.slice(LITLE_OFFSETS.BLOCK_C_START, LITLE_OFFSETS.BLOCK_C_END);
    const dilithiumSignature = buffer.slice(
      LITLE_OFFSETS.BLOCK_D_START,
      LITLE_OFFSETS.BLOCK_D_END,
    );
    return {
      merkleAstHash,
      metadata: {
        timestampUtcMs,
        versionMajor,
        versionMinor,
        versionPatch,
        flags,
        coverArtHash,
      },
      pqcIdentitySeed,
      dilithiumSignature,
    };
  }
}
