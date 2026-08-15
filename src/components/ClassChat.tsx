import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCheck, CornerUpLeft, Loader2, Mic, Paperclip, Send, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { signedUrl, uploadMedia } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMessage = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  kind: string;
  attachment_path: string | null;
  attachment_mime: string | null;
  attachment_name: string | null;
  reply_to: string | null;
};

const heure = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const jour = (iso: string) => {
  const d = new Date(iso);
  const auj = new Date();
  const hier = new Date(auj.getTime() - 86400000);
  if (d.toDateString() === auj.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === hier.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

function Attachment({ path, mime, name }: { path: string; mime: string | null; name: string | null }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    void signedUrl(path).then(setUrl);
  }, [path]);
  if (!url) return <span className="text-xs opacity-70">Chargement…</span>;
  if (mime?.startsWith("image/"))
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={name ?? "Pièce jointe"} className="max-h-56 rounded-lg object-cover" />
      </a>
    );
  if (mime?.startsWith("audio/"))
    return (
      <audio controls src={url} className="w-56">
        <track kind="captions" />
      </audio>
    );
  if (mime?.startsWith("video/")) return <video controls src={url} className="max-h-56 rounded-lg" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
      <Paperclip className="size-4" /> {name ?? "Document"}
    </a>
  );
}

/** Messagerie de classe façon WhatsApp : bulles, réponses, pièces jointes et notes vocales. */
export function ClassChat({ classId, names }: { classId: string; names: Record<string, string> }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("class_messages")
        .select(
          "id, content, sender_id, created_at, kind, attachment_path, attachment_mime, attachment_name, reply_to",
        )
        .eq("class_id", classId)
        .order("created_at", { ascending: true })
        .limit(300);
      setMessages((data ?? []) as ChatMessage[]);
    })();

    const channel = supabase
      .channel(`chat-${classId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "class_messages", filter: `class_id=eq.${classId}` },
        (payload) =>
          setMessages((m) =>
            m.some((x) => x.id === (payload.new as ChatMessage).id)
              ? m
              : [...m, payload.new as ChatMessage],
          ),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parId = useMemo(() => Object.fromEntries(messages.map((m) => [m.id, m])), [messages]);

  const envoyer = async (extra?: Partial<ChatMessage>) => {
    if (!user) return;
    const content = extra?.content ?? text.trim();
    if (!content && !extra?.attachment_path) return;
    setText("");
    const payload = {
      class_id: classId,
      sender_id: user.id,
      content: content || (extra?.kind === "vocal" ? "Note vocale" : "Pièce jointe"),
      kind: extra?.kind ?? "texte",
      attachment_path: extra?.attachment_path ?? null,
      attachment_mime: extra?.attachment_mime ?? null,
      attachment_name: extra?.attachment_name ?? null,
      reply_to: reply?.id ?? null,
    };
    setReply(null);
    const { error } = await supabase.from("class_messages").insert(payload);
    if (error) toast.error(error.message);
  };

  const joindre = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = await uploadMedia(file, "chat", ext);
      await envoyer({
        content: file.name,
        kind: "fichier",
        attachment_path: path,
        attachment_mime: file.type,
        attachment_name: file.name,
      });
    } catch {
      toast.error("Envoi du fichier impossible.");
    }
    setBusy(false);
  };

  const demarrerVocal = async () => {
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
          const path = await uploadMedia(blob, "chat-vocal", "webm");
          await envoyer({
            content: "Note vocale",
            kind: "vocal",
            attachment_path: path,
            attachment_mime: "audio/webm",
            attachment_name: "note-vocale.webm",
          });
        } catch {
          toast.error("Note vocale non envoyée.");
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-muted/40 p-3">
        {messages.map((m, i) => {
          const mine = m.sender_id === user?.id;
          const precedent = messages[i - 1];
          const nouveauJour = !precedent || jour(precedent.created_at) !== jour(m.created_at);
          const cite = m.reply_to ? parId[m.reply_to] : undefined;
          return (
            <div key={m.id}>
              {nouveauJour && (
                <p className="my-3 text-center text-xs text-muted-foreground">{jour(m.created_at)}</p>
              )}
              <div className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-card-foreground"
                  }`}
                >
                  {!mine && (
                    <p className="mb-1 text-xs font-semibold opacity-80">
                      {names[m.sender_id] ?? "Participant"}
                    </p>
                  )}
                  {cite && (
                    <p className="mb-1 truncate border-l-2 border-current/40 pl-2 text-xs opacity-75">
                      {names[cite.sender_id] ?? "Participant"} : {cite.content}
                    </p>
                  )}
                  {m.attachment_path && (
                    <div className="mb-1">
                      <Attachment
                        path={m.attachment_path}
                        mime={m.attachment_mime}
                        name={m.attachment_name}
                      />
                    </div>
                  )}
                  {m.kind !== "vocal" && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                  <p className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                    {heure(m.created_at)}
                    {mine ? <CheckCheck className="size-3" /> : <Check className="size-3" />}
                  </p>
                  <button
                    type="button"
                    aria-label="Répondre"
                    onClick={() => setReply(m)}
                    className="absolute -left-7 top-2 hidden rounded-full p-1 text-muted-foreground hover:bg-muted group-hover:block"
                  >
                    <CornerUpLeft className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun message pour le moment.
          </p>
        )}
        <div ref={bottom} />
      </div>

      {reply && (
        <div className="flex items-center justify-between gap-2 rounded-lg border-l-4 border-primary bg-muted px-3 py-2 text-xs">
          <span className="truncate">
            Réponse à {names[reply.sender_id] ?? "Participant"} : {reply.content}
          </span>
          <button type="button" aria-label="Annuler la réponse" onClick={() => setReply(null)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-full p-2 text-muted-foreground hover:bg-muted">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Paperclip className="size-5" />}
          <input
            type="file"
            className="hidden"
            accept="image/*,audio/*,video/*,application/pdf,.doc,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void joindre(f);
            }}
          />
        </label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void envoyer();
          }}
          placeholder="Écrire un message…"
          className="rounded-full"
        />
        {text.trim() ? (
          <Button size="icon" aria-label="Envoyer" className="rounded-full" onClick={() => void envoyer()}>
            <Send className="size-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            aria-label={recording ? "Arrêter" : "Note vocale"}
            variant={recording ? "destructive" : "default"}
            className="rounded-full"
            disabled={busy}
            onClick={() => {
              if (recording) {
                recorder.current?.stop();
                setRecording(false);
              } else void demarrerVocal();
            }}
          >
            {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
