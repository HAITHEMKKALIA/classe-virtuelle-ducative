// Convertit la bibliothèque officielle fournie (schema 2.0.0) au format interne
// de l'application et régénère les 128 illustrations SVG originales.
// Exécution : bun scripts/import-official-library.mjs <dossier-source>
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";

const SRC = process.argv[2] ?? "/mnt/user-uploads";
const OUT = new URL("../public/programme/", import.meta.url).pathname;
const ILLU = `${OUT}assets/illustrations/`;

const source = JSON.parse(readFileSync(`${SRC}/course_library.json`, "utf8"));
const sourceEvals = JSON.parse(readFileSync(`${SRC}/assessments.json`, "utf8"));

rmSync(OUT.replace(/\/$/, ""), { recursive: true, force: true });
mkdirSync(ILLU, { recursive: true });

/** Matière dominante de chacune des 8 séances hebdomadaires. */
const MATIERE_JOUR = {
  1: "expression_orale",
  2: "lecture",
  3: "conjugaison",
  4: "expression_ecrite",
  5: "orthographe",
  6: "vocabulaire",
  7: "expression_ecrite",
  8: "lecture",
};

const PALETTE = {
  expression_orale: ["#0f2d4a", "#f5a524"],
  lecture: ["#123a2e", "#5ecfa6"],
  grammaire: ["#2a1c4a", "#a78bfa"],
  conjugaison: ["#4a1c22", "#fb7185"],
  orthographe: ["#123049", "#38bdf8"],
  vocabulaire: ["#3f2a10", "#fbbf24"],
  expression_ecrite: ["#0d3b3b", "#2dd4bf"],
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg(titre, sousTitre, matiere) {
  const [bg, accent] = PALETTE[matiere] ?? PALETTE.lecture;
  const mots = String(titre).split(" ");
  const l1 = mots.slice(0, 4).join(" ");
  const l2 = mots.slice(4, 9).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img" aria-label="${esc(titre)}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="${accent}" stop-opacity="0.85"/>
  </linearGradient></defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <circle cx="660" cy="90" r="120" fill="#ffffff" opacity="0.08"/>
  <circle cx="120" cy="430" r="150" fill="#ffffff" opacity="0.06"/>
  <rect x="56" y="330" width="180" height="10" rx="5" fill="${accent}"/>
  <text x="56" y="180" fill="#ffffff" font-family="Georgia, serif" font-size="46" font-weight="700">${esc(l1)}</text>
  ${l2 ? `<text x="56" y="236" fill="#ffffff" font-family="Georgia, serif" font-size="46" font-weight="700">${esc(l2)}</text>` : ""}
  <text x="56" y="300" fill="#ffffff" opacity="0.85" font-family="Helvetica, Arial, sans-serif" font-size="24">${esc(sousTitre)}</text>
  <text x="56" y="420" fill="#ffffff" opacity="0.7" font-family="Helvetica, Arial, sans-serif" font-size="20">Ma Classe de Français TN — contenu original</text>
</svg>`;
}

const QCM = new Set(["multiple_choice", "reading_mcq", "mixed_quiz", "error_classification"]);
const REDACTION = new Set([
  "long_answer",
  "writing_plan",
  "submission",
  "voice_recording",
  "reading_aloud",
  "peer_review",
  "self_assessment",
  "remediation_path",
  "image_prompt",
  "dictation",
]);

const typeQuestion = (t) => (QCM.has(t) ? "qcm" : REDACTION.has(t) ? "texte" : "court");

/** Options et corrigé normalisés depuis le bloc "answer" de la source. */
function normaliserReponse(ex) {
  const a = ex.answer ?? {};
  if (Array.isArray(a.options)) {
    const options = a.options.map(String);
    const idx = typeof a.correct_index === "number" ? a.correct_index : -1;
    return { options, reponse: options[idx] ?? null };
  }
  if (Array.isArray(a.pairs))
    return {
      options: a.pairs.map((p) => `${p.left ?? p[0]} → ${p.right ?? p[1]}`),
      reponse: a.pairs.map((p) => `${p.left ?? p[0]} = ${p.right ?? p[1]}`).join(" ; "),
    };
  if (Array.isArray(a.correct_order))
    return { options: (a.items ?? []).map(String), reponse: a.correct_order.join(" → ") };
  if (Array.isArray(a.expected)) return { options: [], reponse: a.expected.join(" ; ") };
  if (Array.isArray(a.items)) return { options: a.items.map(String), reponse: null };
  if (typeof a.expected === "string") return { options: [], reponse: a.expected };
  if (typeof a.correct === "string") return { options: [], reponse: a.correct };
  return { options: [], reponse: null };
}

const chemin = (img) => `/programme/${String(img).replace(/^\/?/, "")}`;

const lessons = [];
const textes = [];
const dictees = [];
const exercices = [];
const exoParId = new Map();
const illustrations = new Set();

for (const niveau of source.levels) {
  const grade = niveau.grade;
  for (const mod of niveau.modules) {
    for (const r of mod.readings) {
      textes.push({
        id: r.id,
        grade,
        module_no: mod.number,
        trimestre: mod.trimester,
        titre: r.title,
        genre: r.type,
        contenu: r.content,
        questions_comprehension: mod.reading_skills,
      });
    }
    for (const d of mod.dictations) {
      dictees.push({
        id: d.id,
        grade,
        module_no: mod.number,
        trimestre: mod.trimester,
        titre: `Dictée ${d.level === "guided" ? "guidée" : "autonome"} — module ${mod.number}`,
        mots_a_preparer: mod.vocabulary_fields,
        texte: d.text,
        points_de_vigilance: mod.language_study.orthography,
      });
    }
    for (const l of mod.lessons) {
      const matiere = MATIERE_JOUR[l.day] ?? "lecture";
      const illustration = chemin(l.image);
      illustrations.add(illustration);
      writeFileSync(
        `${OUT}${illustration.replace("/programme/", "")}`,
        svg(l.title, `${grade}ᵉ année — Module ${mod.number} — ${mod.title}`, matiere),
      );
      for (const ex of l.exercises) {
        const { options, reponse } = normaliserReponse(ex);
        const enonce = Array.isArray(ex.prompt)
          ? ex.prompt
              .map((p) => (typeof p === "string" ? p : Object.values(p).join(" → ")))
              .join(" | ")
          : String(ex.prompt ?? "");
        const e = {
          id: ex.id,
          lesson_id: l.id,
          type: ex.type,
          points: Math.max(1, Number(ex.difficulty) || 1),
          consigne: ex.instruction,
          enonce,
          competence: ex.competence,
          correction: ex.review_mode === "automatic" ? "auto" : "enseignant",
          feedback_ok: ex.feedback?.correct ?? "",
          feedback_ko: ex.feedback?.incorrect ?? "",
          illustration: (ex.media_refs ?? []).map(chemin)[0] ?? illustration,
          options,
          reponse_correcte: reponse,
        };
        exercices.push(e);
        exoParId.set(e.id, e);
      }
      lessons.push({
        id: l.id,
        grade,
        module_no: mod.number,
        module_titre: mod.title,
        trimestre: mod.trimester,
        seance_no: l.day,
        matiere,
        titre: l.title,
        resume: l.purpose,
        objectifs: l.focus,
        illustration,
        texte_id: l.reading_refs?.[0] ?? null,
        dictee_id: l.dictation_refs?.[0] ?? null,
        deroule: l.course.learning_steps,
        exercice_ids: l.exercises.map((e) => e.id),
        duree_minutes: l.estimated_minutes,
        cours: {
          introduction: l.course.introduction,
          explication: l.course.explanation,
          exemples: l.course.examples,
          trace: l.course.student_trace,
          differenciation: l.course.differentiation,
        },
        module: {
          theme: mod.theme,
          objectifs_communication: mod.communication_objectives,
          structures: mod.language_structures,
          lexique: mod.vocabulary_fields,
          projet_ecriture: mod.writing_project,
          criteres: mod.assessment_targets,
          etude_langue: {
            grammaire: mod.language_study.grammar,
            conjugaison: mod.language_study.conjugation,
            orthographe: mod.language_study.orthography,
            vocabulaire: mod.language_study.vocabulary,
          },
        },
      });
    }
  }
}

const TYPE_EVAL = { module: "devoir", unit: "devoir", trimester: "examen", final: "examen" };

const assessments = sourceEvals.map((a) => {
  const pool = a.question_pool.map((id) => exoParId.get(id)).filter(Boolean);
  const pas = Math.max(1, Math.floor(pool.length / a.draw_count));
  const choisis = [];
  for (let i = 0; choisis.length < a.draw_count && i < pool.length; i += pas) choisis.push(pool[i]);
  const strict = a.security_profile !== "homework_or_class_test";
  return {
    id: a.id,
    grade: a.grade,
    module_no: a.module_numbers[0],
    trimestre:
      lessons.find((l) => l.grade === a.grade && l.module_no === a.module_numbers[0])?.trimestre ??
      1,
    type: TYPE_EVAL[a.kind] ?? "devoir",
    titre: a.title,
    consignes:
      "Lis chaque consigne avec attention, réponds dans l'espace prévu et relis ta copie avant de rendre.",
    matiere: "francais",
    duree_minutes: a.duration_minutes,
    competences: [...new Set(choisis.map((e) => e.competence).filter(Boolean))],
    anti_cheat: {
      plein_ecran: strict,
      bloquer_copie: true,
      limite_changement_onglet: strict ? 1 : 3,
      melanger_questions: true,
      correction_immediate: a.correction_release !== "teacher_controlled" && !strict,
    },
    questions: choisis.map((e, i) => ({
      ordre: i + 1,
      // Une question n'est un QCM que si elle propose réellement des choix.
      type:
        e.options.length >= 2
          ? typeQuestion(e.type)
          : typeQuestion(e.type) === "qcm"
            ? "court"
            : typeQuestion(e.type),
      enonce: `${e.consigne} ${e.enonce}`.trim(),
      options: e.options,
      reponse_correcte: e.reponse_correcte,
      points: e.points,
      image_url: e.illustration,
    })),
  };
});

const manifest = {
  nom: source.title,
  version: source.schema_version,
  licence: source.legal_notice,
  avertissement:
    "Contenu importé en brouillon : une validation humaine par l'enseignant est obligatoire avant publication aux élèves.",
  niveaux: source.levels.length,
  trimestres: 3,
  modules: source.levels.reduce((n, l) => n + l.modules.length, 0),
  lecons: lessons.length,
  textes: textes.length,
  dictees: dictees.length,
  exercices: exercices.length,
  illustrations: illustrations.size,
  evaluations: assessments.length,
};

writeFileSync(`${OUT}manifest.json`, JSON.stringify(manifest, null, 2));
writeFileSync(
  `${OUT}course_library.json`,
  JSON.stringify({ manifest, lessons, textes, dictees, exercices }, null, 2),
);
writeFileSync(`${OUT}assessments.json`, JSON.stringify({ manifest, assessments }, null, 2));

console.log(manifest);
