// ────────────────────────────────────────────────────────────────
// Isabella.Library — Publish Engine
// Publicación en marketplaces (KDP, Google Books, Lulu)
// ────────────────────────────────────────────────────────────────

import type { BookStructure } from "../types";

export interface PublishEngine {
  submit(book: BookStructure, pdfPath: string, destination: string): Promise<boolean>;
  validateMetadata(book: BookStructure): { valid: boolean; errors: string[] };
  generateIsbn(): string;
}

export type Publisher = {
  id: string;
  name: string;
  apiRequired: boolean;
};

const PUBLISHERS: Publisher[] = [
  { id: "kdp", name: "Amazon KDP", apiRequired: true },
  { id: "google-books", name: "Google Books", apiRequired: true },
  { id: "lulu", name: "Lulu Press", apiRequired: true },
  { id: "internal", name: "TAMV Marketplace", apiRequired: false },
];

export function createPublishEngine(): PublishEngine {
  return {
    validateMetadata(book: BookStructure): { valid: boolean; errors: string[] } {
      const errors: string[] = [];
      if (!book.title || book.title.length < 3) errors.push("Title must be at least 3 characters");
      if (!book.author) errors.push("Author is required");
      if (!book.chapters || book.chapters.length === 0) errors.push("Book must have at least one chapter");
      if (!book.abstract) errors.push("Abstract is required");
      return { valid: errors.length === 0, errors };
    },

    generateIsbn(): string {
      const prefix = "978"; // ISBN-13 prefix
      const reg = "607"; // Mexico registration agency
      const pub = String(Date.now()).slice(-5);
      const checksum = String(Math.floor(Math.random() * 9) + 1);
      return `${prefix}-${reg}-${pub}-${checksum}`;
    },

    async submit(book: BookStructure, pdfPath: string, destination: string): Promise<boolean> {
      const validation = this.validateMetadata(book);
      if (!validation.valid) {
        console.error("Validation failed:", validation.errors.join(", "));
        return false;
      }

      const publisher = PUBLISHERS.find((p) => destination.includes(p.id) || p.id === destination);
      if (!publisher) {
        console.error(`Unknown publisher: ${destination}`);
        return false;
      }

      // Simulate API call
      console.log(`Publishing "${book.title}" to ${publisher.name}`);
      console.log(`  ISBN: ${this.generateIsbn()}`);
      console.log(`  PDF: ${pdfPath}`);
      console.log(`  Chapters: ${book.chapters.length}`);
      console.log(`  Sources: ${book.chapters.reduce((s, ch) => s + ch.documents.length, 0)}`);

      return true;
    },
  };
}

export function listPublishers(): Publisher[] {
  return PUBLISHERS;
}
