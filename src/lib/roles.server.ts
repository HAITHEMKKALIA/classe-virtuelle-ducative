import { z } from "zod";

type AuthContext = {
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
  };
  userId: string;
};

/** Les fonctions IA payantes sont réservées aux professeurs et super administrateurs. */
export async function assertEnseignant(context: AuthContext): Promise<void> {
  const [{ data: isProf }, { data: isAdmin }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "prof" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
  ]);
  if (isProf !== true && isAdmin !== true) {
    throw new Error("Accès refusé : fonction réservée aux enseignants.");
  }
}

/** Limite de taille des fichiers envoyés à l'IA (8 Mo en base64). */
export const MAX_FICHIER_OCTETS = 8 * 1024 * 1024;

export const fichierSchema = z
  .object({
    filename: z.string().min(1).max(200),
    dataUrl: z
      .string()
      .startsWith("data:")
      .max(Math.ceil((MAX_FICHIER_OCTETS * 4) / 3) + 1024, "Fichier trop volumineux (8 Mo maximum)."),
  })
  .nullable()
  .optional();
