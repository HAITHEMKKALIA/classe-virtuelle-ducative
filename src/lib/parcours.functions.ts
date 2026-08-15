import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildLessonPath } from "@/lib/parcours.server";

/** Génère (et enregistre) le parcours interactif en 8 étapes d'une séance du programme. */
export const generateLessonPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string; regenerate?: boolean }) => d)
  .handler(async ({ data, context }) =>
    buildLessonPath(context.supabase, context.userId, data.lessonId, data.regenerate === true),
  );
