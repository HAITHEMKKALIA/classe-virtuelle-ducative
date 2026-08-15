// Génère la bibliothèque pédagogique originale dans public/programme.
// Contenu 100 % original, aligné sur les compétences du programme tunisien.
// Aucun extrait de manuel protégé n'est reproduit.
// Exécution : bun scripts/generate-library.mjs
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { MODULE_DETAILS } from "../src/lib/module-details.ts";

const OUT = new URL("../public/programme/", import.meta.url).pathname;
const ILLU = `${OUT}assets/illustrations/`;

rmSync(OUT.replace(/\/$/, ""), { recursive: true, force: true });
mkdirSync(ILLU, { recursive: true });

const TRIMESTRE = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3 };

/** Les 8 séances d'un module, dans l'ordre officiel du déroulé hebdomadaire. */
const SEANCES = [
  { key: "orale", matiere: "expression_orale", domaine: "Communication orale", titre: "Expression orale" },
  { key: "lecture", matiere: "lecture", domaine: "Lecture", titre: "Lecture et compréhension" },
  { key: "grammaire", matiere: "grammaire", domaine: "Grammaire", titre: "Grammaire" },
  { key: "conjugaison", matiere: "conjugaison", domaine: "Conjugaison", titre: "Conjugaison" },
  { key: "orthographe", matiere: "orthographe", domaine: "Orthographe", titre: "Orthographe et dictée" },
  { key: "vocabulaire", matiere: "vocabulaire", domaine: "Vocabulaire", titre: "Vocabulaire" },
  { key: "ecrit", matiere: "expression_ecrite", domaine: "Production écrite", titre: "Production écrite" },
  { key: "bilan", matiere: "lecture", domaine: "Évaluation", titre: "Intégration et remédiation" },
];

