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

// Thème visuel par module (style « carte éducative » officiel)
const MODULE_THEME = {
  1: { c: "#1F6E5A", bg: "#DDF4EC" },
  2: { c: "#3056A6", bg: "#E3EBFF" },
  3: { c: "#B4531F", bg: "#FDEBDD" },
  4: { c: "#7A3E9D", bg: "#F1E6FA" },
  5: { c: "#0F6E86", bg: "#DDF1F7" },
  6: { c: "#9C1F4B", bg: "#FBE3EC" },
  7: { c: "#556B12", bg: "#EEF5D9" },
  8: { c: "#2F4858", bg: "#E4ECF1" },
};

function motif(n, c) {
  switch (n % 4) {
    case 1:
      return `<path d="M400 330 C520 130 720 170 710 360 C700 530 510 560 410 450 C500 390 570 330 640 245 C555 315 480 360 390 405 Z" fill="${c}" opacity=".92"/>`;
    case 2:
      return `<path d="M325 230 H695 Q750 230 750 285 V455 Q750 510 695 510 H500 L390 595 L420 510 H325 Q270 510 270 455 V285 Q270 230 325 230Z" fill="${c}"/><circle cx="390" cy="370" r="24" fill="white"/><circle cx="510" cy="370" r="24" fill="white"/><circle cx="630" cy="370" r="24" fill="white"/>`;
    case 3:
      return `<path d="M280 250 H500 Q510 300 510 520 H280 Z" fill="${c}"/><path d="M740 250 H520 Q510 300 510 520 H740 Z" fill="${c}" opacity=".72"/><rect x="270" y="520" width="480" height="26" rx="13" fill="${c}"/>`;
    default:
      return `<circle cx="510" cy="380" r="150" fill="${c}" opacity=".9"/><path d="M430 380 h160 M510 300 v160" stroke="white" stroke-width="26" stroke-linecap="round"/>`;
  }
}

function svg({ grade, moduleNo, moduleTitle, lessonNo, lessonTitle }) {
  const { c, bg } = MODULE_THEME[moduleNo] ?? MODULE_THEME[1];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">Illustration du module ${moduleNo}, leçon ${lessonNo}</title>
  <desc id="desc">Carte éducative originale pour ${esc(moduleTitle)} : ${esc(lessonTitle)}</desc>
  <rect width="1200" height="675" rx="48" fill="${bg}"/>
  <circle cx="1030" cy="80" r="210" fill="${c}" opacity=".10"/>
  <circle cx="110" cy="620" r="190" fill="${c}" opacity=".08"/>
  <rect x="65" y="55" width="245" height="55" rx="27" fill="${c}"/>
  <text x="187" y="91" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="white">${grade}e ANNÉE • M${moduleNo}</text>
  <g transform="translate(90 25)">${motif(moduleNo, c)}</g>
  <text x="800" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${c}">MODULE ${moduleNo}</text>
  <foreignObject x="655" y="280" width="485" height="150">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:34px;line-height:1.18;font-weight:700;color:${c};text-align:center;padding:8px">${esc(moduleTitle)}</div>
  </foreignObject>
  <rect x="650" y="455" width="500" height="105" rx="24" fill="white" opacity=".92"/>
  <foreignObject x="680" y="470" width="440" height="75">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:23px;line-height:1.25;color:#263238;text-align:center">Leçon ${lessonNo} • ${esc(lessonTitle)}</div>
  </foreignObject>
  <text x="1125" y="640" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="${c}">Illustration originale • fr-TN</text>
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
