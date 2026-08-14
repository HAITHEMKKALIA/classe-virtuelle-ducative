import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATALOGUE, IMAGE_MATIERE, contenuLecon, type Lecon } from "@/lib/catalogue";
import { NIVEAUX, TRIMESTRES, matiereLabel } from "@/lib/programme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/espace/cours/importer")({
  component: ImporterPage,
  head: () => ({
    meta: [
      { title: "Importer le programme complet — Classe Française" },
      {
        name: "description",
        content:
          "Importer en un clic tous les cours illustrés du programme tunisien de français, 5ème et 6ème années, les trois trimestres.",
      },
      { property: "og:title", content: "Importer le programme complet de français" },
      {
        property: "og:description",
        content: "Cours complets illustrés, 5ème et 6ème années, trois trimestres.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ImporterPage() {
  const { user, isProf } = useAuth();
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState("5");
  const [trimestre, setTrimestre] = useState("1");
  const [existants, setExistants] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const charger = async () => {
    const { data } = await supabase.from("courses").select("titre, niveau, trimestre");
    setExistants(
      new Set((data ?? []).map((c) => `${c.niveau}|${c.trimestre}|${c.titre}`)),
    );
  };

  useEffect(() => {
    void charger();
  }, []);

  const cle = (l: Lecon) => `${l.niveau}|${l.trimestre}|${l.titre}`;

  const selection = useMemo(
    () =>
      CATALOGUE.filter(
        (l) => l.niveau === Number(niveau) && l.trimestre === Number(trimestre),
      ),
    [niveau, trimestre],
  );

  const importer = async (lecons: Lecon[]) => {
    if (!user) return;
    const aCreer = lecons.filter((l) => !existants.has(cle(l)));
    if (aCreer.length === 0) {
      toast.info("Ces cours sont déjà dans la bibliothèque.");
      return;
    }
    setBusy(true);
    const rows = aCreer.map((l) => ({
      prof_id: user.id,
      niveau: l.niveau,
      trimestre: l.trimestre,
      matiere: l.matiere,
      titre: l.titre,
      resume: `${l.module} — ${l.resume}`,
      contenu: contenuLecon(l),
      cover_image_url: IMAGE_MATIERE[l.matiere] ?? null,
      published: true,
    }));
    const { error } = await supabase.from("courses").insert(rows);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${rows.length} cours importés et publiés.`);
    await charger();
  };

  if (!isProf) {
    return (
      <AppShell>
        <PageHeader title="Importer le programme" subtitle="Réservé aux enseignants." />
      </AppShell>
    );
  }

  const manquants = CATALOGUE.filter((l) => !existants.has(cle(l))).length;

  return (
    <AppShell>
      <PageHeader
        title="Importer le programme complet"
        subtitle="Tous les cours illustrés du programme tunisien : 5ème et 6ème années, trois trimestres, toutes les matières."
        action={
          <Button disabled={busy || manquants === 0} onClick={() => void importer(CATALOGUE)}>
            {manquants === 0
              ? "Programme déjà importé"
              : `Tout importer (${manquants} cours)`}
          </Button>
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
        <Button variant="outline" disabled={busy} onClick={() => void importer(selection)}>
          Importer ce trimestre
        </Button>
        <Button variant="ghost" onClick={() => void navigate({ to: "/espace/cours" })}>
          Voir la bibliothèque
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {selection.map((l) => {
          const dedans = existants.has(cle(l));
          return (
            <Card key={l.titre} className="overflow-hidden">
              <img
                src={IMAGE_MATIERE[l.matiere]}
                alt={`Illustration du cours ${l.titre}`}
                loading="lazy"
                width={1024}
                height={640}
                className="h-32 w-full object-cover"
              />
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{matiereLabel(l.matiere)}</Badge>
                  {dedans ? (
                    <Badge>Importé</Badge>
                  ) : (
                    <Badge variant="outline">À importer</Badge>
                  )}
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold">{l.titre}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{l.module}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l.resume}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {l.objectifs.slice(0, 2).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
                {!dedans && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    disabled={busy}
                    onClick={() => void importer([l])}
                  >
                    Importer ce cours
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
