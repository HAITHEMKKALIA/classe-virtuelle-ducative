import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { NIVEAUX } from "@/lib/programme";

export const Route = createFileRoute("/_authenticated/espace/classes/")({
  component: ClassesPage,
});

type Classe = {
  id: string;
  nom: string;
  description: string | null;
  niveau: number;
  code_invitation: string;
  annee_scolaire: string;
};

function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [niveau, setNiveau] = useState("5");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, nom, description, niveau, code_invitation, annee_scolaire")
      .order("created_at", { ascending: false });
    setClasses((data ?? []) as Classe[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const creer = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("classes")
      .insert({ nom, description, niveau: Number(niveau), prof_id: user.id });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Classe créée.");
    setOpen(false);
    setNom("");
    setDescription("");
    void load();
  };

  return (
    <AppShell>
      <PageHeader
        title="Mes classes"
        subtitle="Créez une classe virtuelle et partagez son code avec vos élèves."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Nouvelle classe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Créer une classe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la classe</Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="5ème A — Français"
                  />
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
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={creer} disabled={busy || !nom}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{c.nom}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.niveau}ème année · {c.annee_scolaire}
                  </p>
                </div>
                <Badge variant="secondary">Code {c.code_invitation}</Badge>
              </div>
              {c.description && <p className="mt-3 text-sm">{c.description}</p>}
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link to="/espace/classes/$classId" params={{ classId: c.id }}>
                  Ouvrir la classe
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && (
          <p className="text-muted-foreground">Aucune classe pour le moment.</p>
        )}
      </div>
    </AppShell>
  );
}
