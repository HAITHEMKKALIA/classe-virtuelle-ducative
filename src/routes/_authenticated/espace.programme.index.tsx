import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Paperclip } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProgrammeManuel } from "@/lib/programme-manuel";

export const Route = createFileRoute("/_authenticated/espace/programme/")({
  component: ProgrammePage,
  head: () => ({
    meta: [
      { title: "Programme manuel — Classe Française TN" },
      {
        name: "description",
        content:
          "Programmes manuels et documents de cours (PDF, Word, images) partagés par le professeur avec ses élèves.",
      },
      { property: "og:title", content: "Programme manuel — Classe Française TN" },
      {
        property: "og:description",
        content: "Créez, publiez et consultez les programmes manuels et leurs documents joints.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Classe = { id: string; nom: string };

function ProgrammePage() {
  const { user, isProf } = useAuth();
  const [programmes, setProgrammes] = useState<ProgrammeManuel[]>([]);
  const [compteurs, setCompteurs] = useState<Record<string, number>>({});
  const [classes, setClasses] = useState<Classe[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [niveau, setNiveau] = useState("5");
  const [trimestre, setTrimestre] = useState("1");
  const [classId, setClassId] = useState("all");
  const [contenu, setContenu] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("manual_programs")
      .select("*")
      .order("created_at", { ascending: false });
    const liste = (data ?? []) as ProgrammeManuel[];
    setProgrammes(liste);
    if (liste.length) {
      const { data: files } = await supabase
        .from("program_files")
        .select("program_id")
        .in(
          "program_id",
          liste.map((p) => p.id),
        );
      const map: Record<string, number> = {};
      for (const f of (files ?? []) as { program_id: string }[]) {
        map[f.program_id] = (map[f.program_id] ?? 0) + 1;
      }
      setCompteurs(map);
    }
  };

  useEffect(() => {
    void load();
    if (isProf) {
      void supabase
        .from("classes")
        .select("id, nom")
        .then(({ data }) => setClasses((data ?? []) as Classe[]));
    }
  }, [isProf]);

  const creer = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("manual_programs").insert({
      prof_id: user.id,
      titre,
      description,
      contenu,
      niveau: Number(niveau),
      trimestre: Number(trimestre),
      class_id: classId === "all" ? null : classId,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Programme créé. Ajoutez vos fichiers puis publiez-le.");
    setOpen(false);
    setTitre("");
    setDescription("");
    setContenu("");
    void load();
  };

  return (
    <AppShell>
      <PageHeader
        title="Programme manuel"
        subtitle={
          isProf
            ? "Rédigez vos programmes et déposez vos documents (PDF, Word, images) pour vos élèves."
            : "Consultez les programmes et documents partagés par votre professeur."
        }
        action={
          isProf ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Nouveau programme</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">Créer un programme manuel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder="Programme du 1er trimestre — 5ème année"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Niveau</Label>
                      <Select value={niveau} onValueChange={setNiveau}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5ème année</SelectItem>
                          <SelectItem value="6">6ème année</SelectItem>
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
                          <SelectItem value="1">Trimestre 1</SelectItem>
                          <SelectItem value="2">Trimestre 2</SelectItem>
                          <SelectItem value="3">Trimestre 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Classe destinataire</Label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes mes classes</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description courte</Label>
                    <Input
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contenu">Contenu du programme (markdown)</Label>
                    <Textarea
                      id="contenu"
                      rows={8}
                      value={contenu}
                      onChange={(e) => setContenu(e.target.value)}
                      placeholder={"## Semaine 1\n- Lecture : ...\n- Grammaire : ..."}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={creer} disabled={busy || !titre}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {programmes.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{p.titre}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.niveau ? `${p.niveau}ème année · ` : ""}
                    {p.trimestre ? `Trimestre ${p.trimestre}` : "Programme"}
                  </p>
                </div>
                <Badge variant={p.published ? "default" : "secondary"}>
                  {p.published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              {p.description && <p className="mt-3 text-sm">{p.description}</p>}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Paperclip className="size-4" /> {compteurs[p.id] ?? 0} fichier(s)
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="size-4" /> {p.contenu ? "Contenu rédigé" : "Sans contenu"}
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link to="/espace/programme/$programId" params={{ programId: p.id }}>
                  Ouvrir
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {programmes.length === 0 && (
          <p className="text-muted-foreground">
            {isProf
              ? "Aucun programme manuel pour le moment."
              : "Votre professeur n'a pas encore publié de programme."}
          </p>
        )}
      </div>
    </AppShell>
  );
}
