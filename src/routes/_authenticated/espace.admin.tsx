import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { listAllUsers, reviewAccount } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/espace/admin")({
  component: AdminPage,
});

type Role = "super_admin" | "prof" | "eleve";

function AdminPage() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listAllUsers);
  const review = useServerFn(reviewAccount);
  const [roleChoice, setRoleChoice] = useState<Record<string, Role>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const mut = useMutation({
    mutationFn: (v: { userId: string; status: "approved" | "rejected"; role?: Role }) =>
      review({ data: v }),
    onSuccess: () => {
      toast.success("Compte mis à jour.");
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const claim = async () => {
    const { data: ok, error: e } = await supabase.rpc("claim_super_admin");
    if (e) return void toast.error(e.message);
    if (!ok) return void toast.error("Un super administrateur existe déjà.");
    toast.success("Vous êtes désormais super administrateur. Rechargez la page.");
  };

  const profiles = data?.profiles ?? [];
  const rolesByUser = new Map<string, Role[]>();
  for (const r of data?.roles ?? []) {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
  }

  return (
    <AppShell>
      <PageHeader
        title="Super administration"
        subtitle="Approuvez les comptes et attribuez les rôles."
        action={
          <Button variant="outline" onClick={claim}>
            Revendiquer le rôle super admin
          </Button>
        }
      />

      {isLoading && <p className="text-muted-foreground">Chargement…</p>}
      {error && <p className="text-destructive">{(error as Error).message}</p>}

      <div className="space-y-3">
        {profiles.map((p) => {
          const roles = rolesByUser.get(p.id) ?? [];
          return (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{p.full_name || p.email}</p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={p.status === "approved" ? "default" : "secondary"}>
                      {p.status === "approved"
                        ? "Approuvé"
                        : p.status === "rejected"
                          ? "Refusé"
                          : "En attente"}
                    </Badge>
                    <Badge variant="outline">Demande : {p.requested_role}</Badge>
                    {roles.map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={roleChoice[p.id] ?? (p.requested_role as Role)}
                    onValueChange={(v) => setRoleChoice((s) => ({ ...s, [p.id]: v as Role }))}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eleve">Élève</SelectItem>
                      <SelectItem value="prof">Professeur</SelectItem>
                      <SelectItem value="super_admin">Super admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={mut.isPending}
                    onClick={() =>
                      mut.mutate({
                        userId: p.id,
                        status: "approved",
                        role: roleChoice[p.id] ?? (p.requested_role as Role),
                      })
                    }
                  >
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mut.isPending}
                    onClick={() => mut.mutate({ userId: p.id, status: "rejected" })}
                  >
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && profiles.length === 0 && (
          <p className="text-muted-foreground">Aucun compte pour le moment.</p>
        )}
      </div>
    </AppShell>
  );
}
