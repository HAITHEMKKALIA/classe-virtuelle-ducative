/** Accès serveur à la passerelle IA Lovable (chat + extraction JSON). */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function chat(body: unknown) {
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
    choices: { message: { content?: string; images?: { image_url: { url: string } }[] } }[];
  };
}

export function extractJson(raw: string) {
  const cleaned = raw.replace(/```json/gi, "```").split("```").filter(Boolean);
  for (const chunk of [raw, ...cleaned]) {
    const start = chunk.indexOf("{");
    const end = chunk.lastIndexOf("}");
    if (start === -1 || end === -1) continue;
    try {
      return JSON.parse(chunk.slice(start, end + 1));
    } catch {
      /* essai suivant */
    }
  }
  throw new Error("Réponse IA illisible, réessayez.");
}
