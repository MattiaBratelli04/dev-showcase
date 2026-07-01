"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Globe, Lock, ExternalLink } from "lucide-react"
import { BrowserCard, type Project } from "@/frontend/components/browser-card/BrowserCard"
import { BrowserModal } from "@/frontend/components/browser-modal/BrowserModal"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => {
          setProjects(Array.isArray(data) ? data : [])
          setLoading(false)
        })
    }
  }, [status])

  async function togglePublic(project: Project) {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, isPublic: !project.isPublic }),
    })
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPublic: !p.isPublic } : p))
      )
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Vuoi davvero eliminare questo progetto?")) return
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const username = (session?.user as any)?.username

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            La tua dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {projects.length} {projects.length === 1 ? "progetto" : "progetti"}
            </span>
            {username && (
              <Link
                href={`/profile/${username}`}
                className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                target="_blank"
              >
                Vedi profilo pubblico
                <ExternalLink size={11} />
              </Link>
            )}
            <Link
              href="/dashboard/settings"
              className="text-xs text-violet-600 hover:underline"
            >
              Impostazioni profilo
            </Link>
          </div>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Aggiungi progetto
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="text-5xl mb-4">🖥️</div>
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nessun progetto ancora</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
            Aggiungi il tuo primo progetto e inizia a costruire il tuo portfolio.
          </p>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Aggiungi il primo progetto
          </Link>
        </div>
      )}

      {/* Grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              {/* Visibility badge */}
              <div className="absolute top-10 left-3 z-10 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                {project.isPublic ? <Globe size={10} className="text-green-500" /> : <Lock size={10} />}
                {project.isPublic ? "Pubblico" : "Privato"}
              </div>
              <BrowserCard
                project={project}
                onClick={() => setSelected(project)}
                onEdit={() => router.push(`/projects/${project.id}/edit`)}
                onDelete={() => deleteProject(project.id)}
                onTogglePublic={() => togglePublic(project)}
                showMenu
              />
            </div>
          ))}
        </div>
      )}

      {/* FAB mobile */}
      <Link
        href="/projects/new"
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus size={24} />
      </Link>

      <BrowserModal project={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
