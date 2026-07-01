"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, Search } from "lucide-react"

interface UserCard {
  id: string
  name: string
  username: string
  bio: string | null
  image: string | null
  techStack: string[]
  _count: { projects: number }
  projects: { screenshotUrl: string | null; title: string }[]
}

export default function ExplorePage() {
  const [users, setUsers] = useState<UserCard[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [tech, setTech] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tech) params.set("tech", tech)
    fetch(`/api/explore?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? [])
        setTotal(data.total ?? 0)
        setLoading(false)
      })
  }, [tech])

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Esplora sviluppatori</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {total} {total === 1 ? "sviluppatore" : "sviluppatori"} con profilo pubblico
        </p>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cerca per nome, username o tecnologia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {tech && (
          <button
            onClick={() => setTech("")}
            className="text-xs text-violet-600 border border-violet-200 dark:border-violet-800 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950 whitespace-nowrap"
          >
            ✕ {tech}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={40} className="text-zinc-300 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Nessun risultato trovato</p>
        </div>
      )}

      {/* Grid utenti */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`}>
              <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-200">
                {/* Preview screenshot del progetto più recente */}
                <div className="relative w-full aspect-video bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                  {user.projects[0]?.screenshotUrl ? (
                    <Image
                      src={user.projects[0].screenshotUrl}
                      alt={user.projects[0].title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-300 text-4xl">
                      👨‍💻
                    </div>
                  )}
                  {/* Contatore progetti */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {user._count.projects} {user._count.projects === 1 ? "progetto" : "progetti"}
                  </div>
                </div>

                {/* Info utente */}
                <div className="p-4 flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900 shrink-0">
                    {user.image ? (
                      <Image src={user.image} alt={user.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-violet-600 font-bold text-sm">
                        {user.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.techStack.slice(0, 4).map((tech) => (
                        <button
                          key={tech}
                          onClick={(e) => {
                            e.preventDefault()
                            setTech(tech)
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
