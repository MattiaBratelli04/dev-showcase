"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"

const CATEGORIES = ["Web App", "App Mobile", "API / Backend", "Design System", "Tool / Script", "Altro"]

interface ProjectForm {
  title: string
  description: string
  category: string
  screenshotUrl: string
  projectUrl: string
  techStack: string[]
  isPublic: boolean
  fakeData: boolean
}

export default function EditProjectPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { status } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState<ProjectForm>({
    title: "",
    description: "",
    category: "",
    screenshotUrl: "",
    projectUrl: "",
    techStack: [],
    isPublic: false,
    fakeData: false,
  })
  const [techInput, setTechInput] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    fetch(`/api/projects/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          category: data.category ?? "",
          screenshotUrl: data.screenshotUrl ?? "",
          projectUrl: data.projectUrl ?? "",
          techStack: data.techStack ?? [],
          isPublic: data.isPublic ?? false,
          fakeData: data.fakeData ?? false,
        })
      })
      .finally(() => setLoading(false))
  }, [id, status])

  function addTech(value: string) {
    const clean = value.trim()
    if (clean && !form.techStack.includes(clean) && form.techStack.length < 10) {
      setForm({ ...form, techStack: [...form.techStack, clean] })
    }
    setTechInput("")
  }

  function removeTech(tech: string) {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio")
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          Progetto non trovato
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Il progetto non esiste oppure non appartiene al tuo account.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-violet-600 hover:underline font-medium"
        >
          Torna alla dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Modifica progetto</h1>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-6"
      >
        {/* Info base */}
        <div className="flex flex-col gap-5">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Informazioni base</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Titolo *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Descrizione</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Seleziona categoria</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Screenshot */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Screenshot</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL dell&apos;immagine
            </label>
            <input
              type="url"
              value={form.screenshotUrl}
              onChange={(e) => setForm({ ...form, screenshotUrl: e.target.value })}
              placeholder="https://esempio.com/screenshot.png"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {form.screenshotUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.screenshotUrl} alt="Anteprima" className="w-full h-full object-cover object-top" />
            </div>
          )}
        </div>

        {/* Tech stack */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Tecnologie usate</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Aggiungi tecnologia e premi Invio
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTech(techInput) }
              }}
              placeholder="Es. React, Node.js, Docker..."
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {form.techStack.map((tech) => (
              <span key={tech} className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-500 ml-0.5">
                  <X size={12} />
                </button>
              </span>
            ))}
            {form.techStack.length === 0 && (
              <p className="text-xs text-zinc-400">Nessuna tecnologia aggiunta</p>
            )}
          </div>
          <p className="text-xs text-zinc-400">{form.techStack.length}/10 tecnologie</p>
        </div>

        {/* Dettagli finali */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Dettagli finali</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL del progetto <span className="text-zinc-400 font-normal">(opzionale)</span>
            </label>
            <input
              type="url"
              value={form.projectUrl}
              onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
              placeholder="https://mioprogetto.vercel.app"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="mt-0.5 accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rendi pubblico</p>
              <p className="text-xs text-zinc-400 mt-0.5">Il progetto sarà visibile sul tuo profilo pubblico</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="checkbox"
              checked={form.fakeData}
              onChange={(e) => setForm({ ...form, fakeData: e.target.checked })}
              className="mt-0.5 accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attiva avviso dati fittizi</p>
              <p className="text-xs text-zinc-400 mt-0.5">Mostra un banner che avverte i visitatori che i dati nello screenshot sono fittizi</p>
            </div>
          </label>
        </div>

        {/* Azioni */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving || !form.title}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      </form>
    </div>
  )
}
