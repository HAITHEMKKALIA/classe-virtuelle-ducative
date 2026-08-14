import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateAssessment, generateImage } from "@/lib/ai.functions";
import { dataUrlToBlob, uploadMedia } from "@/lib/media";
import { MATIERES, NIVEAUX, TRIMESTRES } from "@/lib/programme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignedImage } from "@/components/SignedImage";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/evaluations/nouveau")({
  component: NouvelleEvaluation,
});

type Q = {
  type: "qcm" | "court" | "texte";
  enonce: string;
  options: string[];
  reponse_correcte: string;
  points: number;
  image_url: string;
  image_prompt?: string;
};

const emptyQ = (): Q => ({
  type: "court",
  enonce: "",
  options: [],
  reponse_correcte: "",
  points: 1,
  image_url: "",
});

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function NouvelleEvaluation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const genAssessment = useServerFn(generateAssessment);
  const genImage = useServerFn(generateImage);

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("devoir");
  const [matiere, setMatiere] = useState("grammaire");
  const [niveau, setNiveau] = useState("5");
  const [trimestre, setTrimestre] = useState("1");
  const [consignes, setConsignes] = useState("");
  const [duree, setDuree] = useState("30");
  const [classId, setClassId] = useState<string>("");
  const [classes, setClasses] = useState<{ id: string; nom: string }[]>([]);
  const [questions, setQuestions] = useState<Q[]>([emptyQ()]);
  const [nombre, setNombre] = useState("6");
  const [withImages, setWithImages] = useState(true);
  const [source, setSource] = useState<File | null>(null);
  const [busy, setBusy] = useState<"" | "ia" | "save">("");

  // Anti-triche
  const [fullscreen, setFullscreen] = useState(true);
  const [blockCopy, setBlockCopy] = useState(true);
  const [maxTab, setMaxTab] = useState("3");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("classes").select("id, nom");
      setClasses((data ?? []) as { id: string; nom: string }[]);
    })();
  }, []);

  const genererIA = async () => {
    setBusy("ia");
    try {
      const src = source ? { filename: source.name, dataUrl: await fileToDataUrl(source) } : null;
      const res = await genAssessment({
        data: {
          niveau: Number(niveau),
          trimestre: Number(trimestre),
          matiere,
          type: type === "examen" ? "examen" : "devoir maison",
          nombre: Number(nombre),
          consigne: consignes,
          sourceFile: src,
          withImages,
        },
      });
      if (!titre) setTitre(res.titre);
      if (!consignes) setConsignes(res.consignes);
      const qs: Q[] = res.questions.map((q) => ({ ...q, image_url: "" }));
      if (withImages) {
        for (const q of qs) {
          if (!q.image_prompt) continue;
          try {
            const img = await genImage({ data: { prompt: q.image_prompt } });
            q.image_url = await uploadMedia(dataUrlToBlob(img.dataUrl), "exercices");
          } catch {
            /* image facultative */
          }
        }
      }
      setQuestions(qs.length ? qs : [emptyQ()]);
      toast.success("Questions générées.");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy("");
  };

  const patch = (i: number, v: Partial<Q>) =>
    setQuestions((qs) => qs.map((q, k) => (k === i ? { ...q, ...v } : q)));

  const uploadQuestionImage = async (i: number, f: File) => {
    try {
      const path = await uploadMedia(f, "exercices", f.name.split(".").pop() || "png");
      patch(i, { image_url: path });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const enregistrer = async (published: boolean) => {
    if (!user) return;
    setBusy("save");
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        prof_id: user.id,
        titre,
        type,
        matiere,
        niveau: Number(niveau),
        trimestre: Number(trimestre),
        consignes,
        duree_minutes: Number(duree),
        class_id: classId || null,
        published,
        anti_cheat: {
          fullscreen,
          block_copy: blockCopy,
          max_tab_switch: Number(maxTab),
          block_screenshot: true,
        },
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      setBusy("");
      toast.error(error?.message ?? "Enregistrement impossible.");
      return;
    }

    const rows = questions
      .filter((q) => q.enonce.trim())
      .map((q, i) => ({
        assessment_id: data.id,
        ordre: i + 1,
        type: q.type,
        enonce: q.enonce,
        options: q.options,
        reponse_correcte: q.reponse_correcte,
        points: q.points,
        image_url: q.image_url || null,
      }));
    if (rows.length) {
      const { error: e2 } = await supabase.from("questions").insert(rows);
      if (e2) toast.error(e2.message);
    }
    setBusy("");
    toast.success(published ? "Évaluation publiée." : "Brouillon enregistré.");
    void navigate({ to: "/espace/evaluations/$id", params: { id: data.id } });
  };

  return (
    <AppShell>
      <PageHeader
        title="Nouvelle évaluation"
        subtitle="Devoir maison ou examen : génération IA, import de document ou saisie manuelle."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="t">Titre</Label>
                <Input id="t" value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="devoir">Devoir maison</SelectItem>
                      <SelectItem value="examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes mes classes" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="d">Durée (minutes)</Label>
                  <Input
                    id="d"
                    type="number"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c">Consignes</Label>
                <Textarea
                  id="c"
                  value={consignes}
                  onChange={(e) => setConsignes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Sécurité & anti-triche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fs">Plein écran obligatoire</Label>
                <Switch id="fs" checked={fullscreen} onCheckedChange={setFullscreen} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bc">Bloquer copier / coller / clic droit</Label>
                <Switch id="bc" checked={blockCopy} onCheckedChange={setBlockCopy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mt">Changements d'onglet tolérés</Label>
                <Input
                  id="mt"
                  type="number"
                  value={maxTab}
                  onChange={(e) => setMaxTab(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Au-delà, la copie est rendue automatiquement. Les tentatives de capture d'écran
                  sont enregistrées et signalées au professeur.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Génération assistée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="n">Nombre de questions</Label>
                  <Input
                    id="n"
                    type="number"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <Label htmlFor="wi">Images générées</Label>
                  <Switch id="wi" checked={withImages} onCheckedChange={setWithImages} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="f">Document source (PDF, image)</Label>
                <Input
                  id="f"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setSource(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button onClick={genererIA} disabled={busy !== ""} className="w-full">
                {busy === "ia" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                Générer les questions
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-semibold">Question {i + 1}</p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={q.type}
                      onValueChange={(v) => patch(i, { type: v as Q["type"] })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qcm">QCM</SelectItem>
                        <SelectItem value="court">Réponse courte</SelectItem>
                        <SelectItem value="texte">Production écrite</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-20"
                      value={q.points}
                      onChange={(e) => patch(i, { points: Number(e.target.value) })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer"
                      onClick={() => setQuestions((qs) => qs.filter((_, k) => k !== i))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={q.enonce}
                  onChange={(e) => patch(i, { enonce: e.target.value })}
                  placeholder="Énoncé de la question"
                />
                {q.type === "qcm" && (
                  <div className="space-y-2">
                    <Label>Options (une par ligne)</Label>
                    <Textarea
                      value={q.options.join("\n")}
                      onChange={(e) => patch(i, { options: e.target.value.split("\n") })}
                    />
                  </div>
                )}
                {q.type !== "texte" && (
                  <div className="space-y-2">
                    <Label>Réponse correcte</Label>
                    <Input
                      value={q.reponse_correcte}
                      onChange={(e) => patch(i, { reponse_correcte: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
                    Téléverser une image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadQuestionImage(i, f);
                      }}
                    />
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const img = await genImage({
                          data: { prompt: q.image_prompt || q.enonce || matiere },
                        });
                        patch(i, {
                          image_url: await uploadMedia(dataUrlToBlob(img.dataUrl), "exercices"),
                        });
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    Générer une image
                  </Button>
                </div>
                {q.image_url && (
                  <SignedImage
                    path={q.image_url}
                    alt={`Illustration de la question ${i + 1}`}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setQuestions((qs) => [...qs, emptyQ()])}>
              <Plus className="mr-2 size-4" /> Ajouter une question
            </Button>
            <Button onClick={() => enregistrer(true)} disabled={busy !== "" || !titre}>
              Publier
            </Button>
            <Button
              variant="outline"
              onClick={() => enregistrer(false)}
              disabled={busy !== "" || !titre}
            >
              Brouillon
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
