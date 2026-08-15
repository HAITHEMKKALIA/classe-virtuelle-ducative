import { describe, expect, it, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import { chargerBibliotheque, cleImport, contenuBibliotheque } from "./complete-library";

const lire = (p: string) =>
  JSON.parse(readFileSync(new URL(`../../public/programme/${p}`, import.meta.url), "utf8"));

beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    const nom = String(url).replace("/programme/", "");
    return { ok: true, json: async () => lire(nom) } as Response;
  });
});

describe("bibliothèque complète", () => {
  it("respecte les quantités annoncées", async () => {
    const b = await chargerBibliotheque();
    expect(b.manifest.niveaux).toBe(2);
    expect(b.manifest.modules).toBe(16);
    expect(b.lessons).toHaveLength(128);
    expect(b.textes).toHaveLength(64);
    expect(b.dictees).toHaveLength(32);
    expect(b.exercices).toHaveLength(512);
    expect(b.assessments).toHaveLength(32);
  });

  it("ne contient aucune référence d'image ou d'exercice cassée", async () => {
    const b = await chargerBibliotheque();
    expect(b.avertissements).toEqual([]);
  });

  it("fournit une illustration SVG existante pour chaque leçon", async () => {
    const b = await chargerBibliotheque();
    for (const l of b.lessons.slice(0, 20)) {
      const svg = readFileSync(new URL(`../../public${l.illustration}`, import.meta.url), "utf8");
      expect(svg.startsWith("<svg")).toBe(true);
    }
  });

  it("génère un contenu de cours avec l'avertissement de validation humaine", async () => {
    const b = await chargerBibliotheque();
    const l = b.lessons[0]!;
    const md = contenuBibliotheque(
      l,
      b.exercices,
      b.textes.find((t) => t.id === l.texte_id),
      b.dictees.find((d) => d.id === l.dictee_id),
    );
    expect(md).toContain("validation humaine");
    expect(md).toContain(l.illustration);
  });

  it("n'expose jamais les corrigés dans le contenu élève d'une évaluation", async () => {
    const b = await chargerBibliotheque();
    for (const a of b.assessments) {
      for (const q of a.questions) {
        expect(Object.keys(q)).toContain("reponse_correcte");
        // Le corrigé n'apparaît pas dans l'énoncé lui-même.
        if (q.reponse_correcte && q.type !== "qcm") {
          expect(q.enonce.includes(q.reponse_correcte)).toBe(false);
        }
      }
    }
  });
});

describe("idempotence de l'import", () => {
  it("distingue professeur, classe, niveau, trimestre et titre", () => {
    const a = cleImport("prof-1", "classe-1", 5, 1, "Grammaire — Module 1");
    expect(cleImport("prof-1", "classe-1", 5, 1, "  grammaire — module 1 ")).toBe(a);
    expect(cleImport("prof-2", "classe-1", 5, 1, "Grammaire — Module 1")).not.toBe(a);
    expect(cleImport("prof-1", null, 5, 1, "Grammaire — Module 1")).not.toBe(a);
    expect(cleImport("prof-1", "classe-1", 6, 1, "Grammaire — Module 1")).not.toBe(a);
    expect(cleImport("prof-1", "classe-1", 5, 2, "Grammaire — Module 1")).not.toBe(a);
  });
});
