import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RotateCw,
  X,
  ShieldAlert,
} from "lucide-react";
import type { Project } from "@/lib/types";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function BrowserModal({ project, onClose }: Props) {
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  const host = project?.project_url
    ? safeHost(project.project_url)
    : "localhost:3000";

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-background/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="w-full max-w-6xl rounded-2xl overflow-hidden border border-border bg-surface browser-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border-b border-border">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="h-3 w-3 rounded-full bg-[oklch(0.70_0.22_25)] hover:opacity-80"
                  aria-label="Close"
                />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.80_0.18_85)]" />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.72_0.20_150)]" />
              </div>
              <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                <ArrowRight className="h-4 w-4" />
                <RotateCw className="h-4 w-4 ml-1" />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/60 border border-border text-xs text-muted-foreground font-mono truncate">
                <span className="text-primary/80">{project.is_public ? "https://" : "private://"}</span>
                {host}
              </div>
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {project.fake_data && (
              <div className="flex items-start gap-2 px-4 py-2.5 bg-[oklch(0.30_0.10_80)] text-[oklch(0.95_0.08_90)] border-b border-border text-sm">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  The data shown in this preview has been replaced with fictional
                  values to protect privacy.
                </p>
              </div>
            )}

            {/* Content */}
            <div className="aspect-[16/9] bg-background overflow-auto">
              {project.screenshot_url ? (
                <img
                  src={project.screenshot_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No screenshot uploaded
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border bg-surface">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
              {project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tech_stack.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}