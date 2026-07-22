// ────────────────────────────────────────────────────────────────
// Isabella.Library — Organize Engine
// Clasificación semántica, estructuración en capítulos
// ────────────────────────────────────────────────────────────────

import type { DocumentMeta, Chapter, BookStructure } from "../types";

export interface OrganizeEngine {
  classify(files: DocumentMeta[], bookTitle: string): Promise<BookStructure>;
  proposeStructure(files: DocumentMeta[]): Promise<Chapter[]>;
  reclassify(doc: DocumentMeta, targetChapter: number, current: BookStructure): BookStructure;
}

const CHAPTER_TOPICS: [RegExp, string][] = [
  [/tamv|territorio|memoria viva|ecosistema/i, "Fundamentos del Ecosistema TAMV"],
  [/constitución|constitucion|libro|ley|norma|reglamento/i, "Marco Constitucional y Normativo"],
  [/ética|etica|código|conducta|moral|valores/i, "Ética y Principios"],
  [/arquitectura|técnico|technical|infraestructura|backend/i, "Arquitectura Técnica"],
  [/seguridad|crypto|cryptografía|post.cuántica|pqc|mexa|firma/i, "Seguridad y Criptografía"],
  [/isabella|villaseñor|soul|kernel|agente|agent/i, "Isabella Villaseñor AI — Núcleo"],
  [/library|biblioteca|librarian|ingesta|compilación|libro/i, "Motor Bibliotecario AI"],
  [/educación|education|utamv|campus|curso|master|aprendizaje/i, "Educación y UTAMV"],
  [/rdm|real del monte|turismo|cultura|territorio|hidalgo/i, "RDM Digital Hub — Territorio"],
  [/api|endpoint|sdk|integración|integration|cliente|client/i, "APIs e Integraciones"],
  [/gobernanza|governance|fed|federación|dao|scao|quorum/i, "Gobernanza y Federaciones"],
  [/roadmap|fase|futuro|próximo|próximos|vision|2026|2027/i, "Roadmap y Visión Futura"],
];

export function createOrganizeEngine(): OrganizeEngine {
  return {
    async classify(files: DocumentMeta[], bookTitle: string): Promise<BookStructure> {
      const chapters = await this.proposeStructure(files);
      return {
        title: bookTitle,
        author: "Edwin Oswaldo Castillo Trejo",
        abstract: `Libro compilado por Isabella Villaseñor AI™ a partir de ${files.length} documentos del ecosistema TAMV.`,
        chapters,
      };
    },

    async proposeStructure(files: DocumentMeta[]): Promise<Chapter[]> {
      const chapterMap = new Map<string, DocumentMeta[]>();
      const order: string[] = [];

      for (const file of files) {
        let assigned = false;
        for (const [pattern, chapterName] of CHAPTER_TOPICS) {
          if (pattern.test(file.title ?? "") || pattern.test(file.path)) {
            if (!chapterMap.has(chapterName)) {
              chapterMap.set(chapterName, []);
              order.push(chapterName);
            }
            chapterMap.get(chapterName)!.push(file);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          const fallback = "Documentación General";
          if (!chapterMap.has(fallback)) { chapterMap.set(fallback, []); order.push(fallback); }
          chapterMap.get(fallback)!.push(file);
        }
      }

      return order.map((title, i) => {
        const docs = chapterMap.get(title)!.sort((a, b) => a.modified.getTime() - b.modified.getTime());
        return { number: i + 1, title, documents: docs };
      });
    },

    reclassify(doc: DocumentMeta, targetChapter: number, current: BookStructure): BookStructure {
      const chapters = current.chapters.map((ch) => ({
        ...ch,
        documents: ch.documents.filter((d) => d.path !== doc.path),
      }));

      if (targetChapter >= 1 && targetChapter <= chapters.length) {
        chapters[targetChapter - 1].documents.push(doc);
      }

      return { ...current, chapters };
    },
  };
}
