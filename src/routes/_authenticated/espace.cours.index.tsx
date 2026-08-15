import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, CheckCircle2, Clock3, Loader2, PlayCircle } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NIVEAUX, TRIMESTRES, matiereLabel } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/espace/cours/")({
  head: () => ({
    meta: [
      { title: "Programme et cours | Classe Française" },
      {
        name: "description",
        content: "Programme tunisien de français, cours illustrés et suivi des apprentissages.",
      },
      { property: "og:title", content: "Programme et cours | Classe Française" },
      {
        property: "og:description",
        content: "Programme tunisien de français, cours illustrés et suivi des apprentissages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoursPage,
});

type Cours = {
  id: string;
  titre: string;
  resume: string | null;
  matiere: string;
  niveau: number;
  trimestre: number;
  published: boolean;
  cover_image_url: string | null;
};

type NiveauProgramme = { id: string; grade: number };
type ModuleProgramme = {
  id: string;
  level_id: string;
  module_no: number;
  trimester: number;
  unit_no: number;
  title: string;
  theme: string;
};
type Seance = {
  id: string;
  module_id: string;
  lesson_no: number;
  title: string;
  lesson_type: string;
  estimated_minutes: number;
};
type Suivi = { lesson_id: string; status: string; score: number | null };

const TYPE_LABELS: Record<string, string> = {
  oral: "Expression orale",
  lecture: "Lecture",
  langue: "Étude de la langue",
  ecriture: "Expression écrite",
  integration: "Intégration",
};

function CoursPage() {
  const { isProf, profile, user } = useAuth();
  const [cours, setCours] = useState<Cours[]>([]);
  const [niveauxProgramme, setNiveauxProgramme] = useState<NiveauProgramme[]>([]);
  const [modulesProgramme, setModulesProgramme] = useState<ModuleProgramme[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [niveau, setNiveau] = useState(String(profile?.niveau ?? 5));
  const [trimestre, setTrimestre] = useState("1");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.niveau) setNiveau(String(profile.niveau));
  }, [profile?.niveau]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [courseResult, levelResult, moduleResult, lessonResult] = await Promise.all([
        supabase
          .from("courses")
          .select("id, titre, resume, matiere, niveau, trimestre, published, cover_image_url")
          .order("created_at", { ascending: false }),
        supabase.from("curriculum_levels").select("id, grade"),
        supabase
          .from("curriculum_modules")
          .select("id, level_id, module_no, trimester, unit_no, title, theme")
          .eq("published", true)
          .order("position"),
        supabase
          .from("curriculum_lessons")
          .select("id, module_id, lesson_no, title, lesson_type, estimated_minutes")
          .eq("published", true)
          .order("lesson_no"),
      ]);
      const progressResult = user
        ? await supabase
            .from("learner_progress")
            .select("lesson_id, status, score")
            .eq("user_id", user.id)
        : { data: [] };

      if (!active) return;
      setCours((courseResult.data ?? []) as Cours[]);
      setNiveauxProgramme((levelResult.data ?? []) as NiveauProgramme[]);
      setModulesProgramme((moduleResult.data ?? []) as ModuleProgramme[]);
      setSeances((lessonResult.data ?? []) as Seance[]);
      setSuivis((progressResult.data ?? []) as Suivi[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const coursFiltres = cours.filter(
    (course) => course.niveau === Number(niveau) && course.trimestre === Number(trimestre),
  );

  const modulesFiltres = useMemo(() => {
    const level = niveauxProgramme.find((item) => item.grade === Number(niveau));
    if (!level) return [];
    return modulesProgramme.filter(
      (module) => module.level_id === level.id && module.trimester === Number(trimestre),
    );
  }, [modulesProgramme, niveau, niveauxProgramme, trimestre]);

  const seancesFiltrees = seances.filter((lesson) =>
    modulesFiltres.some((module) => module.id === lesson.module_id),
  );
  const terminees = seancesFiltrees.filter(
    (lesson) => suivis.find((item) => item.lesson_id === lesson.id)?.status === "completed",
  ).length;
  const progression = seancesFiltrees.length
    ? Math.round((terminees / seancesFiltrees.length) * 100)
    : 0;

  const toggleLesson = async (lessonId: string) => {
    if (!user || isProf) return;
    const current = suivis.find((item) => item.lesson_id === lessonId);
    const completed = current?.status === "completed";
    setSavingId(lessonId);
    const next: Suivi = {
      lesson_id: lessonId,
      status: completed ? "in_progress" : "completed",
      score: current?.score ?? null,
    };
    const { error } = await supabase.from("learner_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: next.status,
        started_at: completed ? new Date().toISOString() : null,
        completed_at: completed ? null : new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (!error) {
      setSuivis((items) => [...items.filter((item) => item.lesson_id !== lessonId), next]);
    }
    setSavingId(null);
  };

  return (
    <AppShell>
      <PageHeader
        title={isProf ? "Programme & cours" : "Mes cours"}
        subtitle="Le parcours complet de français tunisien, organisé et suivi séance par séance."
        action={
          isProf ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/espace/cours/importer">Bibliothèque complète</Link>
              </Button>
              <Button asChild>
                <Link to="/espace/cours/nouveau">Nouveau cours</Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-8 flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Tabs value={niveau} onValueChange={setNiveau}>
            <TabsList>
              {NIVEAUX.map((item) => (
                <TabsTrigger key={item.value} value={String(item.value)}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs value={trimestre} onValueChange={setTrimestre}>
            <TabsList>
              {TRIMESTRES.map((item) => (
                <TabsTrigger key={item.value} value={String(item.value)}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="w-full lg:max-w-xs">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">{isProf ? "Séances du trimestre" : "Ma progression"}</span>
            <span className="text-muted-foreground">
              {isProf ? `${seancesFiltrees.length} séances` : `${terminees}/${seancesFiltrees.length} · ${progression}%`}
            </span>
          </div>
          <Progress value={isProf ? 100 : progression} aria-label="Progression du trimestre" />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Chargement du programme…
        </div>
      ) : (
        <>
          <section aria-labelledby="cours-publies">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 id="cours-publies" className="font-display text-2xl font-semibold">
                  Cours illustrés
                </h2>
                <p className="text-sm text-muted-foreground">
                  Leçons, règles, exemples, exercices d’application et corrigés.
                </p>
              </div>
              <Badge variant="secondary">{coursFiltres.length} cours</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coursFiltres.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <img
                    src={course.cover_image_url || `/assets-cours/${course.matiere}.jpg`}
                    alt={`Illustration de ${course.titre}`}
                    className="aspect-[16/8] w-full object-cover"
                    loading="lazy"
                  />
                  <CardContent className="p-5">
                    <Badge variant="secondary">{matiereLabel(course.matiere)}</Badge>
                    <h3 className="mt-3 line-clamp-2 font-display text-lg font-semibold">
                      {course.titre}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                      {course.resume}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-4">
                      <Link to="/espace/cours/$courseId" params={{ courseId: course.id }}>
                        <BookOpen /> Ouvrir le cours
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {coursFiltres.length === 0 && (
                <div className="col-span-full border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Les cours de ce trimestre sont en préparation. Le parcours détaillé reste disponible ci-dessous.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="parcours-officiel">
            <div className="mb-4">
              <h2 id="parcours-officiel" className="font-display text-2xl font-semibold">
                Parcours officiel du trimestre
              </h2>
              <p className="text-sm text-muted-foreground">
                Chaque module suit une progression de l’oral à l’intégration et à la remédiation.
              </p>
            </div>
            <Accordion type="multiple" defaultValue={modulesFiltres.slice(0, 1).map((item) => item.id)}>
              {modulesFiltres.map((module) => {
                const lessons = seances.filter((lesson) => lesson.module_id === module.id);
                const completed = lessons.filter(
                  (lesson) => suivis.find((item) => item.lesson_id === lesson.id)?.status === "completed",
                ).length;
                return (
                  <AccordionItem key={module.id} value={module.id} className="border-border">
                    <AccordionTrigger className="gap-4 py-5 hover:no-underline">
                      <span className="flex min-w-0 flex-1 items-center gap-4 text-left">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                          {module.module_no}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-base font-semibold">{module.title}</span>
                          <span className="mt-1 block text-xs font-normal text-muted-foreground">
                            Unité {module.unit_no} · {module.theme}
                          </span>
                        </span>
                      </span>
                      {!isProf && (
                        <Badge variant={completed === lessons.length ? "default" : "outline"}>
                          {completed}/{lessons.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      {(() => {
                        const detail = findModuleDetail(Number(niveau), module.module_no);
                        if (!detail) return null;
                        return (
                          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
                            <p className="mb-3 font-display text-sm font-semibold">Contenus indispensables</p>
                            <dl className="grid gap-3 sm:grid-cols-2">
                              {Object.entries(detail.domains).map(([domaine, items]) => (
                                <div key={domaine}>
                                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {domaine}
                                  </dt>
                                  <dd className="mt-1 text-sm">{items.join(" • ")}</dd>
                                </div>
                              ))}
                            </dl>
                            {detail.supports.length > 0 && (
                              <p className="mt-3 text-xs text-muted-foreground">
                                Supports suggérés : {detail.supports.join(" · ")}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      <div className="divide-y divide-border border-t border-border">

                        {lessons.map((lesson) => {
                          const suivi = suivis.find((item) => item.lesson_id === lesson.id);
                          const done = suivi?.status === "completed";
                          return (
                            <div
                              key={lesson.id}
                              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                {done ? (
                                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                ) : (
                                  <PlayCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium">
                                    Séance {lesson.lesson_no} · {lesson.title}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>{TYPE_LABELS[lesson.lesson_type] ?? lesson.lesson_type}</span>
                                    <span aria-hidden="true">·</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 className="size-3" /> {lesson.estimated_minutes} min
                                    </span>
                                    {suivi?.score !== null && suivi?.score !== undefined && (
                                      <span>· Score {suivi.score}%</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {!isProf && (
                                <Button
                                  size="sm"
                                  variant={done ? "secondary" : "outline"}
                                  disabled={savingId === lesson.id}
                                  onClick={() => void toggleLesson(lesson.id)}
                                >
                                  {savingId === lesson.id ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    <Check />
                                  )}
                                  {done ? "Terminée" : "Marquer terminée"}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        </>
      )}
    </AppShell>
  );
}