import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { matiereLabel } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/espace/evaluations/")({
  component: EvaluationsPage,
});

type Eval = {
  id: string;
  titre: string;
  type: string;
  matiere: string;
  niveau: number;
  trimestre: number;
  duree_minutes: number;
  published: boolean;
};

function EvaluationsPage() {
  const [items, setItems] = useState<Eval[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("assessments")
        .select("id, titre, type, matiere, niveau, trimestre, duree_minutes, published")
        .order("created_at", { ascending: false });
      const list = (data ?? []) as Eval[];
      setItems(list);
      const { data: subs } = await supabase
        .from("submissions")
        .select("assessment_id, status");
      const c: Record<string, number> = {};
      for (const s of (subs ?? []) as { assessment_id: string; status: string }[]) {
        if (s.status === "submitted") c[s.assessment_id] = (c[s.assessment_id] ?? 0) + 1;
      }
      setCounts(c);
    })();
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Devoirs & examens"
        subtitle="Créez, publiez et corrigez les travaux de vos élèves."
        action={
          <Button asChild>
            <Link to="/espace/evaluations/nouveau">Nouvelle évaluation</Link>
          </Button>
        }
      />

      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={a.type === "examen" ? "default" : "secondary"}>
                    {a.type === "examen" ? "Examen" : "Devoir maison"}
                  </Badge>
                  <Badge variant="outline">{matiereLabel(a.matiere)}</Badge>
                  {!a.published && <Badge variant="outline">Brouillon</Badge>}
                </div>
                <p className="mt-2 font-display text-lg font-semibold">{a.titre}</p>
                <p className="text-sm text-muted-foreground">
                  {a.niveau}ème année · trimestre {a.trimestre} · {a.duree_minutes} min ·{" "}
                  {counts[a.id] ?? 0} copie(s) rendue(s)
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/espace/evaluations/$id" params={{ id: a.id }}>
                  Ouvrir & corriger
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground">Aucune évaluation pour le moment.</p>
        )}
      </div>
    </AppShell>
  );
}
