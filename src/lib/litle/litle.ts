export const LITLE_CONTAINER_CLASSIC = 512;
export const LITLE_CONTAINER_PQC = 8192;

export const LITLE_OFFSETS_CLASSIC = {
  BLOCK_A_START: 0,
  BLOCK_A_END: 64,
  BLOCK_B_START: 64,
  BLOCK_B_END: 128,
  BLOCK_C_START: 128,
  BLOCK_C_END: 256,
  BLOCK_D_START: 256,
  BLOCK_D_END: 512,
} as const;

export const LITLE_OFFSETS_PQC = {
  BLOCK_A_START: 0,
  BLOCK_A_END: 64,
  BLOCK_B_START: 64,
  BLOCK_B_END: 128,
  BLOCK_C_START: 128,
  BLOCK_C_END: 3200,
  BLOCK_D_START: 3200,
  BLOCK_D_END: 8192,
} as const;

export interface LitleMetadata {
  timestampUtcMs: bigint;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
  coverArtHash: Uint8Array;
  flags: number;
  pqcProfile?: number;
}

export type ContainerProfile = "classic" | "pqc";

export interface LitleUnpackedContainer {
  merkleAstHash: Uint8Array;
  metadata: LitleMetadata;
  pqcIdentitySeed: Uint8Array;
  dilithiumSignature: Uint8Array;
  containerProfile: ContainerProfile;
}

function getOffsets(profile: ContainerProfile) {
  return profile === "pqc" ? LITLE_OFFSETS_PQC : LITLE_OFFSETS_CLASSIC;
}

function getSize(profile: ContainerProfile) {
  return profile === "pqc" ? LITLE_CONTAINER_PQC : LITLE_CONTAINER_CLASSIC;
}

export class LitleContainerEngine {
  static packContainer(
    data: LitleUnpackedContainer,
    profile: ContainerProfile = "classic",
  ): Uint8Array {
    const ofs = getOffsets(profile);
    const size = getSize(profile);
    if (data.merkleAstHash.length !== 64) throw new Error("Block A must be 64 bytes");
    if (data.metadata.coverArtHash.length !== 32) throw new Error("coverArtHash must be 32 bytes");
    const cBlock = profile === "pqc" ? 3072 : 128;
    const dBlock = profile === "pqc" ? 4992 : 256;
    if (data.pqcIdentitySeed.length !== cBlock) throw new Error(`Block C must be ${cBlock} bytes`);
    if (data.dilithiumSignature.length !== dBlock) throw new Error(`Block D must be ${dBlock} bytes`);

    const buf = new Uint8Array(size);
    const view = new DataView(buf.buffer);

    buf.set(data.merkleAstHash, ofs.BLOCK_A_START);

    const { timestampUtcMs, versionMajor, versionMinor, versionPatch, flags, coverArtHash } = data.metadata;
    view.setBigUint64(ofs.BLOCK_B_START, timestampUtcMs, false);
    view.setUint16(ofs.BLOCK_B_START + 8, versionMajor, false);
    view.setUint16(ofs.BLOCK_B_START + 10, versionMinor, false);
    view.setUint16(ofs.BLOCK_B_START + 12, versionPatch, false);
    view.setUint32(ofs.BLOCK_B_START + 14, flags, false);
    if (profile === "pqc") {
      view.setUint8(ofs.BLOCK_B_START + 18, data.metadata.pqcProfile ?? 1);
    }
    buf.set(coverArtHash, ofs.BLOCK_B_START + 19);

    buf.set(data.pqcIdentitySeed, ofs.BLOCK_C_START);
    buf.set(data.dilithiumSignature, ofs.BLOCK_D_START);

    return buf;
  }

  static unpackContainer(
    buffer: Uint8Array,
  ): LitleUnpackedContainer {
    const profile: ContainerProfile = buffer.length === LITLE_CONTAINER_PQC ? "pqc" : "classic";
    const ofs = getOffsets(profile);

    if (buffer.length !== getSize(profile)) {
      throw new Error(`LITLE container must be ${getSize(profile)} bytes, got ${buffer.length}`);
    }
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const merkleAstHash = buffer.slice(ofs.BLOCK_A_START, ofs.BLOCK_A_END);
    const timestampUtcMs = view.getBigUint64(ofs.BLOCK_B_START, false);
    const versionMajor = view.getUint16(ofs.BLOCK_B_START + 8, false);
    const versionMinor = view.getUint16(ofs.BLOCK_B_START + 10, false);
    const versionPatch = view.getUint16(ofs.BLOCK_B_START + 12, false);
    const flags = view.getUint32(ofs.BLOCK_B_START + 14, false);
    const pqcProfile = profile === "pqc" ? view.getUint8(ofs.BLOCK_B_START + 18) : undefined;
    const coverArtHash = buffer.slice(ofs.BLOCK_B_START + 19, ofs.BLOCK_B_START + 51);
    const pqcIdentitySeed = buffer.slice(ofs.BLOCK_C_START, ofs.BLOCK_C_END);
    const dilithiumSignature = buffer.slice(ofs.BLOCK_D_START, ofs.BLOCK_D_END);

    return {
      merkleAstHash,
      metadata: {
        timestampUtcMs,
        versionMajor,
        versionMinor,
        versionPatch,
        flags,
        coverArtHash,
        pqcProfile,
      },
      pqcIdentitySeed,
      dilithiumSignature,
      containerProfile: profile,
    };
  }
}
