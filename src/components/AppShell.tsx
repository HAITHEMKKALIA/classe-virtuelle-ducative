import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BookOpen,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NavItem = { to: string; label: string; icon: typeof Home };

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, isAdmin, isProf, roles } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items: NavItem[] = [{ to: "/espace", label: "Tableau de bord", icon: Home }];
  if (isAdmin) items.push({ to: "/espace/admin", label: "Super admin", icon: ShieldCheck });
  if (isProf) {
    items.push(
      { to: "/espace/classes", label: "Mes classes", icon: Users },
      { to: "/espace/cours", label: "Cours", icon: BookOpen },
      { to: "/espace/programme", label: "Programme manuel", icon: FolderOpen },
      { to: "/espace/evaluations", label: "Devoirs & examens", icon: ClipboardList },
    );
  } else {
    items.push(
      { to: "/espace/classes", label: "Ma classe", icon: Users },
      { to: "/espace/cours", label: "Mes cours", icon: BookOpen },
      { to: "/espace/programme", label: "Programme manuel", icon: FolderOpen },
      { to: "/espace/travail", label: "Devoirs & examens", icon: ClipboardList },
      { to: "/espace/resultats", label: "Mes résultats", icon: Trophy },
    );
  }

  const roleLabel = isAdmin
    ? "Super administrateur"
    : roles.includes("prof")
      ? "Professeur"
      : roles.includes("eleve")
        ? "Élève"
        : "Compte en attente";

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((it) => {
        const active = path === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <it.icon className="size-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar p-5 text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/espace" className="mb-8 flex items-center gap-3">
          <span className="bg-accent-gradient flex size-10 items-center justify-center rounded-xl text-accent-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">Classe Française</span>
        </Link>
        {nav}
        <div className="mt-6 rounded-xl bg-sidebar-accent p-4">
          <p className="truncate text-sm font-medium">{profile?.full_name || profile?.email}</p>
          <Badge variant="secondary" className="mt-2">
            {roleLabel}
          </Badge>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 size-4" /> Se déconnecter
          </Button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="font-display font-semibold">Classe Française</span>
        </header>
        <main className="mx-auto w-full max-w-6xl p-5 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
