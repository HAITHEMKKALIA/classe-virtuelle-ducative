import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { suggestGrading } from "@/lib/ai.functions";
import { matiereLabel } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignedImage } from "@/components/SignedImage";
import { AlertTriangle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/evaluations/$id")({
  component: EvalDetail,
});

type Question = {
  id: string;
  ordre: number;
  type: string;
  enonce: string;
  options: string[];
  reponse_correcte: string | null;
  points: number;
  image_url: string | null;
};

type Submission = {
  id: string;
  student_id: string;
  status: string;
  answers: Record<string, string>;
  per_question: Record<string, { note: number; commentaire: string }>;
  cheat_events: { type: string; at: string }[];
  score: number | null;
  total: number | null;
  feedback: string | null;
  profiles?: { full_name: string } | null;
};

function EvalDetail() {
  const { id } = Route.useParams();
  const grade = useServerFn(suggestGrading);
  const [assessment, setAssessment] = useState<{
    titre: string;
    type: string;
    matiere: string;
    niveau: number;
    trimestre: number;
    published: boolean;
    duree_minutes: number;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [notes, setNotes] = useState<Record<string, { note: number; commentaire: string }>>({});
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    const [{ data: a }, { data: q }, { data: s }] = await Promise.all([
      supabase.from("assessments").select("*").eq("id", id).maybeSingle(),
      supabase.from("questions").select("*").eq("assessment_id", id).order("ordre"),
      supabase
        .from("submissions")
        .select("*, profiles:student_id(full_name)")
        .eq("assessment_id", id),
    ]);
    setAssessment(a as never);
    setQuestions((q ?? []) as unknown as Question[]);
    setSubs((s ?? []) as unknown as Submission[]);
  };

  useEffect(() => {
    void load();
  }, [id]);

  const copie = subs.find((s) => s.id === current);

  useEffect(() => {
    if (!copie) return;
    setNotes(copie.per_question ?? {});
    setFeedback(copie.feedback ?? "");
  }, [current]);

  const total = questions.reduce((s, q) => s + q.points, 0);
  const score = Object.values(notes).reduce((s, n) => s + (Number(n.note) || 0), 0);

  const aiderIA = async (q: Question) => {
    if (!copie) return;
    try {
      const res = await grade({
        data: {
          enonce: q.enonce,
          attendu: q.reponse_correcte ?? "",
          reponse: copie.answers?.[q.id] ?? "",
          points: q.points,
        },
      });
      setNotes((n) => ({ ...n, [q.id]: { note: res.note, commentaire: res.commentaire } }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const enregistrerCorrection = async () => {
    if (!copie) return;
    const { error } = await supabase
      .from("submissions")
      .update({
        per_question: notes,
        score,
        total,
        feedback,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", copie.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Correction envoyée à l'élève.");
    void load();
  };

  const publier = async () => {
    if (!assessment) return;
    const { error } = await supabase
      .from("assessments")
      .update({ published: !assessment.published })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAssessment({ ...assessment, published: !assessment.published });
  };

  return (
    <AppShell>
      <PageHeader
        title={assessment?.titre ?? "Évaluation"}
        subtitle={
          assessment
            ? `${assessment.type === "examen" ? "Examen" : "Devoir maison"} · ${matiereLabel(assessment.matiere)} · ${assessment.duree_minutes} min`
            : ""
        }
        action={
          assessment ? (
            <Button onClick={publier}>{assessment.published ? "Dépublier" : "Publier"}</Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="copies">
        <TabsList>
          <TabsTrigger value="copies">Copies ({subs.length})</TabsTrigger>
          <TabsTrigger value="sujet">Sujet ({questions.length} questions)</TabsTrigger>
        </TabsList>

        <TabsContent value="copies" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <div className="space-y-2">
              {subs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(s.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    current === s.id ? "border-primary bg-muted" : "border-border hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{s.profiles?.full_name ?? "Élève"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={s.status === "graded" ? "default" : "secondary"}>
                      {s.status === "graded"
                        ? `Corrigé ${s.score}/${s.total}`
                        : s.status === "submitted"
                          ? "À corriger"
                          : "En cours"}
                    </Badge>
                    {(s.cheat_events?.length ?? 0) > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 size-3" />
                        {s.cheat_events.length}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {subs.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune copie rendue.</p>
              )}
            </div>

            <div>
              {!copie && <p className="text-muted-foreground">Choisissez une copie à corriger.</p>}
              {copie && (
                <div className="space-y-4">
                  {(copie.cheat_events?.length ?? 0) > 0 && (
                    <Card className="border-destructive">
                      <CardHeader>
                        <CardTitle className="font-display text-base text-destructive">
                          Incidents détectés
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {copie.cheat_events.map((c, i) => (
                          <p key={i}>
                            {c.type} — {new Date(c.at).toLocaleString("fr-FR")}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {questions.map((q) => (
                    <Card key={q.id}>
                      <CardContent className="space-y-3 p-5">
                        <p className="font-medium">
                          {q.ordre}. {q.enonce}{" "}
                          <span className="text-sm text-muted-foreground">({q.points} pt)</span>
                        </p>
                        {q.image_url && (
                          <SignedImage
                            path={q.image_url}
                            alt={`Illustration de la question ${q.ordre}`}
                            className="h-40 rounded-lg object-cover"
                          />
                        )}
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          {copie.answers?.[q.id] || (
                            <span className="text-muted-foreground">Pas de réponse</span>
                          )}
                        </div>
                        {q.reponse_correcte && (
                          <p className="text-sm text-muted-foreground">
                            Attendu : {q.reponse_correcte}
                          </p>
                        )}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Note</Label>
                            <Input
                              type="number"
                              className="w-24"
                              max={q.points}
                              min={0}
                              value={notes[q.id]?.note ?? ""}
                              onChange={(e) =>
                                setNotes((n) => ({
                                  ...n,
                                  [q.id]: {
                                    note: Number(e.target.value),
                                    commentaire: n[q.id]?.commentaire ?? "",
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Remarque</Label>
                            <Input
                              value={notes[q.id]?.commentaire ?? ""}
                              onChange={(e) =>
                                setNotes((n) => ({
                                  ...n,
                                  [q.id]: {
                                    note: n[q.id]?.note ?? 0,
                                    commentaire: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => aiderIA(q)}>
                            <Sparkles className="mr-2 size-4" /> Aide IA
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardContent className="space-y-3 p-5">
                      <Label>Appréciation générale</Label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Bon travail, attention aux accords…"
                      />
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-semibold">
                          Total : {score} / {total}
                        </p>
                        <Button onClick={enregistrerCorrection}>Envoyer la correction</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sujet" className="mt-6 space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="space-y-2 p-5">
                <p className="font-medium">
                  {q.ordre}. {q.enonce}{" "}
                  <span className="text-sm text-muted-foreground">({q.points} pt)</span>
                </p>
                {q.image_url && (
                  <SignedImage
                    path={q.image_url}
                    alt={`Illustration de la question ${q.ordre}`}
                    className="h-40 rounded-lg object-cover"
                  />
                )}
                {q.type === "qcm" && (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {q.options.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
                {q.reponse_correcte && (
                  <p className="text-sm text-muted-foreground">Réponse : {q.reponse_correcte}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
