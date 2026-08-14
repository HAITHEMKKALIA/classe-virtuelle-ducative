import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  ImageIcon,
  ShieldCheck,
  Users,
  GraduationCap,
} from "lucide-react";
import hero from "@/assets/hero-classe.jpg";
import { Button } from "@/components/ui/button";
import { PROGRAMME, MATIERES } from "@/lib/programme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Classe Française — cours de français à distance 5ème & 6ème" },
      {
        name: "description",
        content:
          "Plateforme tunisienne de cours de français à distance : programme complet 5ème et 6ème année, devoirs, examens surveillés et correction en ligne.",
      },
      { property: "og:title", content: "Classe Française — cours à distance" },
      {
        property: "og:description",
        content:
          "Programme officiel tunisien de français, classe virtuelle, devoirs maison et examens anti-triche.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    titre: "Classe virtuelle",
    texte: "Le professeur crée sa classe, approuve ses élèves et échange avec eux en direct.",
  },
  {
    icon: BookOpen,
    titre: "Programme complet",
    texte: "Grammaire, conjugaison, orthographe, lecture, expression écrite — les 3 trimestres.",
  },
  {
    icon: Bot,
    titre: "Génération par IA",
    texte: "Créez un cours ou un exercice à partir d'un PDF, d'un fichier ou d'une simple consigne.",
  },
  {
    icon: ImageIcon,
    titre: "Cours illustrés",
    texte: "Images générées automatiquement ou téléversées par le professeur, cours et exercices.",
  },
  {
    icon: ShieldCheck,
    titre: "Examens sécurisés",
    texte: "Plein écran obligatoire, copie bloquée, détection de changement d'onglet, minuteur.",
  },
  {
    icon: ClipboardCheck,
    titre: "Correction en ligne",
    texte: "Correction automatique des QCM, aide IA pour les réponses libres, notes et remarques.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-3">
          <span className="bg-accent-gradient flex size-10 items-center justify-center rounded-xl text-accent-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">Classe Française</span>
        </span>
        <Button asChild size="sm">
          <Link to="/auth">Se connecter</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Programme officiel tunisien · 5ème & 6ème année
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight font-semibold lg:text-5xl">
            Toute la classe de français, à distance et bien organisée.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Cours illustrés, devoirs maison, examens surveillés et corrections : un seul espace
            pour le professeur, ses élèves et l'administration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Créer mon espace professeur</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Rejoindre ma classe</Link>
            </Button>
          </div>
        </div>
        <img
          src={hero}
          alt="Élève tunisienne suivant un cours de français en ligne avec sa maîtresse"
          width={1600}
          height={1104}
          className="rounded-3xl shadow-soft"
        />
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.titre} className="rounded-2xl border border-border bg-background p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{f.titre}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold">Le programme couvert</h2>
        <p className="mt-2 text-muted-foreground">
          Les modules officiels des trois trimestres, pour les deux niveaux.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {MATIERES.map((m) => (
            <span
              key={m.value}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[5, 6].map((niveau) => (
            <div key={niveau} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">{niveau}ème année primaire</h3>
              <ul className="mt-4 space-y-3">
                {[1, 2, 3].map((t) => (
                  <li key={t}>
                    <p className="text-sm font-semibold">Trimestre {t}</p>
                    <p className="text-sm text-muted-foreground">
                      {(PROGRAMME[niveau]?.[t] ?? []).map((m) => m.module).join(" · ") ||
                        "Modules à venir"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Classe Française — cours à distance de français, Tunisie.
      </footer>
    </div>
  );
}
