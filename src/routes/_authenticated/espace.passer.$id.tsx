import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignedImage } from "@/components/SignedImage";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/passer/$id")({
  component: PasserEval,
});

type Question = {
  id: string;
  ordre: number;
  type: string;
  enonce: string;
  options: string[];
  points: number;
  image_url: string | null;
};

type AntiCheat = {
  fullscreen?: boolean;
  block_copy?: boolean;
  max_tab_switch?: number;
  block_screenshot?: boolean;
};

function PasserEval() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<{
    titre: string;
    type: string;
    consignes: string | null;
    duree_minutes: number;
    anti_cheat: AntiCheat;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionId, setSubmissionId] = useState("");
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [incidents, setIncidents] = useState<{ type: string; at: string }[]>([]);
  const submittedRef = useRef(false);
  const incidentsRef = useRef<{ type: string; at: string }[]>([]);
  const answersRef = useRef<Record<string, string>>({});

  answersRef.current = answers;
  incidentsRef.current = incidents;

  const ac = assessment?.anti_cheat ?? {};

  useEffect(() => {
    void (async () => {
      const [{ data: a }, { data: q }] = await Promise.all([
        supabase
          .from("assessments")
          .select("titre, type, consignes, duree_minutes, anti_cheat")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("questions").select("*").eq("assessment_id", id).order("ordre"),
      ]);
      setAssessment(a as never);
      setQuestions((q ?? []) as unknown as Question[]);
      setRemaining(((a as { duree_minutes?: number } | null)?.duree_minutes ?? 30) * 60);
    })();
  }, [id]);

  const rendre = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !submissionId) return;
      submittedRef.current = true;
      await supabase
        .from("submissions")
        .update({
          answers: answersRef.current,
          cheat_events: incidentsRef.current,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
      if (document.fullscreenElement) void document.exitFullscreen();
      toast.success(auto ? "Temps écoulé : copie rendue." : "Copie rendue à votre professeur.");
      void navigate({ to: "/espace/resultats" });
    },
    [submissionId, navigate],
  );

  const signaler = useCallback(
    (type: string) => {
      setIncidents((l) => {
        const next = [...l, { type, at: new Date().toISOString() }];
        const max = ac.max_tab_switch ?? 3;
        const sorties = next.filter((x) => x.type === "sortie_page").length;
        if (sorties > max) {
          toast.error("Trop de sorties de la page : la copie est rendue.");
          setTimeout(() => void rendre(true), 200);
        } else {
          toast.warning(`Action interdite détectée (${type}).`);
        }
        return next;
      });
    },
    [ac.max_tab_switch, rendre],
  );

  useEffect(() => {
    if (!started) return;
    const onVisible = () => {
      if (document.hidden) signaler("sortie_page");
    };
    const onCopy = (e: Event) => {
      if (ac.block_copy) {
        e.preventDefault();
        signaler("copie");
      }
    };
    const onContext = (e: Event) => {
      if (ac.block_copy) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "PrintScreen" || (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k))) {
        e.preventDefault();
        signaler("capture_ecran");
      }
      if (ac.block_copy && (e.ctrlKey || e.metaKey) && ["c", "v", "x", "p", "s", "u"].includes(k)) {
        e.preventDefault();
        signaler("raccourci_interdit");
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, [started, ac.block_copy, signaler]);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          void rendre(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, rendre]);

  const commencer = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("submissions")
      .select("id, status")
      .eq("assessment_id", id)
      .eq("student_id", user.id)
      .maybeSingle();
    let sid = existing?.id ?? "";
    if (existing && existing.status !== "in_progress") {
      toast.error("Vous avez déjà rendu cette copie.");
      return;
    }
    if (!sid) {
      const { data, error } = await supabase
        .from("submissions")
        .insert({ assessment_id: id, student_id: user.id, status: "in_progress" })
        .select("id")
        .maybeSingle();
      if (error || !data) {
        toast.error(error?.message ?? "Impossible de démarrer.");
        return;
      }
      sid = data.id;
    }
    setSubmissionId(sid);
    if (ac.fullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        /* refusé par le navigateur */
      }
    }
    setStarted(true);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  if (!started) {
    return (
      <AppShell>
        <PageHeader title={assessment?.titre ?? "Épreuve"} subtitle="Avant de commencer" />
        <Card className="max-w-2xl">
          <CardContent className="space-y-4 p-6">
            {assessment?.consignes && <p>{assessment.consignes}</p>}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Clock className="size-4" /> Durée : {assessment?.duree_minutes} minutes, minuteur
                automatique.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="size-4" /> Mode surveillé : plein écran, copie et clic droit
                bloqués.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="size-4" /> Les sorties de page et tentatives de capture
                d'écran sont enregistrées.
              </li>
            </ul>
            <Button onClick={commencer}>Commencer l'épreuve</Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-background select-none">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <div>
          <p className="font-display font-semibold">{assessment?.titre}</p>
          <p className="text-xs text-muted-foreground">Mode surveillé actif</p>
        </div>
        <div className="flex items-center gap-3">
          {incidents.length > 0 && (
            <Badge variant="destructive">{incidents.length} incident(s)</Badge>
          )}
          <Badge variant="secondary" className="font-mono text-base">
            {mm}:{ss}
          </Badge>
          <Button size="sm" onClick={() => rendre(false)}>
            Rendre ma copie
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 p-5">
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
                  className="max-h-64 rounded-lg object-cover"
                />
              )}
              {q.type === "qcm" ? (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === o}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: o }))}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : q.type === "texte" ? (
                <Textarea
                  className="min-h-40"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              ) : (
                <Input
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </CardContent>
          </Card>
        ))}
        <Button className="w-full" onClick={() => rendre(false)}>
          Rendre ma copie
        </Button>
      </main>
    </div>
  );
}
