import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ProjectWizard } from "@/components/project-wizard";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/projects/$id/edit")({
  head: () => ({ meta: [{ title: "Edit project — DevShelf" }] }),
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      setProject(data as Project | null);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium truncate">Edit project</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        {project ? (
          <ProjectWizard
            initial={project}
            submitLabel="Save changes"
            onSubmit={async (draft) => {
              const { error } = await supabase
                .from("projects")
                .update({
                  title: draft.title.trim(),
                  description: draft.description,
                  category: draft.category,
                  screenshot_url: draft.screenshot_url,
                  tech_stack: draft.tech_stack,
                  project_url: draft.project_url || null,
                  is_public: draft.is_public,
                  fake_data: draft.fake_data,
                })
                .eq("id", id);
              if (error) return toast.error(error.message);
              toast.success("Saved");
              navigate({ to: "/dashboard" });
            }}
          />
        ) : (
          <div className="text-center text-muted-foreground py-20">Loading…</div>
        )}
      </main>
    </div>
  );
}