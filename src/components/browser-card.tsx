import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  onOpen: () => void;
  actions?: {
    onEdit?: () => void;
    onDelete?: () => void;
    onCopyLink?: () => void;
    onToggleVisibility?: () => void;
  };
};

export function BrowserCard({ project, onOpen, actions }: Props) {
  const host = project.project_url
    ? safeHost(project.project_url)
    : "localhost:3000";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group"
    >
      <button
        onClick={onOpen}
        className="w-full text-left rounded-xl overflow-hidden border border-border bg-surface browser-shadow focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 border-b border-border">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.70_0.22_25)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.80_0.18_85)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.20_150)]" />
          </div>
          <div className="flex-1 mx-2 px-3 py-1 rounded-md bg-background/60 border border-border text-[11px] text-muted-foreground font-mono truncate">
            {host}
          </div>
        </div>
        {/* Screenshot */}
        <div className="aspect-[16/10] bg-background overflow-hidden">
          {project.screenshot_url ? (
            <img
              src={project.screenshot_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
              No screenshot
            </div>
          )}
        </div>
      </button>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate flex items-center gap-2">
            {project.title}
            {!project.is_public && (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Private
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground truncate font-mono">
            {project.tech_stack.length > 0
              ? project.tech_stack.slice(0, 4).join(" · ")
              : project.category}
          </p>
        </div>
        {actions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 -mt-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {actions.onEdit && (
                <DropdownMenuItem onClick={actions.onEdit}>Edit</DropdownMenuItem>
              )}
              {actions.onCopyLink && (
                <DropdownMenuItem onClick={actions.onCopyLink}>
                  Copy link
                </DropdownMenuItem>
              )}
              {actions.onToggleVisibility && (
                <DropdownMenuItem onClick={actions.onToggleVisibility}>
                  Toggle {project.is_public ? "private" : "public"}
                </DropdownMenuItem>
              )}
              {actions.onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={actions.onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}