const PALETTE = {
  expression_orale: ["#0f2d4a", "#f5a524"],
  lecture: ["#123a2e", "#5ecfa6"],
  grammaire: ["#2a1c4a", "#a78bfa"],
  conjugaison: ["#4a1c22", "#fb7185"],
  orthographe: ["#123049", "#38bdf8"],
  vocabulaire: ["#3f2a10", "#fbbf24"],
  expression_ecrite: ["#0d3b3b", "#2dd4bf"],
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

const lessons = [];
const textes = [];
const dictees = [];
const exercices = [];
const assessments = [];
const illustrations = [];

const phrase = (mots, i) => mots[i % mots.length];

for (const mod of MODULE_DETAILS) {
  const grade = mod.grade;
  const trimestre = TRIMESTRE[mod.no];
  const lexique = mod.domains["Vocabulaire"] ?? [];
  const supports = mod.supports ?? [];

  // 4 textes originaux par module (64 au total).
  for (let i = 0; i < 4; i++) {
    const support = supports[i] ?? `${mod.title} — texte ${i + 1}`;
    const id = `txt-${grade}-${mod.no}-${i + 1}`;
    textes.push({
      id,
      grade,
      module_no: mod.no,
      trimestre,
      titre: support.replace(/\.$/, ""),
      genre: i % 2 === 0 ? "récit" : "documentaire",
      contenu: [
        `Ce matin-là, la classe de ${grade}ᵉ année parle de « ${mod.title.toLowerCase()} ».`,
        `Chacun apporte une idée : ${lexique.slice(0, 4).join(", ") || "le respect, l'entraide"}.`,
        `« ${support.replace(/\.$/, "")} », dit la maîtresse en montrant le tableau.`,
        `Les élèves observent, comparent, puis notent ce qu'ils ont compris.`,
        `À la fin de la séance, la classe écrit une phrase commune pour garder la trace du travail.`,
      ].join("\n\n"),
      questions_comprehension: [
        "Qui parle dans ce texte et où se passe la scène ?",
        "Relève deux mots liés au thème du module.",
        "Que décide la classe à la fin ?",
        "Justifie ta réponse en citant une phrase du texte.",
      ],
    });
  }

  // 2 dictées préparées par module (32 au total).
  for (let i = 0; i < 2; i++) {
    dictees.push({
      id: `dic-${grade}-${mod.no}-${i + 1}`,
      grade,
      module_no: mod.no,
      trimestre,
      titre: `Dictée préparée ${i + 1} — ${mod.title}`,
      mots_a_preparer: lexique.slice(i * 3, i * 3 + 4),
      texte: `Nous parlons de ${lexique[i] ?? "notre classe"} et de ${lexique[(i + 1) % Math.max(1, lexique.length)] ?? "nos règles"}. Chaque élève écrit une phrase claire, avec une majuscule et un point.`,
      points_de_vigilance: (mod.domains["Orthographe"] ?? []).slice(0, 2),
    });
  }

  SEANCES.forEach((s, idx) => {
    const objectifs = (mod.domains[s.domaine] ?? mod.domains["Lecture"] ?? []).slice(0, 4);
    const lessonId = `lec-${grade}-${mod.no}-${idx + 1}`;
    const illuPath = `/programme/assets/illustrations/${lessonId}.svg`;
    writeFileSync(
      `${ILLU}${lessonId}.svg`,
      svg(`${s.titre}`, `${grade}ᵉ année — Module ${mod.no} — ${mod.title}`, s.matiere),
    );
    illustrations.push(illuPath);

    // 4 exercices par leçon (512 au total).
    const exos = [];
    for (let e = 0; e < 4; e++) {
      const objectif = objectifs[e % Math.max(1, objectifs.length)] ?? mod.title;
      const type = ["qcm", "texte_trous", "court", "texte"][e];
      const base = {
        id: `${lessonId}-ex${e + 1}`,
        lesson_id: lessonId,
        type,
        points: 1,
        consigne: `${objectif} : applique la règle de la séance.`,
      };
      if (type === "qcm") {
        const bonne = objectif;
        exos.push({
          ...base,
          enonce: `Quelle proposition correspond à l'objectif travaillé ?`,
          options: [
            bonne,
            `Recopier sans comprendre le texte`,
            `Répondre au hasard`,
            `Changer de sujet`,
          ],
          reponse_correcte: bonne,
        });
      } else if (type === "texte_trous") {
        exos.push({
          ...base,
          enonce: `Complète : « En ${s.titre.toLowerCase()}, je dois d'abord ___, puis ___. »`,
          segments: ["En " + s.titre.toLowerCase() + ", je dois d'abord ", ", puis ", "."],
          reponse_correcte: [
            (objectifs[0] ?? "observer").toLowerCase(),
            (objectifs[1] ?? "appliquer la règle").toLowerCase(),
          ],
        });
      } else if (type === "court") {
        exos.push({
          ...base,
          enonce: `Écris un exemple personnel qui montre : « ${objectif} ».`,
          reponse_correcte: null,
        });
      } else {
        exos.push({
          ...base,
          points: 2,
          enonce: `Rédige 3 à 4 phrases sur le thème « ${mod.title} » en respectant : ${objectifs.slice(0, 2).join(" ; ") || objectif}.`,
          reponse_correcte: null,
        });
      }
    }
    exercices.push(...exos);

    lessons.push({
      id: lessonId,
      grade,
      module_no: mod.no,
      module_titre: mod.title,
      trimestre,
      seance_no: idx + 1,
      matiere: s.matiere,
      titre: `${s.titre} — ${mod.title}`,
      resume: `Module ${mod.no} (${grade}ᵉ année, trimestre ${trimestre}) : ${s.titre.toLowerCase()} au service du thème « ${mod.title} ».`,
      objectifs,
      illustration: illuPath,
      texte_id: textes[textes.length - 4 + (idx % 4)]?.id ?? null,
      dictee_id: s.key === "orthographe" ? `dic-${grade}-${mod.no}-1` : null,
      deroule: [
        "Mise en situation à partir de l'illustration et du thème du module.",
        "Observation guidée et repérage collectif.",
        "Formulation de la règle par les élèves, reformulée par l'enseignant.",
        "Application guidée puis entraînement autonome.",
        "Remédiation ciblée et trace écrite.",
      ],
      exercice_ids: exos.map((e) => e.id),
      duree_minutes: 45,
    });
  });

  // 2 modèles d'évaluation par module (32 au total).
  for (let i = 0; i < 2; i++) {
    const kind = i === 0 ? "devoir" : "examen";
    const modLessons = lessons.filter((l) => l.grade === grade && l.module_no === mod.no);
    const qs = modLessons.slice(0, 6).map((l, qi) => {
      const ex = exercices.find((e) => e.id === `${l.id}-ex1`);
      return {
        ordre: qi + 1,
        type: kind === "examen" && qi > 3 ? "texte" : (ex?.type === "texte_trous" ? "court" : ex?.type ?? "court"),
        enonce: ex?.enonce ?? `Question sur ${l.titre}.`,
        options: ex?.options ?? [],
        reponse_correcte: Array.isArray(ex?.reponse_correcte)
          ? ex.reponse_correcte.join(" | ")
          : (ex?.reponse_correcte ?? null),
        points: qi > 3 ? 2 : 1,
        image_url: l.illustration,
      };
    });
    assessments.push({
      id: `eval-${grade}-${mod.no}-${i + 1}`,
      grade,
      module_no: mod.no,
      trimestre,
      type: kind,
      titre: `${kind === "devoir" ? "Devoir" : "Examen"} — Module ${mod.no} : ${mod.title}`,
      consignes:
        "Lis chaque consigne jusqu'au bout. Réponds par des phrases complètes et relis-toi avant de rendre.",
      matiere: "lecture",
      duree_minutes: kind === "devoir" ? 30 : 60,
      competences: mod.domains["Évaluation"] ?? [],
      anti_cheat:
        kind === "examen"
          ? { fullscreen: true, block_copy: true, max_tab_switch: 2, block_screenshot: true }
          : { fullscreen: false, block_copy: false, max_tab_switch: 5, block_screenshot: false },
      questions: qs,
    });
  }
}

const manifest = {
  nom: "Ma Classe de Français TN — bibliothèque originale",
  version: "1.0.0",
  licence: "Contenu original. Aucun extrait de manuel protégé du CNP n'est reproduit.",
  avertissement:
    "Contenu généré pour la préparation des séances : une validation humaine par l'enseignant est obligatoire avant publication aux élèves.",
  niveaux: 2,
  trimestres: 3,
  modules: MODULE_DETAILS.length,
  lecons: lessons.length,
  textes: textes.length,
  dictees: dictees.length,
  exercices: exercices.length,
  illustrations: illustrations.length,
  evaluations: assessments.length,
};

writeFileSync(`${OUT}course_library.json`, JSON.stringify({ manifest, lessons, textes, dictees, exercices }, null, 1));
writeFileSync(`${OUT}assessments.json`, JSON.stringify({ manifest, assessments }, null, 1));
writeFileSync(`${OUT}manifest.json`, JSON.stringify(manifest, null, 2));

console.log(manifest);
