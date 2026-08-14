import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

export async function uploadMedia(file: File | Blob, folder = "uploads", ext = "png") {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? "anon";
  const name = `${uid}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, { upsert: false });
  if (error) throw error;
  return name;
}

export async function signedUrl(path: string, seconds = 60 * 60 * 8) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, seconds);
  if (error) return "";
  return data.signedUrl;
}

export function dataUrlToBlob(dataUrl: string) {
  const parts = dataUrl.split(",");
  const head = parts[0] ?? "";
  const b64 = parts[1] ?? "";
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
