"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MoreVertical, Globe, Lock } from "lucide-react"
import { useState } from "react"

export interface Project {
  id: string
  title: string
  description?: string | null
  screenshotUrl?: string | null
  projectUrl?: string | null
  techStack: string[]
  category?: string | null
  isPublic: boolean
  fakeData: boolean
}

interface BrowserCardProps {
  project: Project
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
  showMenu?: boolean
}

export function BrowserCard({
  project,
  onClick,
  onEdit,
  onDelete,
  onTogglePublic,
  showMenu = false,
}: BrowserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const fakeUrl =
    project.projectUrl ||
    `https://${project.title.toLowerCase().replace(/\s+/g, "-")}.vercel.app`

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer"
      whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClick}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-zinc-700 rounded px-2 py-0.5 text-[11px] text-zinc-400 truncate min-w-0">
          {fakeUrl.replace("https://", "")}
        </div>
      </div>

      {/* Screenshot */}
      <div className="relative w-full aspect-video bg-zinc-50 dark:bg-zinc-950">
        {project.screenshotUrl ? (
          <Image
            src={project.screenshotUrl}
            alt={project.title}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-300">
            <Globe size={28} />
            <span className="text-xs">Nessuna anteprima</span>
          </div>
        )}
        {project.fakeData && (
          <div className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-[10px] text-center py-0.5">
            Dati fittizi
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {project.title}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] text-zinc-400">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {showMenu && (
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Menu progetto"
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 w-40 text-sm">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  onClick={() => { setMenuOpen(false); onEdit?.() }}
                >
                  Modifica
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2"
                  onClick={() => { setMenuOpen(false); onTogglePublic?.() }}
                >
                  {project.isPublic ? <Lock size={12} /> : <Globe size={12} />}
                  {project.isPublic ? "Rendi privato" : "Rendi pubblico"}
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  onClick={() => {
                    setMenuOpen(false)
                    navigator.clipboard.writeText(
                      `${window.location.origin}/projects/${project.id}`
                    )
                  }}
                >
                  Copia link
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-red-500"
                  onClick={() => { setMenuOpen(false); onDelete?.() }}
                >
                  Elimina
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
