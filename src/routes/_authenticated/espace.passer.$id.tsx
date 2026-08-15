import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignedImage } from "@/components/SignedImage";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/passer/$id")({
  component: PasserEval,
  head: () => ({
    meta: [
      { title: "Épreuve surveillée — Ma Classe de Français TN" },
      {
        name: "description",
        content:
          "Passer un devoir ou un examen de français en mode surveillé : minuteur serveur, autosauvegarde des réponses et journal d'incidents.",
      },
      { property: "og:title", content: "Épreuve surveillée de français" },
      {
        property: "og:description",
        content: "Minuteur serveur, autosauvegarde et reprise avant l'échéance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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

type EventType =
  | "sortie_page"
  | "copie"
  | "capture_ecran"
  | "raccourci_interdit"
  | "plein_ecran_quitte"
  | "deconnexion"
  | "reconnexion";

function PasserEval() {
  const { id } = Route.useParams();
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
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [incidents, setIncidents] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const dirtyRef = useRef(false);
  const submissionRef = useRef("");

  answersRef.current = answers;
  submissionRef.current = submissionId;

  const ac = assessment?.anti_cheat ?? {};

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("assessments")
        .select("titre, type, consignes, duree_minutes, anti_cheat")
        .eq("id", id)
        .maybeSingle();
      setAssessment(data as never);
    })();
  }, [id]);

  const rendre = useCallback(
    async (auto = false) => {
      const sid = submissionRef.current;
      if (submittedRef.current || !sid) return;
      submittedRef.current = true;
      const { error } = await supabase.rpc("save_assessment_progress", {
        _submission_id: sid,
        _answers: answersRef.current,
        _submit: true,
      });
      if (document.fullscreenElement) void document.exitFullscreen();
      if (error) {
        submittedRef.current = false;
        toast.error(error.message);
        return;
      }
      toast.success(auto ? "Temps écoulé : copie rendue." : "Copie rendue à votre professeur.");
      void navigate({ to: "/espace/resultats" });
    },
    [navigate],
  );

  const signaler = useCallback(
    (type: EventType) => {
      const sid = submissionRef.current;
      if (!sid) return;
      void supabase.rpc("log_assessment_event", { _submission_id: sid, _event_type: type });
      setIncidents((n) => {
        const next = n + 1;
        const max = ac.max_tab_switch ?? 3;
        if (type === "sortie_page" && next > max) {
          toast.error("Trop de sorties de la page : la copie est rendue.");
          setTimeout(() => void rendre(true), 200);
        } else {
          toast.warning(`Action signalée à votre professeur (${type}).`);
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
    const onFullscreen = () => {
      if (ac.fullscreen && !document.fullscreenElement) signaler("plein_ecran_quitte");
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
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("keydown", onKey);
    };
  }, [started, ac.block_copy, ac.fullscreen, signaler]);

  // Minuteur local, resynchronisé par le serveur à chaque autosauvegarde.
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

  // Autosauvegarde serveur toutes les 15 secondes.
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      if (!dirtyRef.current || submittedRef.current) return;
      dirtyRef.current = false;
      void (async () => {
        const { data, error } = await supabase.rpc("save_assessment_progress", {
          _submission_id: submissionRef.current,
          _answers: answersRef.current,
          _submit: false,
        });
        if (error) return;
        const res = data as { submitted: boolean; remaining_seconds: number } | null;
        if (!res) return;
        setRemaining(res.remaining_seconds);
        setSavedAt(new Date().toLocaleTimeString("fr-FR", { timeZone: "Africa/Tunis" }));
        if (res.submitted) {
          submittedRef.current = true;
          toast.info("Échéance atteinte : votre copie a été rendue automatiquement.");
          void navigate({ to: "/espace/resultats" });
        }
      })();
    }, 15000);
    return () => clearInterval(t);
  }, [started, navigate]);

  const majReponse = (qid: string, valeur: string) => {
    dirtyRef.current = true;
    setAnswers((a) => ({ ...a, [qid]: valeur }));
  };

  const commencer = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("start_assessment", { _assessment_id: id });
    const row = (data as { submission_id: string; remaining_seconds: number }[] | null)?.[0];
    if (error || !row) {
      setBusy(false);
      toast.error(error?.message ?? "Épreuve indisponible.");
      return;
    }
    if (row.remaining_seconds <= 0) {
      setBusy(false);
      toast.error("L'échéance de cette épreuve est dépassée.");
      return;
    }
    const { data: qs, error: qErr } = await supabase.rpc("get_assessment_questions_for_student", {
      _assessment_id: id,
    });
    setBusy(false);
    if (qErr) {
      toast.error(qErr.message);
      return;
    }
    setSubmissionId(row.submission_id);
    submissionRef.current = row.submission_id;
    setRemaining(row.remaining_seconds);
    setQuestions(
      ((qs ?? []) as Question[]).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })),
    );
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
                <Clock className="size-4" /> Durée : {assessment?.duree_minutes} minutes. L'échéance
                est calculée par le serveur ; la reprise reste possible avant l'échéance.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="size-4" /> Mode surveillé : plein écran, copie et clic droit
                bloqués. Vos réponses sont sauvegardées automatiquement.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="size-4" /> Les sorties de page et tentatives de capture
                d'écran sont signalées à votre professeur, à titre indicatif.
              </li>
            </ul>
            <Button onClick={() => void commencer()} disabled={busy}>
              Commencer l'épreuve
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-background select-none">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <div>
          <p className="font-display font-semibold">{assessment?.titre}</p>
          <p className="text-xs text-muted-foreground">
            Mode surveillé actif{savedAt ? ` — enregistré à ${savedAt}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {incidents > 0 && <Badge variant="destructive">{incidents} incident(s)</Badge>}
          <Badge variant="secondary" className="font-mono text-base">
            {mm}:{ss}
          </Badge>
          <Button size="sm" onClick={() => void rendre(false)}>
            Rendre ma copie
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 p-4">
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
                        onChange={() => majReponse(q.id, o)}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : q.type === "texte" ? (
                <Textarea
                  className="min-h-40"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => majReponse(q.id, e.target.value)}
                />
              ) : (
                <Input
                  value={answers[q.id] ?? ""}
                  onChange={(e) => majReponse(q.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        ))}
        <Button className="w-full" onClick={() => void rendre(false)}>
          Rendre ma copie
        </Button>
      </main>
    </div>
  );
}
