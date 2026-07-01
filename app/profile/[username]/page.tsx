"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Globe, ExternalLink, GitBranch, Link2 } from "lucide-react"
import { BrowserCard, type Project } from "@/frontend/components/browser-card/BrowserCard"
import { BrowserModal } from "@/frontend/components/browser-modal/BrowserModal"

interface UserProfile {
  id: string
  name: string
  username: string
  bio: string | null
  image: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  websiteUrl: string | null
  techStack: string[]
  projects: Project[]
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [selected, setSelected] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [filterTech, setFilterTech] = useState("")

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setUser(data)
        setLoading(false)
      })
  }, [username])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="text-5xl">🔍</div>
        <h2 className="font-semibold text-zinc-700 dark:text-zinc-300">Profilo non trovato</h2>
        <p className="text-sm text-zinc-400">@{username} non esiste o il profilo è privato.</p>
      </div>
    )
  }

  const allTechs = Array.from(new Set(user.projects.flatMap((p) => p.techStack)))
  const filteredProjects = filterTech
    ? user.projects.filter((p) => p.techStack.includes(filterTech))
    : user.projects

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-violet-100 dark:bg-violet-900 shrink-0">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-violet-600 font-bold text-2xl">
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{user.name}</h1>
          <p className="text-sm text-zinc-400 mb-3">@{user.username}</p>

          {user.bio && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-lg leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Social links */}
          <div className="flex items-center gap-3 flex-wrap">
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <GitBranch size={14} /> GitHub <ExternalLink size={10} />
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Link2 size={14} /> LinkedIn <ExternalLink size={10} />
              </a>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Globe size={14} /> Sito web <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Tech stack */}
          {user.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {user.techStack.map((tech) => (
                <span key={tech}
                  className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progetti */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-zinc-900 dark:text-white">
          Progetti ({filteredProjects.length})
        </h2>
        {/* Filtro tech */}
        {allTechs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterTech("")}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                !filterTech
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-400"
              }`}
            >
              Tutti
            </button>
            {allTechs.map((t) => (
              <button
                key={t}
                onClick={() => setFilterTech(t === filterTech ? "" : t)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  filterTech === t
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-sm text-zinc-400">Nessun progetto pubblico</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <BrowserCard
              key={project.id}
              project={project}
              onClick={() => setSelected(project)}
            />
          ))}
        </div>
      )}

      <BrowserModal project={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
