import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertEnseignant, fichierSchema } from "@/lib/roles.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Block =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

async function chat(body: unknown) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Service IA indisponible.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("Trop de demandes IA, réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés.");
    throw new Error(`Erreur IA (${res.status}) : ${t.slice(0, 300)}`);
  }
  return (await res.json()) as {
    choices: {
      message: { content?: string; images?: { image_url: { url: string } }[] };
    }[];
  };
}

function extractJson(raw: string) {
  const cleaned = raw.replace(/```json/gi, "```").split("```").filter(Boolean);
  for (const chunk of [raw, ...cleaned]) {
    const start = chunk.indexOf("{");
    const end = chunk.lastIndexOf("}");
    if (start === -1 || end === -1) continue;
    try {
      return JSON.parse(chunk.slice(start, end + 1));
    } catch {
      /* try next */
    }
  }
  throw new Error("Réponse IA illisible, réessayez.");
}

export type GeneratedQuestion = {
  type: "qcm" | "court" | "texte";
  enonce: string;
  options: string[];
  reponse_correcte: string;
  points: number;
  image_prompt?: string;
};

export const generateAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        niveau: z.number().int().min(1).max(9),
        trimestre: z.number().int().min(1).max(3),
        matiere: z.string().min(1).max(60),
        type: z.string().min(1).max(30),
        nombre: z.number().int().min(1).max(30),
        consigne: z.string().max(4000).optional(),
        sourceText: z.string().max(20000).optional(),
        sourceFile: fichierSchema,
        withImages: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertEnseignant(context);
    const content: Block[] = [
      {
        type: "text",
        text: `Tu es un enseignant tunisien de français au primaire. Génère ${data.nombre} questions pour un ${data.type} de ${data.matiere} destiné à des élèves de ${data.niveau}ème année primaire (${data.trimestre}er/ème trimestre), conformes au programme officiel tunisien.
${data.consigne ? `Consignes du professeur : ${data.consigne}` : ""}
${data.sourceText ? `Base-toi sur ce contenu :\n${data.sourceText.slice(0, 12000)}` : ""}
Varie les types : "qcm" (avec 3 ou 4 options et la bonne réponse exacte), "court" (réponse courte) et "texte" (production écrite).
${data.withImages ? 'Pour 2 questions au maximum, ajoute "image_prompt" : une description simple et enfantine de l\'illustration utile à la question.' : ""}
Réponds UNIQUEMENT en JSON valide :
{"titre":"...","consignes":"...","questions":[{"type":"qcm|court|texte","enonce":"...","options":["..."],"reponse_correcte":"...","points":1${data.withImages ? ',"image_prompt":"..."' : ""}}]}`,
      },
    ];
    if (data.sourceFile?.dataUrl) {
      content.push({
        type: "file",
        file: { filename: data.sourceFile.filename, file_data: data.sourceFile.dataUrl },
      });
    }
    const json = await chat({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "user", content }],
    });
    const raw = json.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(raw) as {
      titre?: string;
      consignes?: string;
      questions?: GeneratedQuestion[];
    };
    return {
      titre: parsed.titre ?? "Exercice généré",
      consignes: parsed.consignes ?? "",
      questions: (parsed.questions ?? []).map((q) => ({
        type: (["qcm", "court", "texte"].includes(q.type) ? q.type : "court") as
          | "qcm"
          | "court"
          | "texte",
        enonce: q.enonce ?? "",
        options: Array.isArray(q.options) ? q.options : [],
        reponse_correcte: q.reponse_correcte ?? "",
        points: Number(q.points) || 1,
        image_prompt: q.image_prompt ?? "",
      })),
    };
  });

export const generateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        niveau: z.number().int().min(1).max(9),
        trimestre: z.number().int().min(1).max(3),
        matiere: z.string().min(1).max(60),
        titre: z.string().min(1).max(200),
        notes: z.string().max(4000).optional(),
        sourceFile: fichierSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertEnseignant(context);
    const content: Block[] = [
      {
        type: "text",
        text: `Rédige un cours complet de français pour la ${data.niveau}ème année primaire tunisienne, ${data.trimestre}e trimestre, matière : ${data.matiere}, titre : "${data.titre}".
${data.notes ? `Notes du professeur : ${data.notes}` : ""}
Structure en markdown : objectifs, rappel/observation, règle encadrée, exemples tunisiens du quotidien, 5 exercices d'application avec corrigé, et une trace écrite à recopier. Langage clair adapté à des enfants de 10-12 ans.
Réponds UNIQUEMENT en JSON : {"resume":"2 phrases","contenu":"markdown complet","image_prompt":"illustration pédagogique décrite simplement"}`,
      },
    ];
    if (data.sourceFile?.dataUrl) {
      content.push({
        type: "file",
        file: { filename: data.sourceFile.filename, file_data: data.sourceFile.dataUrl },
      });
    }
    const json = await chat({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "user", content }],
    });
    const parsed = extractJson(json.choices?.[0]?.message?.content ?? "") as {
      resume?: string;
      contenu?: string;
      image_prompt?: string;
    };
    return {
      resume: parsed.resume ?? "",
      contenu: parsed.contenu ?? "",
      image_prompt: parsed.image_prompt ?? "",
    };
  });

export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ prompt: z.string().min(3).max(1000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEnseignant(context);
    const json = await chat({
      model: "google/gemini-3.1-flash-image",
      messages: [
        {
          role: "user",
          content: `Illustration pédagogique pour un manuel scolaire de français au primaire : ${data.prompt}. Style : dessin coloré, clair, sans texte écrit, adapté aux enfants.`,
        },
      ],
      modalities: ["image", "text"],
    });
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
    if (!url) throw new Error("Aucune image générée.");
    return { dataUrl: url };
  });

export const suggestGrading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        enonce: z.string().min(1).max(4000),
        attendu: z.string().max(4000).optional(),
        reponse: z.string().max(10000),
        points: z.number().min(0).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertEnseignant(context);
    const json = await chat({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "user",
          content: `Corrige la réponse d'un élève tunisien du primaire (français).
Question : ${data.enonce}
Réponse attendue : ${data.attendu || "(libre)"}
Réponse de l'élève : ${data.reponse}
Barème : ${data.points} point(s).
Réponds UNIQUEMENT en JSON : {"note": nombre, "commentaire": "remarque bienveillante et corrective en français simple"}`,
        },
      ],
    });
    const parsed = extractJson(json.choices?.[0]?.message?.content ?? "") as {
      note?: number;
      commentaire?: string;
    };
    return {
      note: Math.max(0, Math.min(data.points, Number(parsed.note) || 0)),
      commentaire: parsed.commentaire ?? "",
    };
  });
