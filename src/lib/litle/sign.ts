import { blake3 } from "@noble/hashes/blake3";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha2.js";
import {
  Litle512Engine,
  type LitleMetadata,
  type LitleUnpackedContainer,
} from "./litle";
import {
  encodeLitleToCanonicalString,
  decodeCanonicalStringToLitle,
} from "./canonical";

const encoder = new TextEncoder();

/* -------------------------------------------------------------------------- */
/*                             CONSTANTES ESTRUCTURALES                        */
/* -------------------------------------------------------------------------- */

/**
 * Longitud de Bloque A y Bloque B en bytes.
 * LITLE-512 define dos bloques de 64 bytes (A y B) dentro del contenedor.
 */
export const LITLE_BLOCK_BYTES = 64;

/**
 * Dimensiones de los componentes criptográficos internos.
 */
export const MERKLE_AST_HASH_BYTES = 64; // 512 bits
export const COVER_ART_HASH_BYTES = 32;  // 256 bits
export const PQC_IDENTITY_SEED_BYTES = 128;
export const DILITHIUM_STANDIN_SIG_BYTES = 256;

/* -------------------------------------------------------------------------- */
/*              COMPARACIÓN CONSTANT-TIME (RESISTENCIA A TIMING ATTACKS)      */
/* -------------------------------------------------------------------------- */

/**
 * Comparación de buffers en tiempo constante (resistente a Timing Attacks).
 *
 * No realiza retorno temprano: siempre recorre el array completo
 * para evitar que la diferencia de tiempos filtre información
 * acerca del prefijo coincidente.
 */
export function constantTimeEquals(
  a: Uint8Array,
  b: Uint8Array,
): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/* -------------------------------------------------------------------------- */
/*                     MERKLE-DAG SOBRE EL TEXTO DE CAPÍTULOS                 */
/* -------------------------------------------------------------------------- */

/**
 * Construye la raíz del Merkle DAG (64 Bytes / 512 bits) sobre el listado ordenado de capítulos.
 *
 * - Hojas:        BLAKE3-512(texto_capítulo)
 * - Nodos internos: BLAKE3-512(izquierda || derecha)
 *
 * Árbol binario completo con duplicación del último nodo impar:
 * si existe número impar de nodos en una capa, el último se repite (left == right).
 *
 * Este valor se considera parte del API estable de LITLE: cualquier cambio
 * en el algoritmo de hashing invalidaría la compatibilidad binaria de contenedores.
 *
 * @param chapterTexts Lista ordenada de texto plano de capítulos.
 * @returns Raíz Merkle de 64 bytes destinada al Bloque A.
 */
export function merkleAstHash(chapterTexts: string[]): Uint8Array {
  if (chapterTexts.length === 0) {
    // Raíz canónica para la obra vacía (símbolo de conjunto vacío).
    return blake3(encoder.encode("∅"), { dkLen: MERKLE_AST_HASH_BYTES });
  }

  let layer = chapterTexts.map((text) =>
    blake3(encoder.encode(text), { dkLen: MERKLE_AST_HASH_BYTES }),
  );

  while (layer.length > 1) {
    const next: Uint8Array[] = [];

    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : left;

      const cat = new Uint8Array(left.length + right.length);
      cat.set(left, 0);
      cat.set(right, left.length);

      next.push(blake3(cat, { dkLen: MERKLE_AST_HASH_BYTES }));
    }

    layer = next;
  }

  return layer[0];
}

/* -------------------------------------------------------------------------- */
/*                      HUELLAS SECUNDARIAS (PORTADA, PQC)                    */
/* -------------------------------------------------------------------------- */

/**
 * Calcula la huella criptográfica de la portada (32 Bytes / 256 bits).
 *
 * La portada aquí es un “prompt” textual canónico, no la imagen en sí.
 * Este hash no está diseñado para reconstruir la portada, sólo para
 * vincular inequívocamente un prompt declarativo al contenedor LITLE.
 */
export function coverArtHash32(
  coverPrompt: string | null | undefined,
): Uint8Array {
  return blake3(encoder.encode(coverPrompt ?? ""), {
    dkLen: COVER_ART_HASH_BYTES,
  });
}

