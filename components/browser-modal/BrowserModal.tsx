"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"
import type { Project } from "@/components/browser-card/BrowserCard"

interface BrowserModalProps {
  project: Project | null
  onClose: () => void
}

export function BrowserModal({ project, onClose }: BrowserModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const fakeUrl = project
    ? project.projectUrl ||
      `https://${project.title.toLowerCase().replace(/\s+/g, "-")}.vercel.app`
    : ""

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900"
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"
                />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 shrink-0">
                <ArrowLeft size={13} />
                <ArrowRight size={13} />
                <RotateCcw size={13} />
              </div>
              <div className="flex-1 bg-white dark:bg-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 truncate min-w-0">
                {fakeUrl}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-violet-500 transition-colors"
                    title="Apri progetto reale"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Privacy banner */}
            {project.fakeData && (
              <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs text-center py-1.5 px-4">
                ⚠️ I dati mostrati in questa anteprima sono fittizi e non rappresentano dati reali
              </div>
            )}

            {/* Screenshot */}
            <div className="relative w-full bg-zinc-50 dark:bg-zinc-950" style={{ aspectRatio: "16/9" }}>
              {project.screenshotUrl ? (
                <Image
                  src={project.screenshotUrl}
                  alt={project.title}
                  fill
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
                  <div className="text-5xl">🖥️</div>
                  <p className="text-sm">Nessuna anteprima disponibile</p>
                </div>
              )}
            </div>

            {/* Info footer */}
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {project.title}
                </p>
                {project.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
