import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/espace/resultats")({
  component: ResultatsPage,
});

type Row = {
  id: string;
  status: string;
  score: number | null;
  total: number | null;
  feedback: string | null;
  answers: Record<string, string>;
  per_question: Record<string, { note: number; commentaire: string }>;
  assessments: { titre: string; type: string } | null;
  assessment_id: string;
};

type Q = { id: string; ordre: number; enonce: string; points: number; assessment_id: string };

function ResultatsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [questions, setQuestions] = useState<Q[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*, assessments:assessment_id(titre, type)")
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false });
      const list = (data ?? []) as unknown as Row[];
      setRows(list);
      if (list.length) {
        const { data: qs } = await supabase
          .from("questions")
          .select("id, ordre, enonce, points, assessment_id")
          .in("assessment_id", list.map((r) => r.assessment_id));
        setQuestions((qs ?? []) as Q[]);
      }
    })();
  }, [user]);

  return (
    <AppShell>
      <PageHeader title="Mes résultats" subtitle="Vos notes et les corrections du professeur." />

      <div className="space-y-4">
        {rows.map((r) => {
          const qs = questions
            .filter((q) => q.assessment_id === r.assessment_id)
            .sort((a, b) => a.ordre - b.ordre);
          return (
            <Card key={r.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {r.assessments?.titre ?? "Évaluation"}
                    </p>
                    <Badge variant="outline">
                      {r.assessments?.type === "examen" ? "Examen" : "Devoir maison"}
                    </Badge>
                  </div>
                  <Badge variant={r.status === "graded" ? "default" : "secondary"}>
                    {r.status === "graded" ? `${r.score} / ${r.total}` : "En attente de correction"}
                  </Badge>
                </div>
                {r.feedback && <p className="text-sm text-muted-foreground">{r.feedback}</p>}
                {r.status === "graded" && (
                  <div className="space-y-2">
                    {qs.map((q) => (
                      <div key={q.id} className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-medium">
                          {q.ordre}. {q.enonce}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Votre réponse : {r.answers?.[q.id] || "—"}
                        </p>
                        <p className="mt-1">
                          Note : {r.per_question?.[q.id]?.note ?? 0}/{q.points}
                          {r.per_question?.[q.id]?.commentaire
                            ? ` — ${r.per_question[q.id]?.commentaire}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="text-muted-foreground">Aucun résultat pour l'instant.</p>}
      </div>
    </AppShell>
  );
}
