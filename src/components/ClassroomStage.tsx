import { GraduationCap } from "lucide-react";

export type Participant = { user_id: string; nom: string; role: string };

const PALETTE = [
  "bg-primary/15 text-primary ring-primary/30",
  "bg-accent/20 text-accent-foreground ring-accent/40",
  "bg-secondary text-secondary-foreground ring-border",
  "bg-muted text-foreground ring-border",
];

function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

function couleur(id: string) {
  let somme = 0;
  for (const c of id) somme += c.charCodeAt(0);
  return PALETTE[somme % PALETTE.length]!;
}

function Avatar({ p, taille = "sm" }: { p: Participant; taille?: "sm" | "lg" }) {
  const grand = taille === "lg";
  return (
    <div className="flex w-20 flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className={`flex items-center justify-center rounded-full font-display font-semibold ring-2 ${couleur(
            p.user_id,
          )} ${grand ? "size-16 text-xl" : "size-12 text-sm"}`}
        >
          {initiales(p.nom) || "?"}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-emerald-500" />
      </div>
      <p className="w-full truncate text-center text-[11px] font-medium leading-tight" title={p.nom}>
        {p.nom}
      </p>
    </div>
  );
}

function Stage2D({
  prof,
  eleves,
  titreTableau,
}: {
  prof?: Participant | undefined;
  eleves: Participant[];
  titreTableau?: string | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/60 to-background p-5">

      {/* Tableau et bureau du professeur */}
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border-4 border-foreground/15 bg-foreground/85 p-4 text-center shadow-inner">
          <p className="font-display text-sm text-background/90">
            {titreTableau ?? "Tableau de la classe"}
          </p>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          {prof ? (
            <>
              <Avatar p={prof} taille="lg" />
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">
                <GraduationCap className="size-3" /> Professeur
              </span>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Le professeur n'est pas encore entré.</p>
          )}
        </div>
      </div>

      <div className="my-5 h-px bg-border" />

      {/* Rangées d'élèves */}
      {eleves.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
          {eleves.map((e) => (
            <div key={e.user_id} className="flex flex-col items-center">
              <Avatar p={e} />
              <div className="mt-1 h-2 w-16 rounded-b-md bg-foreground/10" />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          La salle est vide : aucun élève connecté pour le moment.
        </p>
      )}
    </div>
  );
}
