import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { reviewStudent } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/classes/$classId")({
  component: ClassDetail,
});

type Member = {
  id: string;
  student_id: string;
  status: "pending" | "approved" | "rejected";
  profiles: { full_name: string; email: string } | null;
};
type Message = { id: string; content: string; sender_id: string; created_at: string };

function ClassDetail() {
  const { classId } = Route.useParams();
  const { user, isProf } = useAuth();
  const review = useServerFn(reviewStudent);
  const [classe, setClasse] = useState<{ nom: string; code_invitation: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const loadMembers = async () => {
    const { data } = await supabase
      .from("class_members")
      .select("id, student_id, status, profiles:student_id(full_name, email)")
      .eq("class_id", classId);
    const list = (data ?? []) as unknown as Member[];
    setMembers(list);
    setNames((n) => {
      const next = { ...n };
      for (const m of list) next[m.student_id] = m.profiles?.full_name ?? "Élève";
      return next;
    });
  };

  useEffect(() => {
    void (async () => {
      const { data: c } = await supabase
        .from("classes")
        .select("nom, code_invitation")
        .eq("id", classId)
        .maybeSingle();
      setClasse(c ?? null);
      await loadMembers();
      const { data: msgs } = await supabase
        .from("class_messages")
        .select("id, content, sender_id, created_at")
        .eq("class_id", classId)
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((msgs ?? []) as Message[]);
    })();

    const channel = supabase
      .channel(`class-${classId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "class_messages",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => setMessages((m) => [...m, payload.new as Message]),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const envoyer = async () => {
    if (!user || !text.trim()) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase
      .from("class_messages")
      .insert({ class_id: classId, sender_id: user.id, content });
    if (error) toast.error(error.message);
  };

  const decider = async (memberId: string, status: "approved" | "rejected") => {
    try {
      await review({ data: { memberId, status } });
      toast.success(status === "approved" ? "Élève approuvé." : "Demande refusée.");
      await loadMembers();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const pending = members.filter((m) => m.status === "pending");
  const approved = members.filter((m) => m.status === "approved");

  return (
    <AppShell>
      <PageHeader
        title={classe?.nom ?? "Classe"}
        subtitle={classe ? `Code d'invitation : ${classe.code_invitation}` : ""}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {isProf && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Demandes en attente ({pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{m.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decider(m.id, "approved")}>
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decider(m.id, "rejected")}
                      >
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune demande.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Élèves de la classe ({approved.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {approved.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-sm">{m.profiles?.full_name}</span>
                  <Badge variant="secondary">Actif</Badge>
                </div>
              ))}
              {approved.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun élève inscrit.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="flex h-[32rem] flex-col">
          <CardHeader>
            <CardTitle className="font-display text-lg">Messagerie de la classe</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={mine ? "text-right" : ""}>
                    <span
                      className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        mine ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {!mine && (
                        <span className="mb-1 block text-xs opacity-70">
                          {names[m.sender_id] ?? "Professeur"}
                        </span>
                      )}
                      {m.content}
                    </span>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void envoyer()}
                placeholder="Écrire un message…"
              />
              <Button onClick={envoyer} size="icon" aria-label="Envoyer">
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
