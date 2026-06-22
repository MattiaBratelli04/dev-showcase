import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ProjectWizard } from "@/components/project-wizard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/projects/new")({
  head: () => ({ meta: [{ title: "New project — DevShelf" }] }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">New project</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <ProjectWizard
          onSubmit={async (draft) => {
            const { data: u } = await supabase.auth.getUser();
            if (!u.user) return;
            const { error } = await supabase.from("projects").insert({
              user_id: u.user.id,
              title: draft.title.trim(),
              description: draft.description,
              category: draft.category,
              screenshot_url: draft.screenshot_url,
              tech_stack: draft.tech_stack,
              project_url: draft.project_url || null,
              is_public: draft.is_public,
              fake_data: draft.fake_data,
            });
            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success("Project published!");
            navigate({ to: "/dashboard" });
          }}
        />
      </main>
    </div>
  );
}