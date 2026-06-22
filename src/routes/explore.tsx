import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore developers — DevShelf" },
      { name: "description", content: "Discover developers and their projects on DevShelf." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const [profiles, setProfiles] = useState<(Profile & { project_count: number })[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").limit(60);
      if (!data) return;
      const ids = data.map((p) => p.id);
      const { data: counts } = await supabase
        .from("projects")
        .select("user_id")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
        .eq("is_public", true);
      const map = new Map<string, number>();
      counts?.forEach((c) => map.set(c.user_id, (map.get(c.user_id) ?? 0) + 1));
      setProfiles(data.map((p) => ({ ...(p as Profile), project_count: map.get(p.id) ?? 0 })));
    })();
  }, []);

  return (
    <div className="min-h-screen bg-ambient">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Explore developers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse profiles and discover projects.
        </p>

        {profiles.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-2xl mt-10">
            No profiles yet. Be the first!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {profiles.map((p) => (
              <Link
                key={p.id}
                to="/profile/$username"
                params={{ username: p.username }}
                className="p-5 rounded-xl border border-border bg-surface hover:bg-surface-2 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent overflow-hidden grid place-items-center text-accent-foreground font-semibold">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (p.name || p.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.name || p.username}</h3>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      @{p.username} · {p.project_count} project{p.project_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {p.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{p.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}