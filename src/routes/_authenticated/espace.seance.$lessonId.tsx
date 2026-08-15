import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Markdown } from "@/components/Markdown";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { corriger, isAutoCorrige, type ExerciseQuestion } from "@/lib/exercices";
import { generateLessonPath } from "@/lib/parcours.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/espace/seance/$lessonId")({
  head: () => ({
    meta: [
      { title: "Parcours de la séance | Classe Française" },
      {
        name: "description",
        content:
          "Parcours interactif en 8 étapes : découverte, règle, exercices guidés, remédiation et bilan.",
      },
      { property: "og:title", content: "Parcours de la séance | Classe Française" },
      {
        property: "og:description",
        content: "Séance de français en 8 étapes avec exercices corrigés automatiquement.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SeancePage,
});

type Step = {
  id: string;
  step_no: number;
  kind: string;
  title: string;
  content: string;
  payload: { questions?: ExerciseQuestion[]; image_prompt?: string } | null;
};

type Lesson = { id: string; title: string; lesson_type: string; estimated_minutes: number };

function SeancePage() {
  const { lessonId } = useParams({ from: "/_authenticated/espace/seance/$lessonId" });
  const { user, isProf } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [doneSteps, setDoneSteps] = useState<string[]>([]);

  const charger = useCallback(async () => {
    setLoading(true);
    const [{ data: l }, { data: s }] = await Promise.all([
      supabase
        .from("curriculum_lessons")
        .select("id, title, lesson_type, estimated_minutes")
        .eq("id", lessonId)
        .maybeSingle(),
      supabase
        .from("lesson_steps")
        .select("id, step_no, kind, title, content, payload")
        .eq("lesson_id", lessonId)
        .order("step_no"),
    ]);
    setLesson((l as Lesson) ?? null);
    setSteps((s as Step[]) ?? []);
    if (user) {
      const ids = ((s as Step[]) ?? []).map((x) => x.id);
      if (ids.length) {
        const { data: p } = await supabase
          .from("lesson_step_progress")
          .select("step_id, status")
          .eq("user_id", user.id)
          .in("step_id", ids);
        setDoneSteps((p ?? []).filter((x) => x.status === "completed").map((x) => x.step_id));
      }
    }
    setLoading(false);
  }, [lessonId, user]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const generer = async (regenerate: boolean) => {
    setGenerating(true);
    try {
      await generateLessonPath({ data: { lessonId, regenerate } });
      toast.success("Parcours prêt.");
      await charger();
      setIndex(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Génération impossible.");
    }
    setGenerating(false);
  };

  const step = steps[index];
  const questions = useMemo(() => step?.payload?.questions ?? [], [step]);

  const validerEtape = async () => {
    const next: Record<string, boolean> = { ...checked };
    let total = 0;
    let obtenu = 0;
    for (const q of questions) {
      next[q.id] = true;
      const points = Number(q.points) || 1;
      total += points;
      if (isAutoCorrige(q.type)) obtenu += corriger(q, answers[q.id] ?? "").note;
    }
    setChecked(next);
    const score = total ? Math.round((obtenu / total) * 100) : 100;

    if (user && step) {
      const { error } = await supabase.from("lesson_step_progress").upsert(
        {
          user_id: user.id,
          step_id: step.id,
          status: "completed",
          score,
          answers,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,step_id" },
      );
      if (error) toast.error("Progression non enregistrée.");
      else setDoneSteps((d) => (d.includes(step.id) ? d : [...d, step.id]));
    }
    if (questions.length) {
      toast.success(`Étape validée — ${score}% de réussite.`);
    }
  };

  const progression = steps.length ? Math.round((doneSteps.length / steps.length) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        title={lesson?.title ?? "Séance"}
        subtitle="Parcours interactif en 8 étapes"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/espace/cours">
                <ArrowLeft className="mr-2 size-4" /> Programme
              </Link>
            </Button>
            {isProf && steps.length > 0 && (
              <Button variant="outline" disabled={generating} onClick={() => void generer(true)}>
                {generating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Régénérer
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      ) : steps.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">
              Le parcours interactif de cette séance n'est pas encore préparé.
            </p>
            {isProf ? (
              <Button disabled={generating} onClick={() => void generer(false)}>
                {generating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                Générer le parcours avec l'IA
              </Button>
            ) : (
              <p className="text-sm">Ton professeur le publiera bientôt.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Étape {index + 1} / {steps.length}
              </span>
              <span>{progression}% du parcours</span>
            </div>
            <Progress value={progression} />
          </div>

          <div className="flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <Button
                key={s.id}
                size="sm"
                variant={i === index ? "default" : doneSteps.includes(s.id) ? "secondary" : "outline"}
                onClick={() => setIndex(i)}
              >
                {s.step_no}. {s.title}
              </Button>
            ))}
          </div>

          {step && (
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">{step.kind}</Badge>
                  <h2 className="font-display text-xl font-semibold">{step.title}</h2>
                </div>

                {step.content && <Markdown content={step.content} />}

                {questions.map((q) => {
                  const reponse = answers[q.id] ?? "";
                  const showCorrection = checked[q.id] && isAutoCorrige(q.type);
                  const res = showCorrection ? corriger(q, reponse) : null;
                  return (
                    <div key={q.id} className="rounded-xl border border-border p-4">
                      <p className="mb-3 font-medium">
                        {q.ordre}. {q.enonce}
                      </p>
                      <ExerciseRunner
                        question={q}
                        value={reponse}
                        disabled={Boolean(checked[q.id])}
                        onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                      />
                      {res && (
                        <div
                          className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
                            res.correct ? "bg-primary/10" : "bg-destructive/10"
                          }`}
                        >
                          {res.correct ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          ) : (
                            <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                          )}
                          <span>
                            {res.correct ? "Bravo !" : `Réponse attendue : ${res.attendu}`}
                            {q.explication ? ` — ${q.explication}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  >
                    <ArrowLeft className="mr-2 size-4" /> Précédent
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void validerEtape()}>
                      <CheckCircle2 className="mr-2 size-4" /> Valider l'étape
                    </Button>
                    <Button
                      disabled={index === steps.length - 1}
                      onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                    >
                      Suivant <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
