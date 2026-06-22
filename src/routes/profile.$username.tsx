import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Github, Linkedin, Globe } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { BrowserCard } from "@/components/browser-card";
import { BrowserModal } from "@/components/browser-modal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Project } from "@/lib/types";

export const Route = createFileRoute("/profile/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — DevShelf` },
      { name: "description", content: `Projects by @${params.username} on DevShelf.` },
      { property: "og:title", content: `@${params.username} — DevShelf` },
      { property: "og:description", content: `Browser-card portfolio by @${params.username}.` },
    ],
  }),
  component: ProfilePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-ambient">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Profile not found</h1>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Go home
        </Link>
      </div>
    </div>
  ),
});

function ProfilePage() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (!p) {
        setLoading(false);
        return;
      }
      setProfile(p as Profile);
      const { data: pr } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", p.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      setProjects((pr ?? []) as Project[]);
      setLoading(false);
    })();
  }, [username]);

  const techs = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => p.tech_stack.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [projects]);

  const visible = filter
    ? projects.filter((p) => p.tech_stack.includes(filter))
    : projects;

  if (loading) {
    return (
      <div className="min-h-screen bg-ambient">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!profile) {
    throw notFound();
  }

  return (
    <div className="min-h-screen bg-ambient">
      <Navbar />

      {/* Cover */}
      <div className="h-40 sm:h-56 bg-gradient-to-br from-[oklch(0.30_0.10_285)] via-[oklch(0.22_0.06_270)] to-[oklch(0.28_0.10_320)] border-b border-border" />

      <div className="container mx-auto px-4 -mt-14 sm:-mt-16 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-background bg-accent overflow-hidden grid place-items-center text-3xl font-bold text-accent-foreground">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              (profile.name || profile.username).charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.name || profile.username}</h1>
            <p className="text-muted-foreground font-mono text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-sm text-foreground/90 max-w-2xl">{profile.bio}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.github_url && (
              <SocialLink href={profile.github_url} icon={<Github className="h-4 w-4" />} label="GitHub" />
            )}
            {profile.linkedin_url && (
              <SocialLink href={profile.linkedin_url} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            )}
            {profile.website_url && (
              <SocialLink href={profile.website_url} icon={<Globe className="h-4 w-4" />} label="Website" />
            )}
          </div>
        </div>

        {profile.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6">
            {profile.tech_stack.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Filter bar */}
        {techs.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={!filter ? "default" : "outline"}
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            {techs.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filter === t ? "default" : "outline"}
                onClick={() => setFilter(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        )}

        {/* Projects */}
        <div className="mt-8">
          {visible.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              No public projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((p) => (
                <BrowserCard key={p.id} project={p} onOpen={() => setActive(p)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BrowserModal project={active} onClose={() => setActive(null)} />
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-2 text-sm transition"
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}