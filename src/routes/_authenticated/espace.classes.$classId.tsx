import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { reviewStudent } from "@/lib/admin.functions";
import { ClassChat } from "@/components/ClassChat";
import { VirtualClassroom } from "@/components/VirtualClassroom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/espace/classes/$classId")({
  component: ClassDetail,
});

type Member = {
  id: string;
  student_id: string;
  status: "pending" | "approved" | "rejected";
  profiles: { full_name: string; email: string } | null;
};

function ClassDetail() {
  const { classId } = Route.useParams();
  const { isProf } = useAuth();
  const review = useServerFn(reviewStudent);
  const [classe, setClasse] = useState<{ nom: string; code_invitation: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});


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
    })();
  }, [classId]);



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

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Classe virtuelle</TabsTrigger>
          <TabsTrigger value="gestion">Gestion des élèves</TabsTrigger>
          <TabsTrigger value="chat">Messagerie</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <VirtualClassroom
            classId={classId}
            members={approved.map((m) => ({
              student_id: m.student_id,
              nom: m.profiles?.full_name ?? "Élève",
            }))}
          />
        </TabsContent>

        <TabsContent value="gestion" className="mt-6 space-y-6">
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
                      <Button size="sm" variant="outline" onClick={() => decider(m.id, "rejected")}>
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
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className="flex h-[36rem] flex-col">
            <CardHeader>
              <CardTitle className="font-display text-lg">Messagerie de la classe</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ClassChat classId={classId} names={names} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </AppShell>
  );
}
