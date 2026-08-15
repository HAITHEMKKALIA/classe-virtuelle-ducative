import type { SupabaseClient } from "@supabase/supabase-js";
import { chat, extractJson } from "@/lib/ai-gateway.server";

export const ETAPES = [
  { kind: "decouverte", title: "Découverte" },
  { kind: "observation", title: "Observation du support" },
  { kind: "regle", title: "La règle" },
  { kind: "exemples", title: "Exemples expliqués" },
  { kind: "application", title: "Exercices guidés" },
  { kind: "entrainement", title: "Entraînement autonome" },
  { kind: "remediation", title: "Remédiation" },
  { kind: "bilan", title: "Bilan et trace écrite" },
] as const;

type AnySupabase = SupabaseClient<any, any, any>;

type EtapeIA = {
  kind?: string;
  title?: string;
  content?: string;
  image_prompt?: string;
  questions?: {
    type?: string;
    enonce?: string;
    options?: string[];
    reponse_correcte?: string | string[];
    explication?: string;
    points?: number;
    payload?: Record<string, unknown>;
  }[];
};

/** Construit le parcours en 8 étapes d'une séance, l'enregistre puis le renvoie. */
export async function buildLessonPath(
  supabase: AnySupabase,
  userId: string,
  lessonId: string,
  regenerate: boolean,
) {
  const { data: lesson, error } = await supabase
    .from("curriculum_lessons")
    .select("id, title, lesson_type, estimated_minutes, module_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!lesson) throw new Error("Séance introuvable.");

  const { data: mod } = await supabase
    .from("curriculum_modules")
    .select("title, theme, trimester, level_id")
    .eq("id", lesson.module_id)
    .maybeSingle();
  const { data: level } = mod
    ? await supabase
        .from("curriculum_levels")
        .select("grade, title")
        .eq("id", mod.level_id)
        .maybeSingle()
    : { data: null };

  const { data: existing } = await supabase
    .from("lesson_steps")
    .select("id")
    .eq("lesson_id", lessonId);
  if (existing?.length && !regenerate) return { created: 0, steps: existing.length };
  if (existing?.length && regenerate) {
    await supabase.from("lesson_steps").delete().eq("lesson_id", lessonId);
  }

  const prompt = `Tu es inspecteur de français au primaire tunisien. Construis un parcours d'apprentissage interactif en 8 étapes.
Niveau : ${level?.grade ?? 5}ème année primaire. Trimestre : ${mod?.trimester ?? 1}.
Module : ${mod?.title ?? ""} — thème : ${mod?.theme ?? ""}.
Séance : "${lesson.title}" (domaine : ${lesson.lesson_type}), durée ${lesson.estimated_minutes} minutes.

Les 8 étapes, dans cet ordre exact (kind) : ${ETAPES.map((e) => e.kind).join(", ")}.
- decouverte : mise en situation courte + question de départ.
- observation : un court texte support tunisien (5 à 8 lignes) et des questions de repérage.
- regle : la règle encadrée, simple, avec les exceptions utiles.
- exemples : 4 exemples commentés.
- application : 4 questions guidées faciles.
- entrainement : 5 questions plus exigeantes.
- remediation : 3 questions faciles de rattrapage + conseil.
- bilan : trace écrite à recopier + 3 questions bilan.

Types de questions autorisés : "qcm", "vrai_faux", "texte_trous", "ordre", "association", "correction_phrase", "conjugaison", "court", "texte", "dictee".
Règles de format des réponses :
- texte_trous : payload.segments = morceaux de phrase séparant les trous, reponse_correcte = tableau des mots attendus.
- conjugaison : payload.verbe, payload.temps, payload.personnes, reponse_correcte = tableau des formes.
- ordre : payload.elements = éléments DANS LE BON ORDRE.
- association : payload.paires = [{"gauche":"…","droite":"…"}].
- qcm : options (4) et reponse_correcte exactement égale à une option.
Chaque question a une "explication" courte et "points" (1 ou 2).

Réponds UNIQUEMENT en JSON :
{"etapes":[{"kind":"decouverte","title":"…","content":"markdown","image_prompt":"illustration simple ou vide","questions":[…]}]}
Le français doit être clair, bienveillant, adapté à des enfants de 10 à 12 ans, avec des références tunisiennes.`;

  const json = await chat({
    model: "google/gemini-3.5-flash",
    messages: [{ role: "user", content: prompt }],
  });
  const parsed = extractJson(json.choices?.[0]?.message?.content ?? "") as { etapes?: EtapeIA[] };
  const etapes = parsed.etapes ?? [];
  if (!etapes.length) throw new Error("Le parcours généré est vide, réessayez.");

  const rows = ETAPES.map((modele, index) => {
    const found =
      etapes.find((e) => (e.kind ?? "").toLowerCase() === modele.kind) ?? etapes[index] ?? {};
    const questions = (found.questions ?? []).map((q, qi) => ({
      id: `${modele.kind}-${qi}`,
      ordre: qi + 1,
      type: q.type ?? "qcm",
      enonce: q.enonce ?? "",
      options: q.options ?? [],
      points: Number(q.points) || 1,
      explication: q.explication ?? "",
      payload: q.payload ?? {},
      reponse_correcte: Array.isArray(q.reponse_correcte)
        ? JSON.stringify(q.reponse_correcte)
        : (q.reponse_correcte ?? ""),
    }));
    return {
      lesson_id: lessonId,
      step_no: index + 1,
      kind: modele.kind,
      title: found.title || modele.title,
      content: found.content ?? "",
      payload: { questions, image_prompt: found.image_prompt ?? "" },
      published: true,
      created_by: userId,
    };
  });

  const { error: insErr } = await supabase.from("lesson_steps").insert(rows);
  if (insErr) throw new Error(insErr.message);
  return { created: rows.length, steps: rows.length };
}
