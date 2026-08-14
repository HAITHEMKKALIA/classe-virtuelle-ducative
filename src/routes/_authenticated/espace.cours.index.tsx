import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MATIERES, NIVEAUX, PROGRAMME, TRIMESTRES, matiereLabel } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SignedImage } from "@/components/SignedImage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/espace/cours/")({
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

function CoursPage() {
  const { isProf, profile } = useAuth();
  const [cours, setCours] = useState<Cours[]>([]);
  const [niveau, setNiveau] = useState(String(profile?.niveau ?? 5));
  const [trimestre, setTrimestre] = useState("1");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, titre, resume, matiere, niveau, trimestre, published, cover_image_url")
        .order("created_at", { ascending: false });
      setCours((data ?? []) as Cours[]);
    })();
  }, []);

  const filtres = cours.filter(
    (c) => c.niveau === Number(niveau) && c.trimestre === Number(trimestre),
  );
  const modules = PROGRAMME[Number(niveau)]?.[Number(trimestre)] ?? [];

  return (
    <AppShell>
      <PageHeader
        title={isProf ? "Cours" : "Mes cours"}
        subtitle="Programme officiel tunisien, par niveau et par trimestre."
        action={
          isProf ? (
            <Button asChild>
              <Link to="/espace/cours/nouveau">Nouveau cours</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Tabs value={niveau} onValueChange={setNiveau}>
          <TabsList>
            {NIVEAUX.map((n) => (
              <TabsTrigger key={n.value} value={String(n.value)}>
                {n.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={trimestre} onValueChange={setTrimestre}>
          <TabsList>
            {TRIMESTRES.map((t) => (
              <TabsTrigger key={t.value} value={String(t.value)}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtres.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            {c.cover_image_url && (
              <SignedImage
                path={c.cover_image_url}
                alt={`Illustration du cours ${c.titre}`}
                className="h-36 w-full object-cover"
              />
            )}
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{matiereLabel(c.matiere)}</Badge>
                {!c.published && <Badge variant="outline">Brouillon</Badge>}
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold">{c.titre}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.resume}</p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link to="/espace/cours/$courseId" params={{ courseId: c.id }}>
                  Ouvrir
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtres.length === 0 && (
          <p className="text-muted-foreground">Aucun cours publié pour ce trimestre.</p>
        )}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Repères du programme</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {modules.map((m) => (
            <div key={m.module} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display font-semibold">{m.module}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {m.contenus.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {MATIERES.map((m) => (
            <span
              key={m.value}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {m.label}
            </span>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
