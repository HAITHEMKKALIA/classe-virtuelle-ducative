import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATALOGUE, IMAGE_MATIERE, contenuLecon, type Lecon } from "@/lib/catalogue";
import {
  AVERTISSEMENT_VALIDATION,
  chargerBibliotheque,
  cleImport,
  contenuBibliotheque,
  type Bibliotheque,
  type BibliothequeLecon,
} from "@/lib/complete-library";
import { NIVEAUX, TRIMESTRES, matiereLabel } from "@/lib/programme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/cours/importer")({
  component: ImporterPage,
  head: () => ({
    meta: [
      { title: "Bibliothèque complète — Ma Classe de Français TN" },
      {
        name: "description",
        content:
          "Importer en brouillon les 128 leçons illustrées, les textes, les dictées et les 32 modèles d'évaluation du programme de français des 5e et 6e années.",
      },
      { property: "og:title", content: "Bibliothèque complète de français, 5e et 6e années" },
      {
        property: "og:description",
        content: "128 leçons, 512 exercices, 128 illustrations et 32 modèles d'évaluation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type ClasseRow = { id: string; nom: string; niveau: number };

function ImporterPage() {
  const { user, isProf } = useAuth();
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState("5");
  const [trimestre, setTrimestre] = useState("1");
  const [source, setSource] = useState<"bibliotheque" | "catalogue">("bibliotheque");
  const [existants, setExistants] = useState<Set<string>>(new Set());
  const [evalsExistantes, setEvalsExistantes] = useState<Set<string>>(new Set());
  const [classes, setClasses] = useState<ClasseRow[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [biblio, setBiblio] = useState<Bibliotheque | null>(null);
  const [busy, setBusy] = useState(false);

  const charger = async () => {
    if (!user) return;
    const [{ data: cours }, { data: evals }, { data: cls }] = await Promise.all([
      supabase.from("courses").select("titre, niveau, trimestre, class_id").eq("prof_id", user.id),
      supabase
        .from("assessments")
        .select("titre, niveau, trimestre, class_id")
        .eq("prof_id", user.id),
      supabase.from("classes").select("id, nom, niveau").eq("prof_id", user.id).order("nom"),
    ]);
    setExistants(
      new Set(
        (cours ?? []).map((c) =>
          cleImport(user.id, c.class_id ?? null, c.niveau, c.trimestre, c.titre),
        ),
      ),
    );
    setEvalsExistantes(
      new Set(
        (evals ?? []).map((a) =>
          cleImport(user.id, a.class_id ?? null, a.niveau, a.trimestre, a.titre),
        ),
      ),
    );
    setClasses((cls ?? []) as ClasseRow[]);
  };

  useEffect(() => {
    void charger();
    void chargerBibliotheque()
      .then(setBiblio)
      .catch((e: unknown) =>
        toast.error(e instanceof Error ? e.message : "Bibliothèque illisible."),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cible = classId || null;

  const leconsFiltrees = useMemo(
    () =>
      (biblio?.lessons ?? []).filter(
        (l) => l.grade === Number(niveau) && l.trimestre === Number(trimestre),
      ),
    [biblio, niveau, trimestre],
  );

  const evalsFiltrees = useMemo(
    () =>
      (biblio?.assessments ?? []).filter(
        (a) => a.grade === Number(niveau) && a.trimestre === Number(trimestre),
      ),
    [biblio, niveau, trimestre],
  );

  const dejaImportee = (l: BibliothequeLecon) =>
    !!user && existants.has(cleImport(user.id, cible, l.grade, l.trimestre, l.titre));

  const importerLecons = async (lecons: BibliothequeLecon[]) => {
    if (!user || !biblio) return;
    const aCreer = lecons.filter((l) => !dejaImportee(l));
    if (aCreer.length === 0) {
      toast.info("Ces leçons sont déjà dans votre bibliothèque.");
      return;
    }
    setBusy(true);
    const rows = aCreer.map((l) => ({
      prof_id: user.id,
      class_id: cible,
      niveau: l.grade,
      trimestre: l.trimestre,
      matiere: l.matiere,
      titre: l.titre,
      resume: l.resume,
      contenu: contenuBibliotheque(
        l,
        biblio.exercices,
        biblio.textes.find((t) => t.id === l.texte_id),
        biblio.dictees.find((d) => d.id === l.dictee_id),
      ),
      cover_image_url: l.illustration,
      published: false,
    }));
    const { error } = await supabase.from("courses").insert(rows);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${rows.length} leçons importées en brouillon. À vérifier avant publication.`);
    await charger();
  };

  const importerEvaluations = async () => {
    if (!user || !biblio) return;
    if (!cible) {
      toast.error("Choisissez une classe : une évaluation doit être rattachée à votre classe.");
      return;
    }
    const aCreer = evalsFiltrees.filter(
      (a) => !evalsExistantes.has(cleImport(user.id, cible, a.grade, a.trimestre, a.titre)),
    );
    if (aCreer.length === 0) {
      toast.info("Ces modèles d'évaluation sont déjà importés pour cette classe.");
      return;
    }
    setBusy(true);
    for (const a of aCreer) {
      const { data, error } = await supabase
        .from("assessments")
        .insert({
          prof_id: user.id,
          class_id: cible,
          type: a.type,
          titre: a.titre,
          consignes: `${a.consignes}\n\n${AVERTISSEMENT_VALIDATION}`,
          niveau: a.grade,
          trimestre: a.trimestre,
          matiere: a.matiere,
          duree_minutes: a.duree_minutes,
          anti_cheat: a.anti_cheat,
          competences: a.competences,
          published: false,
          resultats_publies: false,
        })
        .select("id")
        .maybeSingle();
      if (error || !data) {
        setBusy(false);
        toast.error(error?.message ?? "Import interrompu.");
        return;
      }
      const { error: qErr } = await supabase.from("questions").insert(
        a.questions.map((q) => ({
          assessment_id: data.id,
          ordre: q.ordre,
          type: q.type,
          enonce: q.enonce,
          options: q.options,
          reponse_correcte: q.reponse_correcte,
          points: q.points,
          image_url: q.image_url,
        })),
      );
      if (qErr) {
        setBusy(false);
        toast.error(qErr.message);
        return;
      }
    }
    setBusy(false);
    toast.success(`${aCreer.length} modèles d'évaluation importés en brouillon.`);
    await charger();
  };

  /* ----- ancien catalogue illustré ----- */
  const cleCatalogue = (l: Lecon) =>
    user ? cleImport(user.id, cible, l.niveau, l.trimestre, l.titre) : "";
  const selectionCatalogue = useMemo(
    () => CATALOGUE.filter((l) => l.niveau === Number(niveau) && l.trimestre === Number(trimestre)),
    [niveau, trimestre],
  );

  const importerCatalogue = async (lecons: Lecon[]) => {
    if (!user) return;
    const aCreer = lecons.filter((l) => !existants.has(cleCatalogue(l)));
    if (aCreer.length === 0) {
      toast.info("Ces cours sont déjà dans la bibliothèque.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("courses").insert(
      aCreer.map((l) => ({
        prof_id: user.id,
        class_id: cible,
        niveau: l.niveau,
        trimestre: l.trimestre,
        matiere: l.matiere,
        titre: l.titre,
        resume: `${l.module} — ${l.resume}`,
        contenu: contenuLecon(l),
        cover_image_url: IMAGE_MATIERE[l.matiere] ?? null,
        published: false,
      })),
    );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${aCreer.length} cours importés en brouillon.`);
    await charger();
  };

  if (!isProf) {
    return (
      <AppShell>
        <PageHeader title="Importer le programme" subtitle="Réservé aux enseignants." />
      </AppShell>
    );
  }

  const manquantes = (biblio?.lessons ?? []).filter((l) => !dejaImportee(l)).length;

  return (
    <AppShell>
      <PageHeader
        title="Bibliothèque complète"
        subtitle="128 leçons illustrées, 64 textes, 32 dictées, 512 exercices et 32 modèles d'évaluation, pour les 5e et 6e années."
        action={
          <Button
            disabled={busy || !biblio || manquantes === 0}
            onClick={() => void importerLecons(biblio?.lessons ?? [])}
          >
            {manquantes === 0
              ? "Bibliothèque déjà importée"
              : `Tout importer (${manquantes} leçons)`}
          </Button>
        }
      />

      <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex gap-3 p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            {AVERTISSEMENT_VALIDATION} Contenu original : aucun manuel protégé du CNP n'est
            reproduit.
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs value={source} onValueChange={(v) => setSource(v as typeof source)}>
          <TabsList>
            <TabsTrigger value="bibliotheque">Bibliothèque complète</TabsTrigger>
            <TabsTrigger value="catalogue">Cours illustrés</TabsTrigger>
          </TabsList>
        </Tabs>
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
        <Select
          value={classId || "aucune"}
          onValueChange={(v) => setClassId(v === "aucune" ? "" : v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Classe de destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aucune">Sans classe (bibliothèque)</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nom} — {c.niveau}e année
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {source === "bibliotheque" ? (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void importerLecons(leconsFiltrees)}
            >
              Importer ce trimestre ({leconsFiltrees.length} leçons)
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void importerEvaluations()}>
              Importer les {evalsFiltrees.length} modèles d'évaluation
            </Button>
            <Button variant="ghost" onClick={() => void navigate({ to: "/espace/cours" })}>
              Voir mes cours
            </Button>
          </div>

          {biblio && biblio.avertissements.length > 0 && (
            <p className="mb-4 text-sm text-destructive">
              {biblio.avertissements.length} référence(s) à vérifier :{" "}
              {biblio.avertissements.slice(0, 3).join(" ")}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leconsFiltrees.map((l) => {
              const dedans = dejaImportee(l);
              return (
                <Card key={l.id} className="overflow-hidden">
                  <img
                    src={l.illustration}
                    alt={`Illustration de la séance ${l.titre}`}
                    loading="lazy"
                    width={800}
                    height={500}
                    className="h-32 w-full object-cover"
                  />
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{matiereLabel(l.matiere)}</Badge>
                      <Badge variant="outline">Module {l.module_no}</Badge>
                      {dedans ? (
                        <Badge>Importée</Badge>
                      ) : (
                        <Badge variant="outline">À importer</Badge>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold">{l.titre}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Séance {l.seance_no}/8 — {l.duree_minutes} min
                    </p>
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
                        onClick={() => void importerLecons([l])}
                      >
                        Importer cette séance
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void importerCatalogue(selectionCatalogue)}
            >
              Importer ce trimestre
            </Button>
            <Button variant="ghost" onClick={() => void navigate({ to: "/espace/cours" })}>
              Voir mes cours
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectionCatalogue.map((l) => {
              const dedans = existants.has(cleCatalogue(l));
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
                    {!dedans && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        disabled={busy}
                        onClick={() => void importerCatalogue([l])}
                      >
                        Importer ce cours
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}
