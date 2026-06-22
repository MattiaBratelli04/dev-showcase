import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ArrowLeft, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { uploadAndSign } from "@/lib/storage";

type Draft = {
  title: string;
  description: string;
  category: ProjectCategory;
  screenshot_url: string | null;
  tech_stack: string[];
  project_url: string;
  is_public: boolean;
  fake_data: boolean;
};

const STEPS = ["Basics", "Screenshot", "Tech stack", "Publish"] as const;

export function ProjectWizard({
  initial,
  onSubmit,
  submitLabel = "Publish project",
}: {
  initial?: Project;
  onSubmit: (draft: Draft) => Promise<void>;
  submitLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [techInput, setTechInput] = useState("");

  const [draft, setDraft] = useState<Draft>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: (initial?.category as ProjectCategory) ?? "Web App",
    screenshot_url: initial?.screenshot_url ?? null,
    tech_stack: initial?.tech_stack ?? [],
    project_url: initial?.project_url ?? "",
    is_public: initial?.is_public ?? true,
    fake_data: initial?.fake_data ?? false,
  });

  const valid = [
    draft.title.trim().length > 0 && draft.description.length <= 500,
    !!draft.screenshot_url,
    true,
    true,
  ];

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setUploading(true);
    try {
      const url = await uploadAndSign("screenshots", u.user.id, file);
      setDraft((d) => ({ ...d, screenshot_url: url }));
    } catch (e) {
      toast.error("Upload failed: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addTech() {
    const v = techInput.trim();
    if (!v) return;
    if (draft.tech_stack.includes(v)) return setTechInput("");
    setDraft((d) => ({ ...d, tech_stack: [...d.tech_stack, v] }));
    setTechInput("");
  }

  async function handlePublish() {
    setSubmitting(true);
    try {
      await onSubmit(draft);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 browser-shadow min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tell us about your project</h2>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="E-commerce Dashboard"
                    className="mt-1.5"
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="What does it do? Who is it for?"
                    className="mt-1.5 min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {draft.description.length}/500
                  </p>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(v) => setDraft({ ...draft, category: v as ProjectCategory })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Add a screenshot</h2>
                <p className="text-sm text-muted-foreground">
                  This image is shown inside the browser card. Aim for 16:9.
                </p>
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-background/40 hover:bg-background/70 transition aspect-[16/9] grid place-items-center overflow-hidden relative"
                >
                  {draft.screenshot_url ? (
                    <>
                      <img src={draft.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition grid place-items-center text-sm">
                        Click to replace
                      </div>
                    </>
                  ) : uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Drag & drop or click to upload</p>
                      <p className="text-[11px] mt-1">PNG / JPG · max 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tech stack</h2>
                <p className="text-sm text-muted-foreground">
                  Add the technologies used. Press Enter to add each one.
                </p>
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
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {draft.tech_stack.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-mono"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, tech_stack: d.tech_stack.filter((x) => x !== t) }))
                        }
                        className="hover:text-destructive"
                        aria-label={`Remove ${t}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {draft.tech_stack.length === 0 && (
                    <p className="text-xs text-muted-foreground self-center">No tech added yet.</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold">Almost there</h2>
                <div>
                  <Label htmlFor="url">Project URL (optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={draft.project_url}
                    onChange={(e) => setDraft({ ...draft, project_url: e.target.value })}
                    placeholder="https://your-project.com"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-background/40">
                  <div>
                    <Label htmlFor="public" className="text-sm font-medium">Public</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show on your profile and Explore.
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={draft.is_public}
                    onCheckedChange={(v) => setDraft({ ...draft, is_public: v })}
                  />
                </div>
                <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-background/40">
                  <div className="pr-4">
                    <Label htmlFor="fake" className="text-sm font-medium flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-[oklch(0.80_0.18_85)]" /> Privacy banner
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Marks the screenshot as containing fictional data.
                    </p>
                  </div>
                  <Switch
                    id="fake"
                    checked={draft.fake_data}
                    onCheckedChange={(v) => setDraft({ ...draft, fake_data: v })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!valid[step]}
            className="gap-1.5"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handlePublish} disabled={submitting} className="gap-1.5 glow-ring">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}