import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/")({
  component: Dashboard,
});

function Dashboard() {
  const { profile, roles, isAdmin, isProf, loading, refresh } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ classes: 0, cours: 0, evals: 0, aFaire: 0 });

  const pending = !isAdmin && roles.length === 0;

  useEffect(() => {
    if (!profile) return;
    void (async () => {
      const [c, co, ev, sub] = await Promise.all([
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("assessments").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        classes: c.count ?? 0,
        cours: co.count ?? 0,
        evals: ev.count ?? 0,
        aFaire: Math.max((ev.count ?? 0) - (sub.count ?? 0), 0),
      });
    })();
  }, [profile]);

  const rejoindre = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("join_class_by_code", {
      _code: code.trim().toUpperCase(),
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    if (!data) return void toast.error("Code de classe introuvable.");
    toast.success("Demande envoyée. Votre professeur doit l'approuver.");
    setCode("");
    void refresh();
  };

  return (
    <AppShell>
      <PageHeader
        title={`Bonjour ${profile?.full_name?.split(" ")[0] ?? ""}`}
        subtitle="Votre espace de cours de français à distance."
      />

      {loading && <p className="text-muted-foreground">Chargement…</p>}

      {pending && (
        <Card className="mb-8 border-accent">
          <CardHeader>
            <CardTitle className="font-display">Compte en attente d'approbation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              {profile?.requested_role === "prof"
                ? "Votre compte professeur doit être validé par le super administrateur."
                : "Rejoignez votre classe avec le code donné par votre professeur, puis attendez son approbation."}
            </p>
            {profile?.requested_role !== "prof" && (
              <div className="flex gap-2">
                <Input
                  placeholder="Code de la classe (ex : 5A2X9K)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={rejoindre} disabled={busy || code.length < 4}>
                  Rejoindre
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Classes", value: stats.classes, icon: Users },
          { label: "Cours disponibles", value: stats.cours, icon: BookOpen },
          { label: "Devoirs & examens", value: stats.evals, icon: ClipboardList },
          { label: isProf ? "À corriger" : "À rendre", value: stats.aFaire, icon: Clock },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {(isProf
          ? [
              { to: "/espace/classes", t: "Gérer mes classes", d: "Élèves, codes, messagerie." },
              { to: "/espace/cours", t: "Créer un cours", d: "Manuel, IA ou depuis un PDF." },
              {
                to: "/espace/evaluations",
                t: "Devoirs & examens",
                d: "Créer, publier, corriger.",
              },
            ]
          : [
              { to: "/espace/cours", t: "Mes cours", d: "Leçons illustrées par trimestre." },
              { to: "/espace/travail", t: "Mes devoirs", d: "Exercices et examens à faire." },
              { to: "/espace/resultats", t: "Mes résultats", d: "Notes et corrections." },
            ]
        ).map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
          >
            <p className="font-display text-lg font-semibold">{l.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l.d}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