/**
 * Deriva la semilla de identidad PQC (128 Bytes) a partir de la clave privada del autor.
 *
 * Este mecanismo es un reemplazo determinista (surrogate) para el módulo FFI de Dilithium5.
 * El layout se define como:
 *
 *   seed = BLAKE3-512("litle-pqc-seed-A|" + secret) ||
 *          BLAKE3-512("litle-pqc-seed-B|" + secret)
 *
 * Cualquier backend PQC que reemplace este módulo debe respetar la longitud total
 * (128 bytes), aunque puede ignorar internamente esta derivación.
 */
export function derivePqcSeed(authorSecret: string): Uint8Array {
  const a = blake3(
    encoder.encode(`litle-pqc-seed-A|${authorSecret}`),
    { dkLen: 64 },
  );
  const b = blake3(
    encoder.encode(`litle-pqc-seed-B|${authorSecret}`),
    { dkLen: 64 },
  );

  const out = new Uint8Array(PQC_IDENTITY_SEED_BYTES);
  out.set(a, 0);
  out.set(b, 64);
  return out;
}

/* -------------------------------------------------------------------------- */
/*                      FIRMA CONDENSADA (STAND-IN DILITHIUM)                 */
/* -------------------------------------------------------------------------- */

/**
 * Firma condensada de 256 Bytes sobre (Bloque A || Bloque B).
 *
 * Utiliza encadenamiento HMAC-SHA-512 como surrogate compatible con
 * una firma por reticulados tipo Dilithium5. La estructura de datos
 * (longitud y posición de la firma) es isomórfica al diseño final PQC.
 *
 * Definición:
 *   msg := blockA || blockB
 *   key := "litle-dilithium5-key|" || authorSecret
 *
 *   s1 := HMAC-SHA-512(key, msg)
 *   s2 := HMAC-SHA-512(key, s1)
 *   s3 := HMAC-SHA-512(key, s2)
 *   s4 := HMAC-SHA-512(key, s3)
 *
 *   signature := s1 || s2 || s3 || s4   (256 bytes)
 */
export function condensedSignature(
  blockA: Uint8Array,
  blockB: Uint8Array,
  authorSecret: string,
): Uint8Array {
  const msg = new Uint8Array(blockA.length + blockB.length);
  msg.set(blockA, 0);
  msg.set(blockB, blockA.length);

  const key = encoder.encode(`litle-dilithium5-key|${authorSecret}`);

  const s1 = hmac(sha512, key, msg); // 64B
  const s2 = hmac(sha512, key, s1);  // 64B
  const s3 = hmac(sha512, key, s2);  // 64B
  const s4 = hmac(sha512, key, s3);  // 64B

  const out = new Uint8Array(DILITHIUM_STANDIN_SIG_BYTES);
  out.set(s1, 0);
  out.set(s2, 64);
  out.set(s3, 128);
  out.set(s4, 192);

  return out;
}

/* -------------------------------------------------------------------------- */
/*                             TIPOS DE ENTRADA/SALIDA                        */
/* -------------------------------------------------------------------------- */

export interface SignInput {
  /**
   * Secuencia ordenada de textos de capítulos (incluyendo prólogos, apéndices, etc.).
   * La posición en el array es semánticamente relevante.
   */
  chapterTexts: string[];

  /**
   * Prompt canónico de portada (opcional).
   */
  coverPrompt: string | null | undefined;

  /**
   * Versión semántica del estándar LITLE aplicada a este contenedor.
   */
  version: { major: number; minor: number; patch: number };

  /**
   * Campo de flags de 32 bits reservado para extensiones (bitfield).
   */
  flags: number;

  /**
   * Clave secreta soberana del autor.
   * Debe ser estable por autor y almacenada únicamente en infraestructura de confianza.
   */
  authorSecret: string;
}

export interface SignOutput {
  /**
   * Contenedor binario LITLE-512 (layout de 512 bytes).
   */
  container: Uint8Array;

  /**
   * Representación canónica textual (prefijo 'litle1...').
   */
  canonical: string;

  /**
   * Vista desempaquetada de los bloques y metadatos.
   */
  unpacked: LitleUnpackedContainer;
}

