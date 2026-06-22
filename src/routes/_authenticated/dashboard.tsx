import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus, LogOut, Settings, User as UserIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Navbar as _Navbar } from "@/components/navbar"; // unused intentionally
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrowserCard } from "@/components/browser-card";
import { BrowserModal } from "@/components/browser-modal";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Project } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DevShelf" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("projects").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p as Profile | null);
    setProjects((pr ?? []) as Project[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth/login", replace: true });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleToggleVisibility(p: Project) {
    const { error } = await supabase
      .from("projects")
      .update({ is_public: !p.is_public })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_public: !p.is_public } : x)));
    toast.success(p.is_public ? "Now private" : "Now public");
  }

  function copyLink(p: Project) {
    if (!profile) return;
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            DevShelf
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/projects/new">
              <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> Add project
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-surface transition">
                  <span className="h-7 w-7 rounded-full bg-accent overflow-hidden grid place-items-center text-xs font-semibold text-accent-foreground">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (profile?.name || profile?.username || "?").charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="text-sm font-medium hidden sm:inline">
                    @{profile?.username ?? "…"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profile && (
                  <DropdownMenuItem asChild>
                    <Link to="/profile/$username" params={{ username: profile.username }}>
                      <ExternalLink className="h-4 w-4" /> View public profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" /> Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 pb-32">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your shelf</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading…</div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <BrowserCard
                key={p.id}
                project={p}
                onOpen={() => setActive(p)}
                actions={{
                  onEdit: () => navigate({ to: "/projects/$id/edit", params: { id: p.id } }),
                  onDelete: () => handleDelete(p.id),
                  onCopyLink: () => copyLink(p),
                  onToggleVisibility: () => handleToggleVisibility(p),
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BrowserModal project={active} onClose={() => setActive(null)} />

      {/* FAB */}
      <Link to="/projects/new" className="fixed bottom-6 right-6 z-30">
        <Button size="lg" className="h-14 w-14 rounded-full p-0 glow-ring shadow-xl">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-2xl bg-surface/40 py-20 text-center">
      <div className="mx-auto h-20 w-32 rounded-lg bg-surface-2 border border-border mb-6 relative overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.22_25)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.80_0.18_85)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.20_150)]" />
        </div>
        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
          your first project
        </div>
      </div>
      <h3 className="font-semibold text-lg">Your shelf is empty</h3>
      <p className="text-muted-foreground text-sm mt-1">
        Add your first project to get started.
      </p>
      <Link to="/projects/new" className="inline-block mt-5">
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add your first project
        </Button>
      </Link>
    </div>
  );
}