import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Classe Française" },
      {
        name: "description",
        content:
          "Connectez-vous à votre espace professeur ou élève pour suivre les cours de français.",
      },
      { property: "og:title", content: "Connexion — Classe Française" },
      {
        property: "og:description",
        content: "Espace de connexion des professeurs et des élèves.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"prof" | "eleve">("eleve");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/espace" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void navigate({ to: "/espace" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/espace`,
        data: { full_name: fullName, requested_role: role },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compte créé. Il doit être approuvé avant l'accès complet.");
    void navigate({ to: "/espace" });
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Connexion Google impossible.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/espace" });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="bg-hero relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <Link to="/" className="font-display text-2xl font-semibold">
          Classe Française
        </Link>
        <div>
          <h1 className="font-display text-4xl leading-tight">
            Le programme tunisien de français, entièrement en ligne.
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            5ème et 6ème année primaire · trois trimestres · cours illustrés, devoirs maison et
            examens surveillés.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Espaces séparés : super administrateur, professeur, élève.
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <span className="bg-accent-gradient flex size-11 items-center justify-center rounded-xl text-accent-foreground">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold">Bienvenue</p>
              <p className="text-sm text-muted-foreground">Accédez à votre espace</p>
            </div>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={signIn} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Adresse e-mail</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Mot de passe</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Je suis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["eleve", "prof"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                          role === r
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        {r === "eleve" ? "Élève" : "Professeur"}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            OU
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google} disabled={loading}>
            Continuer avec Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Les comptes sont validés par le super administrateur (professeurs) ou par le
            professeur (élèves).
          </p>
        </div>
      </section>
    </main>
  );
}
