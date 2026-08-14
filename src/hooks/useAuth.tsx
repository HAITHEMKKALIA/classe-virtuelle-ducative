import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "prof" | "eleve";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  niveau: number | null;
  requested_role: AppRole;
  status: "pending" | "approved" | "rejected";
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void load(data.session.user.id);
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => void load(s.user.id), 0);
      else {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = roles.includes("super_admin");
  const isProf = roles.includes("prof") || isAdmin;
  const isEleve = roles.includes("eleve");
  const approved = profile?.status === "approved";

  return {
    session,
    user,
    profile,
    roles,
    loading,
    isAdmin,
    isProf,
    isEleve,
    approved,
    refresh: () => (user ? load(user.id) : Promise.resolve()),
  };
}
