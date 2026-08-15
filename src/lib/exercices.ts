/** Moteur d'exercices : types de questions, correction automatique et libellés. */

export type QuestionType =
  | "qcm"
  | "vrai_faux"
  | "texte_trous"
  | "ordre"
  | "association"
  | "correction_phrase"
  | "conjugaison"
  | "court"
  | "texte"
  | "dictee"
  | "oral"
  | "depot";

export type QuestionPayload = {
  /** texte_trous : phrase avec des ___ à compléter */
  segments?: string[];
  /** association : paires gauche/droite */
  paires?: { gauche: string; droite: string }[];
  /** ordre : éléments à remettre dans l'ordre (ordre correct = ordre du tableau) */
  elements?: string[];
  /** dictée : consigne de lecture */
  audio_texte?: string;
  /** conjugaison : verbe / temps / personnes */
  verbe?: string;
  temps?: string;
  personnes?: string[];
};

export type ExerciseQuestion = {
  id: string;
  ordre: number;
  type: QuestionType | string;
  enonce: string;
  options: string[];
  points: number;
  image_url?: string | null;
  audio_url?: string | null;
  reponse_correcte?: string | null;
  explication?: string | null;
  payload?: QuestionPayload;
};

export const TYPES_QUESTION: { value: QuestionType; label: string; auto: boolean }[] = [
  { value: "qcm", label: "QCM", auto: true },
  { value: "vrai_faux", label: "Vrai ou faux", auto: true },
  { value: "texte_trous", label: "Texte à trous", auto: true },
  { value: "ordre", label: "Remettre en ordre", auto: true },
  { value: "association", label: "Association (mot / image / réponse)", auto: true },
  { value: "correction_phrase", label: "Corriger la phrase", auto: true },
  { value: "conjugaison", label: "Conjuguer un verbe", auto: true },
  { value: "court", label: "Réponse courte", auto: true },
  { value: "texte", label: "Production écrite longue", auto: false },
  { value: "dictee", label: "Dictée audio", auto: false },
  { value: "oral", label: "Réponse orale enregistrée", auto: false },
  { value: "depot", label: "Dépôt d'un fichier (photo du cahier, PDF)", auto: false },
];

export function typeLabel(type: string) {
  return TYPES_QUESTION.find((t) => t.value === type)?.label ?? type;
}

export function isAutoCorrige(type: string) {
  return TYPES_QUESTION.find((t) => t.value === type)?.auto ?? false;
}

/** Normalise une réponse : minuscules, sans accents, sans ponctuation ni espaces multiples. */
export function normaliser(value: string) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?'"()«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Correction = { auto: boolean; correct: boolean; note: number; attendu: string };

/**
 * Corrige automatiquement une réponse quand le type le permet.
 * Les réponses multiples (trous, association, conjugaison) sont stockées en JSON.
 */
export function corriger(question: ExerciseQuestion, reponse: string): Correction {
  const points = Number(question.points) || 1;
  const attendu = question.reponse_correcte ?? "";
  if (!isAutoCorrige(question.type)) {
    return { auto: false, correct: false, note: 0, attendu };
  }

  const parseListe = (value: string): string[] => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value ? value.split("|") : [];
    }
  };

  if (question.type === "texte_trous" || question.type === "conjugaison") {
    const attendus = parseListe(attendu);
    const donnees = parseListe(reponse);
    if (!attendus.length) return { auto: false, correct: false, note: 0, attendu };
    const bons = attendus.filter((a, i) => normaliser(a) === normaliser(donnees[i] ?? "")).length;
    const note = Math.round((bons / attendus.length) * points * 100) / 100;
    return { auto: true, correct: bons === attendus.length, note, attendu };
  }

  if (question.type === "ordre") {
    const attendus = (question.payload?.elements ?? []).map(normaliser);
    const donnees = parseListe(reponse).map(normaliser);
    if (!attendus.length) return { auto: false, correct: false, note: 0, attendu };
    const bons = attendus.filter((a, i) => a === donnees[i]).length;
    const note = Math.round((bons / attendus.length) * points * 100) / 100;
    return { auto: true, correct: bons === attendus.length, note, attendu: attendus.join(" → ") };
  }

  if (question.type === "association") {
    const paires = question.payload?.paires ?? [];
    const donnees = parseListe(reponse);
    if (!paires.length) return { auto: false, correct: false, note: 0, attendu };
    const bons = paires.filter((p, i) => normaliser(p.droite) === normaliser(donnees[i] ?? "")).length;
    const note = Math.round((bons / paires.length) * points * 100) / 100;
    return { auto: true, correct: bons === paires.length, note, attendu };
  }

  const correct = normaliser(reponse) === normaliser(attendu) && normaliser(attendu) !== "";
  return { auto: true, correct, note: correct ? points : 0, attendu };
}

/** Mélange un tableau (ordre aléatoire des questions ou des options). */
export function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}
