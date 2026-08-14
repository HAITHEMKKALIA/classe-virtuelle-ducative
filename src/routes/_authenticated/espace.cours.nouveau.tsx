import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateCourse, generateImage } from "@/lib/ai.functions";
import { dataUrlToBlob, uploadMedia } from "@/lib/media";
import { MATIERES, NIVEAUX, TRIMESTRES } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "@/components/Markdown";
import { SignedImage } from "@/components/SignedImage";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/cours/nouveau")({
  component: NouveauCours,
});

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function NouveauCours() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const genCourse = useServerFn(generateCourse);
  const genImage = useServerFn(generateImage);

  const [titre, setTitre] = useState("");
  const [matiere, setMatiere] = useState("grammaire");
  const [niveau, setNiveau] = useState("5");
  const [trimestre, setTrimestre] = useState("1");
  const [resume, setResume] = useState("");
  const [contenu, setContenu] = useState("");
  const [notes, setNotes] = useState("");
  const [cover, setCover] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"" | "ia" | "img" | "save">("");

  const genererIA = async () => {
    if (!titre) {
      toast.error("Donnez d'abord un titre au cours.");
      return;
    }
    setBusy("ia");
    try {
      const source = file
        ? { filename: file.name, dataUrl: await fileToDataUrl(file) }
        : null;
      const res = await genCourse({
        data: {
          niveau: Number(niveau),
          trimestre: Number(trimestre),
          matiere,
          titre,
          notes,
          sourceFile: source,
        },
      });
      setResume(res.resume);
      setContenu(res.contenu);
      if (res.image_prompt) {
        const img = await genImage({ data: { prompt: res.image_prompt } });
        const path = await uploadMedia(dataUrlToBlob(img.dataUrl), "cours");
        setCover(path);
      }
      toast.success("Cours généré. Relisez et modifiez si besoin.");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy("");
  };

  const genererImage = async () => {
    setBusy("img");
    try {
      const img = await genImage({ data: { prompt: `${matiere} : ${titre}` } });
      const path = await uploadMedia(dataUrlToBlob(img.dataUrl), "cours");
      setCover(path);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy("");
  };

  const televerser = async (f: File) => {
    try {
      const path = await uploadMedia(f, "cours", f.name.split(".").pop() || "png");
      setCover(path);
      toast.success("Image ajoutée.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const enregistrer = async (published: boolean) => {
    if (!user) return;
    setBusy("save");
    const { data, error } = await supabase
      .from("courses")
      .insert({
        prof_id: user.id,
        titre,
        matiere,
        niveau: Number(niveau),
        trimestre: Number(trimestre),
        resume,
        contenu,
        cover_image_url: cover || null,
        published,
      })
      .select("id")
      .maybeSingle();
    setBusy("");
    if (error || !data) {
      toast.error(error?.message ?? "Enregistrement impossible.");
      return;
    }
    toast.success(published ? "Cours publié." : "Brouillon enregistré.");
    void navigate({ to: "/espace/cours/$courseId", params: { courseId: data.id } });
  };

  return (
    <AppShell>
      <PageHeader
        title="Nouveau cours"
        subtitle="Rédigez manuellement, importez un PDF ou laissez l'IA préparer la leçon."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de la leçon</Label>
              <Input
                id="titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Le passé composé avec avoir"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={niveau} onValueChange={setNiveau}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEAUX.map((n) => (
                      <SelectItem key={n.value} value={String(n.value)}>
                        {n.value}ème
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trimestre</Label>
                <Select value={trimestre} onValueChange={setTrimestre}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTRES.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>
                        T{t.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select value={matiere} onValueChange={setMatiere}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATIERES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Consignes pour l'IA (facultatif)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insister sur les verbes du 3ème groupe, exemples liés au marché…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="src">Document source (PDF, image)</Label>
              <Input
                id="src"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={genererIA} disabled={busy !== ""}>
                {busy === "ia" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                Générer le cours
              </Button>
              <Button variant="outline" onClick={genererImage} disabled={busy !== ""}>
                {busy === "img" && <Loader2 className="mr-2 size-4 animate-spin" />}
                Générer une image
              </Button>
              <label className="inline-flex cursor-pointer items-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
                Téléverser une image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void televerser(f);
                  }}
                />
              </label>
            </div>

            {cover && (
              <SignedImage
                path={cover}
                alt="Illustration du cours"
                className="h-44 w-full rounded-xl object-cover"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Contenu de la leçon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Résumé</Label>
              <Textarea id="resume" value={resume} onChange={(e) => setResume(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contenu">Contenu (markdown)</Label>
              <Textarea
                id="contenu"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                className="min-h-72 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => enregistrer(true)} disabled={busy !== "" || !titre}>
                Publier
              </Button>
              <Button
                variant="outline"
                onClick={() => enregistrer(false)}
                disabled={busy !== "" || !titre}
              >
                Enregistrer le brouillon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {contenu && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Aperçu élève</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown content={contenu} />
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
