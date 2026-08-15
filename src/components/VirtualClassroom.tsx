import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  Loader2,
  Radio,
  UserCheck,
  UserX,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LiveSession = {
  id: string;
  class_id: string;
  prof_id: string;
  titre: string;
  lesson_id: string | null;
  course_id: string | null;
  current_step: number;
  activity: { assessment_id?: string; titre?: string; type?: string } | null;
  active: boolean;
  started_at: string;
};

type Lecon = { id: string; title: string; lesson_no: number; module_id: string };
type Etape = { id: string; step_no: number; title: string; kind: string };
type Devoir = { id: string; titre: string; type: string; duree_minutes: number };
type Membre = { student_id: string; nom: string };

type Presence = { user_id: string; nom: string; role: string };

export function VirtualClassroom({
  classId,
  members,
}: {
  classId: string;
  members: Membre[];
}) {
  const { user, profile, isProf } = useAuth();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [present, setPresent] = useState<Presence[]>([]);
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [sorties, setSorties] = useState<{ nom: string; at: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const nom = profile?.full_name || "Participant";

  /* Séance en direct de la classe */
  const charger = useCallback(async () => {
    const { data } = await supabase
      .from("live_sessions")
      .select("*")
      .eq("class_id", classId)
      .eq("active", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession((data as LiveSession | null) ?? null);
  }, [classId]);

  useEffect(() => {
    void charger();
    const ch = supabase
      .channel(`live-db-${classId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_sessions", filter: `class_id=eq.${classId}` },
        () => void charger(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [classId, charger]);

  /* Catalogue des séances et des devoirs pour le professeur */
  useEffect(() => {
    if (!isProf) return;
    void (async () => {
      const [{ data: l }, { data: d }] = await Promise.all([
        supabase
          .from("curriculum_lessons")
          .select("id, title, lesson_no, module_id")
          .order("lesson_no")
          .limit(300),
        supabase
          .from("assessments")
          .select("id, titre, type, duree_minutes")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      setLecons((l ?? []) as Lecon[]);
      setDevoirs((d ?? []) as Devoir[]);
    })();
  }, [isProf]);

  /* Étapes de la séance sélectionnée */
  useEffect(() => {
    if (!session?.lesson_id) {
      setEtapes([]);
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("lesson_steps")
        .select("id, step_no, title, kind")
        .eq("lesson_id", session.lesson_id!)
        .order("step_no");
      setEtapes((data ?? []) as Etape[]);
    })();
  }, [session?.lesson_id]);

  /* Présence temps réel + détection des sorties de l'application */
  useEffect(() => {
    if (!session?.id || !user) return;
    const ch = supabase.channel(`live-presence-${session.id}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<Presence>();
      setPresent(Object.values(state).map((v) => v[0]!).filter(Boolean));
    });
    ch.on("broadcast", { event: "sortie" }, ({ payload }) => {
      setSorties((s) => [{ nom: payload.nom, at: new Date().toISOString() }, ...s].slice(0, 30));
      if (isProf) toast.warning(`${payload.nom} a quitté l'application.`);
    });
    ch.on("broadcast", { event: "retour" }, ({ payload }) => {
      if (isProf) toast.info(`${payload.nom} est revenu en classe.`);
    });

    void ch.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      await ch.track({ user_id: user.id, nom, role: isProf ? "prof" : "eleve" });
      if (!isProf) {
        await supabase
          .from("live_attendance")
          .upsert(
            { session_id: session.id, student_id: user.id, present: true, last_seen_at: new Date().toISOString() },
            { onConflict: "session_id,student_id" },
          );
      }
    });

    const onVisibility = () => {
      const parti = document.visibilityState === "hidden";
      void ch.send({
        type: "broadcast",
        event: parti ? "sortie" : "retour",
        payload: { nom, user_id: user.id },
      });
      if (!isProf) {
        void supabase
          .from("live_attendance")
          .update({
            present: !parti,
            last_seen_at: new Date().toISOString(),
            ...(parti ? { left_at: new Date().toISOString() } : {}),
          })
          .eq("session_id", session.id)
          .eq("student_id", user.id);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [session?.id, user, nom, isProf]);

  const presentIds = useMemo(() => new Set(present.map((p) => p.user_id)), [present]);
  const absents = members.filter((m) => !presentIds.has(m.student_id));
  const elevesPresents = present.filter((p) => p.role === "eleve");
  const profPresent = present.find((p) => p.role === "prof");

  const ouvrir = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("live_sessions").insert({
      class_id: classId,
      prof_id: user.id,
      titre: "Classe virtuelle du jour",
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Classe virtuelle ouverte.");
      await charger();
    }
  };

  const fermer = async () => {
    if (!session) return;
    await supabase
      .from("live_sessions")
      .update({ active: false, ended_at: new Date().toISOString() })
      .eq("id", session.id);
    toast.success("Classe virtuelle fermée.");
    await charger();
  };

  const maj = async (patch: Partial<LiveSession>) => {
    if (!session) return;
    const { error } = await supabase.from("live_sessions").update(patch).eq("id", session.id);
    if (error) toast.error(error.message);
    else await charger();
  };

  const etapeCourante = etapes[session?.current_step ?? 0];

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Video className="size-5" /> Classe virtuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isProf
              ? "Ouvrez la classe virtuelle : les élèves connectés apparaîtront en direct et suivront la séance que vous choisissez."
              : "Aucune classe virtuelle en cours. Ton professeur t'avertira à l'ouverture."}
          </p>
          {isProf && (
            <Button onClick={() => void ouvrir()} disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Radio className="mr-2 size-4" />}
              Ouvrir la classe virtuelle
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/40">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-3 animate-ping rounded-full bg-destructive/70" />
              <span className="relative inline-flex size-3 rounded-full bg-destructive" />
            </span>
            {session.titre}
          </CardTitle>
          {isProf && (
            <Button variant="outline" size="sm" onClick={() => void fermer()}>
              <DoorOpen className="mr-2 size-4" /> Fermer
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isProf && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Séance du jour</p>
                <Select
                  value={session.lesson_id ?? ""}
                  onValueChange={(v) => void maj({ lesson_id: v, current_step: 0 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une séance du programme" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {lecons.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        Séance {l.lesson_no} — {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Exercice / devoir en temps réel
                </p>
                <Select
                  value={session.activity?.assessment_id ?? ""}
                  onValueChange={(v) => {
                    const d = devoirs.find((x) => x.id === v);
                    void maj({
                      activity: { assessment_id: v, titre: d?.titre ?? "Activité", type: d?.type ?? "devoir" },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lancer un devoir ou un examen" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {devoirs.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.titre} ({d.duree_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {session.lesson_id && (
            <div className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Étape {(session.current_step ?? 0) + 1} / {Math.max(etapes.length, 1)}
                  </p>
                  <p className="font-medium">{etapeCourante?.title ?? "Séance en cours"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/espace/seance/$lessonId" params={{ lessonId: session.lesson_id }}>
                      Ouvrir la séance
                    </Link>
                  </Button>
                  {isProf && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Étape précédente"
                        disabled={(session.current_step ?? 0) === 0}
                        onClick={() => void maj({ current_step: (session.current_step ?? 0) - 1 })}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        aria-label="Étape suivante"
                        disabled={(session.current_step ?? 0) >= etapes.length - 1}
                        onClick={() => void maj({ current_step: (session.current_step ?? 0) + 1 })}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {etapes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {etapes.map((e, i) => (
                    <span
                      key={e.id}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= (session.current_step ?? 0) ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {session.activity?.assessment_id && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <ClipboardList className="size-4" /> Activité en direct : {session.activity.titre}
              </p>
              {!isProf && (
                <Button asChild size="sm">
                  <Link to="/espace/passer/$id" params={{ id: session.activity.assessment_id }}>
                    Commencer maintenant
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Video className="size-4" /> Salle de classe virtuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomStage
            prof={profPresent}
            eleves={elevesPresents}
            titreTableau={etapeCourante?.title ?? session.titre}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <UserCheck className="size-4 text-primary" /> Présents ({elevesPresents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profPresent && (
              <div className="flex items-center justify-between text-sm">
                <span>{profPresent.nom}</span>
                <Badge>Professeur</Badge>
              </div>
            )}
            {elevesPresents.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between text-sm">
                <span>{p.nom}</span>
                <Badge variant="secondary">En ligne</Badge>
              </div>
            ))}
            {elevesPresents.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun élève connecté pour l'instant.</p>
            )}
          </CardContent>
        </Card>

        {isProf && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <UserX className="size-4 text-destructive" /> Absents ({absents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {absents.map((a) => (
                <div key={a.student_id} className="flex items-center justify-between text-sm">
                  <span>{a.nom}</span>
                  <Badge variant="outline">Absent</Badge>
                </div>
              ))}
              {absents.length === 0 && (
                <p className="text-sm text-muted-foreground">Toute la classe est présente.</p>
              )}
              {sorties.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Sorties détectées de l'application
                  </p>
                  {sorties.map((s, i) => (
                    <p key={`${s.nom}-${i}`} className="text-xs text-muted-foreground">
                      {s.nom} —{" "}
                      {new Date(s.at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
