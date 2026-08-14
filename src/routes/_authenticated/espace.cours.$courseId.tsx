import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { matiereLabel } from "@/lib/programme";
import { Markdown } from "@/components/Markdown";
import { SignedImage } from "@/components/SignedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/espace/cours/$courseId")({
  component: CoursDetail,
});

type Cours = {
  id: string;
  titre: string;
  resume: string | null;
  contenu: string;
  matiere: string;
  niveau: number;
  trimestre: number;
  published: boolean;
  cover_image_url: string | null;
  prof_id: string;
};

function CoursDetail() {
  const { courseId } = Route.useParams();
  const { user, isProf } = useAuth();
  const [cours, setCours] = useState<Cours | null>(null);
  const [edit, setEdit] = useState(false);
  const [contenu, setContenu] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();
      setCours((data as Cours) ?? null);
      setContenu((data as Cours)?.contenu ?? "");
    })();
  }, [courseId]);

  const enregistrer = async () => {
    const { error } = await supabase.from("courses").update({ contenu }).eq("id", courseId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cours mis à jour.");
    setEdit(false);
    setCours((c) => (c ? { ...c, contenu } : c));
  };

  const basculerPublication = async () => {
    if (!cours) return;
    const { error } = await supabase
      .from("courses")
      .update({ published: !cours.published })
      .eq("id", courseId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCours({ ...cours, published: !cours.published });
  };

  const proprietaire = isProf && cours?.prof_id === user?.id;

  return (
    <AppShell>
      {!cours && <p className="text-muted-foreground">Chargement…</p>}
      {cours && (
        <>
          <PageHeader
            title={cours.titre}
            subtitle={`${matiereLabel(cours.matiere)} · ${cours.niveau}ème année · trimestre ${cours.trimestre}`}
            action={
              proprietaire ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEdit((e) => !e)}>
                    {edit ? "Annuler" : "Modifier"}
                  </Button>
                  <Button onClick={basculerPublication}>
                    {cours.published ? "Dépublier" : "Publier"}
                  </Button>
                </div>
              ) : undefined
            }
          />

          {!cours.published && <Badge variant="outline">Brouillon</Badge>}

          {cours.cover_image_url && (
            <SignedImage
              path={cours.cover_image_url}
              alt={`Illustration du cours ${cours.titre}`}
              className="mt-4 max-h-80 w-full rounded-2xl object-cover"
            />
          )}

          {cours.resume && <p className="mt-6 text-lg text-muted-foreground">{cours.resume}</p>}

          <article className="mt-6 rounded-2xl border border-border bg-card p-6 lg:p-8">
            {edit ? (
              <div className="space-y-3">
                <Textarea
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  className="min-h-96 font-mono text-sm"
                />
                <Button onClick={enregistrer}>Enregistrer</Button>
              </div>
            ) : (
              <Markdown content={cours.contenu} />
            )}
          </article>
        </>
      )}
    </AppShell>
  );
}
