import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Code2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevShelf — Showcase your projects like a pro" },
      { name: "description", content: "DevShelf turns every project into an interactive browser window. Build a developer portfolio that actually feels alive." },
      { property: "og:title", content: "DevShelf — Showcase your projects like a pro" },
      { property: "og:description", content: "Interactive browser-card portfolios for developers. Sign up free, upload your projects, share your shelf." },
    ],
  }),
  component: Index,
});

type FeaturedProfile = Profile & { project_count: number };

function Index() {
  const [featured, setFeatured] = useState<FeaturedProfile[]>([]);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .limit(6);
      if (!profiles) return;
      const ids = profiles.map((p) => p.id);
      const { data: counts } = await supabase
        .from("projects")
        .select("user_id")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
        .eq("is_public", true);
      const countMap = new Map<string, number>();
      counts?.forEach((c) => countMap.set(c.user_id, (countMap.get(c.user_id) ?? 0) + 1));
      setFeatured(
        profiles.map((p) => ({ ...(p as Profile), project_count: countMap.get(p.id) ?? 0 })),
      );
    })();
  }, []);

  return (
    <div className="min-h-screen bg-ambient">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-border bg-surface/70 text-muted-foreground"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          Built for developers who ship
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
        >
          Showcase your projects{" "}
          <span className="text-gradient">like a pro</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground"
        >
          DevShelf turns every project into an interactive browser window. Build a
          living portfolio, share it with one link, and let your work do the talking.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/auth/register">
            <Button size="lg" className="gap-2 glow-ring">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/explore">
            <Button size="lg" variant="outline">
              Explore profiles
            </Button>
          </Link>
        </motion.div>

        {/* Mock browser card preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden border border-border bg-surface browser-shadow animate-float">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-2 border-b border-border">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[oklch(0.70_0.22_25)]" />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.80_0.18_85)]" />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.72_0.20_150)]" />
              </div>
              <div className="flex-1 mx-2 px-3 py-1 rounded-md bg-background/60 border border-border text-xs text-muted-foreground font-mono">
                devshelf.app/profile/you
              </div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-[oklch(0.20_0.06_285)] via-[oklch(0.18_0.04_270)] to-[oklch(0.22_0.08_320)] flex items-center justify-center">
              <div className="text-center px-6">
                <Code2 className="h-10 w-10 mx-auto text-primary mb-3" />
                <p className="text-sm text-muted-foreground font-mono">
                  // your shelf, your story
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured developers */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Featured developers
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Builders shipping on DevShelf right now.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm text-primary hover:underline hidden sm:inline-flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl bg-surface/40">
            <Code2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
            <p>Be the first to claim your shelf.</p>
            <Link to="/auth/register">
              <Button variant="link" className="text-primary">
                Create your profile →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <Link
                key={p.id}
                to="/profile/$username"
                params={{ username: p.username }}
                className="group p-5 rounded-xl border border-border bg-surface hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent overflow-hidden grid place-items-center text-accent-foreground font-semibold">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.name.charAt(0).toUpperCase() || p.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.name || p.username}</h3>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      @{p.username} · {p.project_count} project{p.project_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {p.tech_stack.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © DevShelf · Made for developers
      </footer>
    </div>
  );
}
