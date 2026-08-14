import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "super_admin" | "prof" | "eleve";

/** Approuveimport { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "super_admin" | "prof" | "eleve";

 (ou refuse) un compte et lui attribue un rôle. Réservé au super administrateur. */
export const reviewAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { userId: string; status: "approved" | "rejected" | "pending"; role?: Role }) => d,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Accès refusé : réservé au super administrateur.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    if (data.role) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
      if (data.status === "approved") {
        const { error: e2 } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: data.userId, role: data.role });
        if (e2) throw new Error(e2.message);
      }
    }
    if (data.status !== "approved") {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    }
    return { ok: true };
  });

/** Le professeur approuve un élève de sa classe et lui donne le rôle élève. */
export const reviewStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { memberId: string; status: "approved" | "rejected" }) => d)
  .handler(async ({ data, context }) => {
    const { data: member, error } = await context.supabase
      .from("class_members")
      .select("id, student_id, class_id, classes!inner(prof_id)")
      .eq("id", data.memberId)
      .maybeSingle();
    if (error || !member) throw new Error("Demande introuvable.");

    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    const prof = (member as unknown as { classes: { prof_id: string } }).classes?.prof_id;
    if (prof !== context.userId && !isAdmin) throw new Error("Accès refusé.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("class_members")
      .update({ status: data.status })
      .eq("id", data.memberId);

    if (data.status === "approved") {
      const studentId = (member as unknown as { student_id: string }).student_id;
      await supabaseAdmin.from("profiles").update({ status: "approved" }).eq("id", studentId);
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: studentId, role: "eleve" }, { onConflict: "user_id,role" });
    }
    return { ok: true };
  });

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Accès refusé.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    return {
      profiles: profiles ?? [],
      roles: (roles ?? []) as { user_id: string; role: Role }[],
    };
  });
