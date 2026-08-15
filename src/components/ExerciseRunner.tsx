import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Mic, Paperclip, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignedImage } from "@/components/SignedImage";
import { melanger, type ExerciseQuestion } from "@/lib/exercices";
import { signedUrl, uploadMedia } from "@/lib/media";

type Props = {
  question: ExerciseQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean | undefined;
};

function parseListe(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Rend une question de n'importe quel type et renvoie la réponse sous forme de chaîne. */
export function ExerciseRunner({ question, value, onChange, disabled }: Props) {
  const q = question;

  if (q.type === "qcm") {
    return (
      <div className="space-y-2">
        {q.options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-muted"
          >
            <input
              type="radio"
              name={q.id}
              disabled={disabled}
              checked={value === o}
              onChange={() => onChange(o)}
            />
            {o}
          </label>
        ))}
      </div>
    );
  }

  if (q.type === "vrai_faux") {
    return (
      <div className="flex gap-3">
        {["Vrai", "Faux"].map((o) => (
          <Button
            key={o}
            type="button"
            disabled={disabled}
            variant={value === o ? "default" : "outline"}
            onClick={() => onChange(o)}
          >
            {o}
          </Button>
        ))}
      </div>
    );
  }

  if (q.type === "texte_trous") {
    const segments = q.payload?.segments ?? q.enonce.split("___");
    const reponses = parseListe(value);
    return (
      <p className="flex flex-wrap items-center gap-2 text-sm leading-8">
        {segments.map((seg, i) => (
          <span key={`${seg}-${i}`} className="flex flex-wrap items-center gap-2">
            <span>{seg}</span>
            {i < segments.length - 1 && (
              <Input
                aria-label={`Trou ${i + 1}`}
                disabled={disabled}
                className="inline-block w-32"
                value={reponses[i] ?? ""}
                onChange={(e) => {
                  const next = [...reponses];
                  next[i] = e.target.value;
                  onChange(JSON.stringify(next));
                }}
              />
            )}
          </span>
        ))}
      </p>
    );
  }

  if (q.type === "conjugaison") {
    const personnes = q.payload?.personnes ?? ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];
    const reponses = parseListe(value);
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {personnes.map((p, i) => (
          <label key={p} className="flex items-center gap-2 text-sm">
            <span className="w-20 shrink-0 text-muted-foreground">{p}</span>
            <Input
              disabled={disabled}
              value={reponses[i] ?? ""}
              onChange={(e) => {
                const next = [...reponses];
                next[i] = e.target.value;
                onChange(JSON.stringify(next));
              }}
            />
          </label>
        ))}
      </div>
    );
  }

  if (q.type === "ordre") {
    return <OrdreQuestion question={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "association") {
    return <AssociationQuestion question={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "dictee") {
    return <DicteeQuestion question={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "oral") {
    return <OralQuestion value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "depot") {
    return <DepotQuestion value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "texte" || q.type === "correction_phrase") {
    return (
      <Textarea
        disabled={disabled}
        className={q.type === "texte" ? "min-h-40" : "min-h-20"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.type === "correction_phrase" ? "Réécris la phrase correctement…" : "Ta réponse…"}
      />
    );
  }

  return (
    <Input
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ta réponse…"
    />
  );
}

function OrdreQuestion({ question, value, onChange, disabled }: Props) {
  const base = question.payload?.elements ?? question.options;
  const initial = useMemo(() => melanger(base), [base]);
  const liste = parseListe(value).length ? parseListe(value) : initial;

  const bouger = (index: number, delta: number) => {
    const next = [...liste];
    const cible = index + delta;
    if (cible < 0 || cible >= next.length) return;
    [next[index], next[cible]] = [next[cible]!, next[index]!];
    onChange(JSON.stringify(next));
  };

  return (
    <ol className="space-y-2">
      {liste.map((item, i) => (
        <li
          key={item}
          className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
        >
          <span>{item}</span>
          <span className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Monter"
              disabled={disabled || i === 0}
              onClick={() => bouger(i, -1)}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Descendre"
              disabled={disabled || i === liste.length - 1}
              onClick={() => bouger(i, 1)}
            >
              <ArrowDown className="size-4" />
            </Button>
          </span>
        </li>
      ))}
    </ol>
  );
}

function AssociationQuestion({ question, value, onChange, disabled }: Props) {
  const paires = question.payload?.paires ?? [];
  const choix = useMemo(() => melanger(paires.map((p) => p.droite)), [paires]);
  const reponses = parseListe(value);

  return (
    <div className="space-y-2">
      {paires.map((p, i) => (
        <div key={p.gauche} className="flex flex-wrap items-center gap-3 text-sm">
          <span className="min-w-32 font-medium">{p.gauche}</span>
          <select
            aria-label={`Réponse pour ${p.gauche}`}
            disabled={disabled}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={reponses[i] ?? ""}
            onChange={(e) => {
              const next = [...reponses];
              next[i] = e.target.value;
              onChange(JSON.stringify(next));
            }}
          >
            <option value="">— choisir —</option>
            {choix.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function DicteeQuestion({ question, value, onChange, disabled }: Props) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (question.audio_url) void signedUrl(question.audio_url).then(setUrl);
  }, [question.audio_url]);

  const lire = () => {
    const texte = question.payload?.audio_texte ?? question.reponse_correcte ?? "";
    if (!texte) return;
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = "fr-FR";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-3">
      {url ? (
        <audio controls src={url} className="w-full">
          <track kind="captions" />
        </audio>
      ) : (
        <Button type="button" variant="outline" onClick={lire} disabled={disabled}>
          <Volume2 className="mr-2 size-4" /> Écouter la dictée
        </Button>
      )}
      <Textarea
        disabled={disabled}
        className="min-h-32"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Écris la dictée…"
      />
    </div>
  );
}

function OralQuestion({ value, onChange, disabled }: Omit<Props, "question">) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (value) void signedUrl(value).then(setUrl);
  }, [value]);

  const demarrer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
          const path = await uploadMedia(blob, "oral", "webm");
          onChange(path);
          toast.success("Enregistrement envoyé.");
        } catch {
          toast.error("Impossible d'envoyer l'enregistrement.");
        }
        setBusy(false);
      };
      mr.start();
      recorder.current = mr;
      setRecording(true);
    } catch {
      toast.error("Micro indisponible ou refusé.");
    }
  };

  const arreter = () => {
    recorder.current?.stop();
    setRecording(false);
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={recording ? "destructive" : "outline"}
        disabled={disabled || busy}
        onClick={() => (recording ? arreter() : void demarrer())}
      >
        {busy ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : recording ? (
          <Square className="mr-2 size-4" />
        ) : (
          <Mic className="mr-2 size-4" />
        )}
        {recording ? "Arrêter l'enregistrement" : "Enregistrer ma réponse"}
      </Button>
      {url && (
        <audio controls src={url} className="w-full">
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
}

function DepotQuestion({ value, onChange, disabled }: Omit<Props, "question">) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
        Choisir une photo ou un PDF
        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          disabled={disabled || busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              const ext = file.name.split(".").pop() ?? "pdf";
              const path = await uploadMedia(file, "depots", ext);
              onChange(path);
              toast.success("Fichier déposé.");
            } catch {
              toast.error("Dépôt impossible.");
            }
            setBusy(false);
          }}
        />
      </label>
      {value && !value.endsWith(".pdf") && (
        <SignedImage path={value} alt="Travail déposé" className="max-h-56 rounded-lg" />
      )}
      {value?.endsWith(".pdf") && <p className="text-sm text-muted-foreground">PDF déposé ✔</p>}
    </div>
  );
}
