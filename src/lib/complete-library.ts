import { z } from "zod";

/**
 * Bibliothèque pédagogique originale (public/programme).
 * Contenu original : aucun extrait de manuel protégé du CNP n'est reproduit.
 * Tout élément importé est créé en brouillon et doit être validé par un humain.
 */

export const AVERTISSEMENT_VALIDATION =
  "Contenu original à vérifier : chaque cours et chaque évaluation est importé en brouillon. Une validation humaine par l'enseignant est obligatoire avant publication aux élèves.";

const manifestSchema = z.object({
  nom: z.string(),
  version: z.string(),
  licence: z.string(),
  avertissement: z.string(),
  niveaux: z.number(),
  trimestres: z.number(),
  modules: z.number(),
  lecons: z.number(),
  textes: z.number(),
  dictees: z.number(),
  exercices: z.number(),
  illustrations: z.number(),
  evaluations: z.number(),
});

const exerciceSchema = z.object({
  id: z.string(),
  lesson_id: z.string(),
  type: z.string(),
  points: z.number(),
  consigne: z.string(),
  enonce: z.string(),
  competence: z.string().optional(),
  correction: z.enum(["auto", "enseignant"]).optional(),
  feedback_ok: z.string().optional(),
  feedback_ko: z.string().optional(),
  illustration: z.string().optional(),
  options: z.array(z.string()).optional(),
  segments: z.array(z.string()).optional(),
  reponse_correcte: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
});

const texteSchema = z.object({
  id: z.string(),
  grade: z.number(),
  module_no: z.number(),
  trimestre: z.number(),
  titre: z.string(),
  genre: z.string(),
  contenu: z.string(),
  questions_comprehension: z.array(z.string()),
});

const dicteeSchema = z.object({
  id: z.string(),
  grade: z.number(),
  module_no: z.number(),
  trimestre: z.number(),
  titre: z.string(),
  mots_a_preparer: z.array(z.string()),
  texte: z.string(),
  points_de_vigilance: z.array(z.string()),
});

const lessonSchema = z.object({
  id: z.string(),
  grade: z.number(),
  module_no: z.number(),
  module_titre: z.string(),
  trimestre: z.number(),
  seance_no: z.number(),
  matiere: z.string(),
  titre: z.string(),
  resume: z.string(),
  objectifs: z.array(z.string()),
  illustration: z.string(),
  texte_id: z.string().nullable(),
  dictee_id: z.string().nullable(),
  deroule: z.array(z.string()),
  exercice_ids: z.array(z.string()),
  duree_minutes: z.number(),
  cours: z
    .object({
      introduction: z.string(),
      explication: z.string(),
      exemples: z.array(z.string()),
      trace: z.string(),
      differenciation: z.array(z.string()),
    })
    .optional(),
  module: z
    .object({
      theme: z.string(),
      objectifs_communication: z.array(z.string()),
      structures: z.array(z.string()),
      lexique: z.array(z.string()),
      projet_ecriture: z.string(),
      criteres: z.array(z.string()),
      etude_langue: z.object({
        grammaire: z.array(z.string()),
        conjugaison: z.array(z.string()),
        orthographe: z.array(z.string()),
        vocabulaire: z.array(z.string()),
      }),
    })
    .optional(),
});

const questionSchema = z.object({
  ordre: z.number(),
  type: z.string(),
  enonce: z.string(),
  options: z.array(z.string()),
  reponse_correcte: z.string().nullable(),
  points: z.number(),
  image_url: z.string(),
});

const assessmentSchema = z.object({
  id: z.string(),
  grade: z.number(),
  module_no: z.number(),
  trimestre: z.number(),
  type: z.string(),
  titre: z.string(),
  consignes: z.string(),
  matiere: z.string(),
  duree_minutes: z.number(),
  competences: z.array(z.string()),
  anti_cheat: z.record(z.union([z.boolean(), z.number()])),
  questions: z.array(questionSchema).min(1),
});

const librarySchema = z.object({
  manifest: manifestSchema,
  lessons: z.array(lessonSchema),
  textes: z.array(texteSchema),
  dictees: z.array(dicteeSchema),
  exercices: z.array(exerciceSchema),
});

const assessmentsFileSchema = z.object({
  manifest: manifestSchema,
  assessments: z.array(assessmentSchema),
});

export type BibliothequeLecon = z.infer<typeof lessonSchema>;
export type BibliothequeExercice = z.infer<typeof exerciceSchema>;
export type BibliothequeTexte = z.infer<typeof texteSchema>;
export type BibliothequeDictee = z.infer<typeof dicteeSchema>;
export type BibliothequeEvaluation = z.infer<typeof assessmentSchema>;
export type BibliothequeManifest = z.infer<typeof manifestSchema>;

