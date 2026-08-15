import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildLessonPath } from "@/lib/parcours.server";
import { assertEnseignant } from "@/lib/roles.server";

/** Génère (et enregistre) le parcours interactif en 8 étapes d'une séance du programme. */
export const generateLessonPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ lessonId: z.string().uuid(), regenerate: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertEnseignant(context);
    return buildLessonPath(
      context.supabase,
      context.userId,
      data.lessonId,
      data.regenerate === true,
    );
  });
