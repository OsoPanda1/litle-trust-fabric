// LITLE — Vitest setup
// Cryptographic tests need TextEncoder
import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