/* -------------------------------------------------------------------------- */
/*                 CONSTRUCCIÓN Y EMISIÓN DEL CONTENEDOR LITLE-512            */
/* -------------------------------------------------------------------------- */

/**
 * Construye, emite y firma el contenedor inmutable LITLE-512B para una obra.
 *
 * Pipeline:
 *   1. Calcula Bloque A (merkleAstHash sobre chapterTexts).
 *   2. Construye metadatos (Bloque B) con campos de versión, timestamp, portada y flags.
 *   3. Empaqueta un contenedor "scratch" con PQC y firma en cero para obtener
 *      la imagen exacta de Bloque B (offset 64..128).
 *   4. Deriva la semilla PQC determinista a partir de authorSecret.
 *   5. Calcula la firma condensada (HMAC stand-in) sobre (A || B).
 *   6. Empaqueta el contenedor definitivo y genera la forma canónica textual.
 */
export function buildLitleSignature(input: SignInput): SignOutput {
  const blockA = merkleAstHash(input.chapterTexts);

  const metadata: LitleMetadata = {
    timestampUtcMs: BigInt(Date.now()),
    versionMajor: input.version.major,
    versionMinor: input.version.minor,
    versionPatch: input.version.patch,
    coverArtHash: coverArtHash32(input.coverPrompt),
    flags: input.flags,
  };

  // 1. Contenedor de trabajo para extraer Bloque B exacto (offset 64..128).
  const scratch = Litle512Engine.packContainer({
    merkleAstHash: blockA,
    metadata,
    pqcIdentitySeed: new Uint8Array(PQC_IDENTITY_SEED_BYTES),
    dilithiumSignature: new Uint8Array(DILITHIUM_STANDIN_SIG_BYTES),
  });

  const blockB = scratch.slice(LITLE_BLOCK_BYTES, LITLE_BLOCK_BYTES * 2);

  // 2. Derivación PQC y firma stand-in.
  const pqcSeed = derivePqcSeed(input.authorSecret);
  const sig = condensedSignature(blockA, blockB, input.authorSecret);

  const unpacked: LitleUnpackedContainer = {
    merkleAstHash: blockA,
    metadata,
    pqcIdentitySeed: pqcSeed,
    dilithiumSignature: sig,
  };

  const container = Litle512Engine.packContainer(unpacked);
  const canonical = encodeLitleToCanonicalString(container);

  return { container, canonical, unpacked };
}

/* -------------------------------------------------------------------------- */
/*                     VERIFICACIÓN SOBRE CANÓNICO Y BINARIO                  */
/* -------------------------------------------------------------------------- */

/**
 * Verifica la autenticidad e integridad de una cadena canónica 'litle1...'
 * frente a una clave secreta de autor.
 *
 * Este procedimiento:
 *   1. Decodifica la cadena canónica a su representación binaria.
 *   2. Invoca verifyLitleBytes para recomputar la firma condensada.
 */
export function verifyLitleSignature(
  canonical: string,
  authorSecret: string,
): boolean {
  try {
    const bytes = decodeCanonicalStringToLitle(canonical);
    return verifyLitleBytes(bytes, authorSecret);
  } catch {
    return false;
  }
}

/**
 * Verifica la validez criptográfica de un buffer binario LITLE de 512 Bytes.
 *
 * Se re-deriva la firma condensada (HMAC stand-in) a partir de:
 *   - Bloque A (merkleAstHash)
 *   - Bloque B (offset 64..128 del contenedor)
 *
 * y se compara en tiempo constante con la firma almacenada.
 */
export function verifyLitleBytes(
  bytes: Uint8Array,
  authorSecret: string,
): boolean {
  try {
    const unpacked = Litle512Engine.unpackContainer(bytes);
    const blockA = unpacked.merkleAstHash;
    const blockB = bytes.slice(LITLE_BLOCK_BYTES, LITLE_BLOCK_BYTES * 2);

    const expectedSig = condensedSignature(blockA, blockB, authorSecret);
    return constantTimeEquals(expectedSig, unpacked.dilithiumSignature);
  } catch {
    return false;
  }
}