export type Bibliotheque = {
  manifest: BibliothequeManifest;
  lessons: BibliothequeLecon[];
  textes: BibliothequeTexte[];
  dictees: BibliothequeDictee[];
  exercices: BibliothequeExercice[];
  assessments: BibliothequeEvaluation[];
  avertissements: string[];
};

let cache: Bibliotheque | null = null;

/** Charge et valide la bibliothèque, en vérifiant les références images/exercices. */
export async function chargerBibliotheque(): Promise<Bibliotheque> {
  if (cache) return cache;
  const [libRes, evalRes] = await Promise.all([
    fetch("/programme/course_library.json"),
    fetch("/programme/assessments.json"),
  ]);
  if (!libRes.ok || !evalRes.ok) throw new Error("Bibliothèque introuvable dans /programme.");
  const lib = librarySchema.parse(await libRes.json());
  const evals = assessmentsFileSchema.parse(await evalRes.json());

  const avertissements: string[] = [];
  const exoIds = new Set(lib.exercices.map((e) => e.id));
  const texteIds = new Set(lib.textes.map((t) => t.id));
  const dicteeIds = new Set(lib.dictees.map((d) => d.id));

  for (const l of lib.lessons) {
    if (
      !l.illustration.startsWith("/programme/assets/illustrations/") ||
      !l.illustration.endsWith(".svg")
    )
      avertissements.push(`Illustration invalide pour ${l.id}.`);
    for (const id of l.exercice_ids)
      if (!exoIds.has(id)) avertissements.push(`Exercice manquant ${id} (leçon ${l.id}).`);
    if (l.texte_id && !texteIds.has(l.texte_id))
      avertissements.push(`Texte manquant ${l.texte_id} (leçon ${l.id}).`);
    if (l.dictee_id && !dicteeIds.has(l.dictee_id))
      avertissements.push(`Dictée manquante ${l.dictee_id} (leçon ${l.id}).`);
  }
  for (const a of evals.assessments) {
    for (const q of a.questions) {
      if (q.type === "qcm" && q.options.length < 2)
        avertissements.push(`Question ${q.ordre} de ${a.id} : options insuffisantes.`);
      if (!q.image_url.startsWith("/programme/assets/illustrations/"))
        avertissements.push(`Question ${q.ordre} de ${a.id} : image invalide.`);
    }
  }

  cache = { ...lib, assessments: evals.assessments, avertissements };
  return cache;
}

/** Contenu Markdown d'une leçon de la bibliothèque. */
export function contenuBibliotheque(
  lecon: BibliothequeLecon,
  exercices: BibliothequeExercice[],
  texte: BibliothequeTexte | undefined,
  dictee: BibliothequeDictee | undefined,
): string {
  const exos = exercices.filter((e) => lecon.exercice_ids.includes(e.id));
  return [
    `![${lecon.titre}](${lecon.illustration})`,
    "",
    `> ${AVERTISSEMENT_VALIDATION}`,
    "",
    "## Objectifs d'apprentissage",
    ...lecon.objectifs.map((o) => `- ${o}`),
    "",
    "## Déroulé de la séance",
    ...lecon.deroule.map((d, i) => `${i + 1}. ${d}`),
    ...(texte
      ? [
          "",
          `## Support de lecture — ${texte.titre} (${texte.genre})`,
          "",
          texte.contenu,
          "",
          "### Questions de compréhension",
          ...texte.questions_comprehension.map((q, i) => `${i + 1}. ${q}`),
        ]
      : []),
    ...(dictee
      ? [
          "",
          `## ${dictee.titre}`,
          `Mots à préparer : ${dictee.mots_a_preparer.join(", ")}`,
          "",
          dictee.texte,
          "",
          `Vigilance : ${dictee.points_de_vigilance.join(" ; ")}`,
        ]
      : []),
    "",
    "## Exercices",
    ...exos.map(
      (e, i) =>
        `${i + 1}. **${e.consigne}** ${e.enonce}${e.options?.length ? `\n   - ${e.options.join("\n   - ")}` : ""}`,
    ),
    "",
    "## Trace écrite",
    `Recopie la règle de la séance et illustre-la par deux exemples liés au thème « ${lecon.module_titre} ».`,
  ].join("\n");
}

/** Clé d'idempotence : professeur, classe, niveau, trimestre et titre. */
export function cleImport(
  profId: string,
  classId: string | null,
  niveau: number,
  trimestre: number,
  titre: string,
): string {
  return [profId, classId ?? "sans-classe", niveau, trimestre, titre.trim().toLowerCase()].join(
    "|",
  );
}
