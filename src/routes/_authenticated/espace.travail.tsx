import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { matiereLabel } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/espace/travail")({
  component: TravailPage,
});

type Eval = {
  id: string;
  titre: string;
  type: string;
  matiere: string;
  niveau: number;
  trimestre: number;
  duree_minutes: number;
  consignes: string | null;
};

function TravailPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Eval[]>([]);
  const [subs, setSubs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("assessments")
        .select("id, titre, type, matiere, niveau, trimestre, duree_minutes, consignes")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setItems((data ?? []) as Eval[]);
      const { data: s } = await supabase
        .from("submissions")
        .select("assessment_id, status")
        .eq("student_id", user.id);
      const map: Record<string, string> = {};
      for (const x of (s ?? []) as { assessment_id: string; status: string }[])
        map[x.assessment_id] = x.status;
      setSubs(map);
    })();
  }, [user]);

  return (
    <AppShell>
      <PageHeader
        title="Devoirs & examens"
        subtitle="Vos travaux à faire, avec minuteur et surveillance pour les examens."
      />

      <div className="space-y-3">
        {items.map((a) => {
          const etat = subs[a.id];
          return (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={a.type === "examen" ? "default" : "secondary"}>
                      {a.type === "examen" ? "Examen" : "Devoir maison"}
                    </Badge>
                    <Badge variant="outline">{matiereLabel(a.matiere)}</Badge>
                    {etat && (
                      <Badge variant="outline">
                        {etat === "graded" ? "Corrigé" : etat === "submitted" ? "Rendu" : "En cours"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 font-display text-lg font-semibold">{a.titre}</p>
                  <p className="text-sm text-muted-foreground">
                    Durée : {a.duree_minutes} min · trimestre {a.trimestre}
                  </p>
                </div>
                {etat === "submitted" || etat === "graded" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/espace/resultats">Voir ma copie</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/espace/passer/$id" params={{ id: a.id }}>
                      Commencer
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && <p className="text-muted-foreground">Rien à faire pour l'instant.</p>}
      </div>
    </AppShell>
  );
}
