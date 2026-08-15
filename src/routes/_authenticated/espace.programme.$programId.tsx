import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Eye, Trash2, Upload } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  estImage,
  estPdf,
  tailleLisible,
  uploadFichierProgramme,
  urlSignee,
  urlTelechargement,
  type FichierProgramme,
  type ProgrammeManuel,
} from "@/lib/programme-manuel";

export const Route = createFileRoute("/_authenticated/espace/programme/$programId")({
  component: ProgrammeDetail,
  head: () => ({
    meta: [
      { title: "Détail du programme — Classe Française TN" },
      {
        name: "description",
        content:
          "Contenu du programme manuel et documents joints : aperçu direct et téléchargement des fichiers de cours.",
      },
      { property: "og:title", content: "Détail du programme — Classe Française TN" },
      {
        property: "og:description",
        content: "Consultez le programme rédigé par le professeur et ses documents joints.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProgrammeDetail() {
  const { programId } = Route.useParams();
  const { user, isProf } = useAuth();
  const [programme, setProgramme] = useState<ProgrammeManuel | null>(null);
  const [fichiers, setFichiers] = useState<FichierProgramme[]>([]);
  const [contenu, setContenu] = useState("");
  const [busy, setBusy] = useState(false);
  const [apercu, setApercu] = useState<{ url: string; f: FichierProgramme } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const proprietaire = !!programme && !!user && programme.prof_id === user.id;

  const load = async () => {
    const [{ data: p }, { data: f }] = await Promise.all([
      supabase.from("manual_programs").select("*").eq("id", programId).maybeSingle(),
      supabase
        .from("program_files")
        .select("*")
        .eq("program_id", programId)
        .order("created_at", { ascending: true }),
    ]);
    setProgramme((p as ProgrammeManuel) ?? null);
    setContenu(((p as ProgrammeManuel) ?? null)?.contenu ?? "");
    setFichiers((f ?? []) as FichierProgramme[]);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const enregistrer = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("manual_programs")
      .update({ contenu })
      .eq("id", programId);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Programme enregistré.");
  };

  const basculerPublication = async () => {
    if (!programme) return;
    const { error } = await supabase
      .from("manual_programs")
      .update({ published: !programme.published })
      .eq("id", programId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(programme.published ? "Programme masqué." : "Programme publié aux élèves.");
    void load();
  };

  const televerser = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const meta = await uploadFichierProgramme(file, user.id);
        const { error } = await supabase
          .from("program_files")
          .insert({ program_id: programId, prof_id: user.id, ...meta });
        if (error) throw error;
      }
      toast.success("Fichier(s) ajouté(s).");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec du téléversement.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const supprimer = async (f: FichierProgramme) => {
    await supabase.storage.from("media").remove([f.path]);
    const { error } = await supabase.from("program_files").delete().eq("id", f.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Fichier supprimé.");
      void load();
    }
  };

  const ouvrirApercu = async (f: FichierProgramme) => {
    const url = await urlSignee(f.path);
    if (!url) {
      toast.error("Aperçu indisponible.");
      return;
    }
    setApercu({ url, f });
  };

  const telecharger = async (f: FichierProgramme) => {
    const url = await urlTelechargement(f.path, f.nom);
    if (!url) {
      toast.error("Téléchargement indisponible.");
      return;
    }
    window.open(url, "_blank", "noopener");
  };

  if (!programme) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Programme introuvable ou non accessible.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/espace/programme">
          <ArrowLeft className="mr-2 size-4" /> Retour aux programmes
        </Link>
      </Button>

      <PageHeader
        title={programme.titre}
        subtitle={[
          programme.niveau ? `${programme.niveau}ème année` : null,
          programme.trimestre ? `Trimestre ${programme.trimestre}` : null,
          programme.description,
        ]
          .filter(Boolean)
          .join(" · ")}
        action={
          proprietaire ? (
            <Button variant={programme.published ? "outline" : "default"} onClick={basculerPublication}>
              {programme.published ? "Masquer aux élèves" : "Publier aux élèves"}
            </Button>
          ) : (
            <Badge variant="secondary">Publié par votre professeur</Badge>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Contenu du programme</h2>
            {proprietaire ? (
              <div className="mt-4 space-y-3">
                <Textarea rows={16} value={contenu} onChange={(e) => setContenu(e.target.value)} />
                <Button onClick={enregistrer} disabled={busy}>
                  Enregistrer
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                {programme.contenu ? (
                  <Markdown content={programme.contenu} />
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun contenu rédigé.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Documents joints</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF, Word, images… {isProf && proprietaire ? "25 Mo maximum par fichier." : ""}
            </p>

            {proprietaire && (
              <div className="mt-4">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => void televerser(e.target.files)}
                />
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 size-4" /> Téléverser des fichiers
                </Button>
              </div>
            )}

            <ul className="mt-4 space-y-3">
              {fichiers.map((f) => (
                <li key={f.id} className="rounded-lg border border-border p-3">
                  <p className="truncate text-sm font-medium">{f.nom}</p>
                  <p className="text-xs text-muted-foreground">{tailleLisible(f.taille)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void ouvrirApercu(f)}>
                      <Eye className="mr-1 size-4" /> Aperçu
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void telecharger(f)}>
                      <Download className="mr-1 size-4" /> Télécharger
                    </Button>
                    {proprietaire && (
                      <Button size="sm" variant="ghost" onClick={() => void supprimer(f)}>
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
              {fichiers.length === 0 && (
                <li className="text-sm text-muted-foreground">Aucun document pour le moment.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {apercu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="truncate font-medium text-background">{apercu.f.nom}</p>
            <Button size="sm" variant="secondary" onClick={() => setApercu(null)}>
              Fermer
            </Button>
          </div>
          <div className="flex-1 overflow-auto rounded-xl bg-card p-3">
            {estImage(apercu.f.mime, apercu.f.nom) ? (
              <img src={apercu.url} alt={apercu.f.nom} className="mx-auto max-h-full" />
            ) : estPdf(apercu.f.mime, apercu.f.nom) ? (
              <iframe src={apercu.url} title={apercu.f.nom} className="h-full w-full" />
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Ce format ne peut pas être affiché directement.
                </p>
                <Button className="mt-3" onClick={() => void telecharger(apercu.f)}>
                  <Download className="mr-2 size-4" /> Télécharger le fichier
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
