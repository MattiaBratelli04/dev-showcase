import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { uploadAndSign } from "@/lib/storage";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile settings — DevShelf" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(data as Profile | null);
    })();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        username: profile.username.toLowerCase(),
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        github_url: profile.github_url || null,
        linkedin_url: profile.linkedin_url || null,
        website_url: profile.website_url || null,
        tech_stack: profile.tech_stack,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  }

  async function handleAvatar(file: File) {
    if (!profile) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    setUploading(true);
    try {
      const url = await uploadAndSign("avatars", profile.id, file);
      setProfile({ ...profile, avatar_url: url });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addTech() {
    if (!profile) return;
    const v = techInput.trim();
    if (!v || profile.tech_stack.includes(v)) return setTechInput("");
    setProfile({ ...profile, tech_stack: [...profile.tech_stack, v] });
    setTechInput("");
  }

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Profile settings</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Profile settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Public on devshelf.app/profile/@{profile.username}
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-accent overflow-hidden grid place-items-center text-2xl font-bold text-accent-foreground">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (profile.name || profile.username).charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <input
                type="file"
                ref={fileRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatar(f);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Change photo
              </Button>
              <p className="text-[11px] text-muted-foreground mt-1.5">JPG / PNG · max 2MB</p>
            </div>
          </div>

          <Row label="Name">
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Row>
          <Row label="Username" hint="Used in your public URL">
            <Input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase() })}
              pattern="[a-z0-9_]+"
            />
          </Row>
          <Row label="Bio" hint={`${(profile.bio ?? "").length}/300`}>
            <Textarea
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 300) })}
              maxLength={300}
              className="min-h-[100px]"
            />
          </Row>
          <Row label="GitHub">
            <Input
              type="url"
              value={profile.github_url ?? ""}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              placeholder="https://github.com/you"
            />
          </Row>
          <Row label="LinkedIn">
            <Input
              type="url"
              value={profile.linkedin_url ?? ""}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/you"
            />
          </Row>
          <Row label="Website">
            <Input
              type="url"
              value={profile.website_url ?? ""}
              onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
              placeholder="https://you.dev"
            />
          </Row>
          <Row label="Tech stack">
            <div className="space-y-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="React, then press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {profile.tech_stack.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-mono"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({ ...profile, tech_stack: profile.tech_stack.filter((x) => x !== t) })
                      }
                      aria-label={`Remove ${t}`}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Row>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="glow-ring">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}