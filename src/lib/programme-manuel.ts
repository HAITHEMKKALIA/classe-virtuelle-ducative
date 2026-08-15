import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "media";

export type ProgrammeManuel = {
  id: string;
  prof_id: string;
  class_id: string | null;
  titre: string;
  description: string | null;
  niveau: number | null;
  trimestre: number | null;
  contenu: string;
  published: boolean;
  created_at: string;
};

export type FichierProgramme = {
  id: string;
  program_id: string;
  nom: string;
  path: string;
  mime: string | null;
  taille: number | null;
  created_at: string;
};

const MAX_TAILLE = 25 * 1024 * 1024;

export function extensionDe(nom: string) {
  const parts = nom.split(".");
  return parts.length > 1 ? (parts.pop() ?? "bin").toLowerCase() : "bin";
}

export function tailleLisible(octets: number | null) {
  if (!octets) return "—";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export function estImage(mime: string | null, nom: string) {
  if (mime?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(nom);
}

export function estPdf(mime: string | null, nom: string) {
  return mime === "application/pdf" || /\.pdf$/i.test(nom);
}

/** Dépose un fichier de programme dans le dossier privé du professeur. */
export async function uploadFichierProgramme(file: File, profId: string) {
  if (file.size > MAX_TAILLE) throw new Error("Fichier trop volumineux (25 Mo maximum).");
  const path = `${profId}/programmes/${crypto.randomUUID()}.${extensionDe(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return { path, nom: file.name, mime: file.type || null, taille: file.size };
}

export async function urlSignee(path: string, seconds = 60 * 60 * 4) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, seconds);
  if (error) return "";
  return data.signedUrl;
}

export async function urlTelechargement(path: string, nom: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60, { download: nom });
  if (error) return "";
  return data.signedUrl;
}
