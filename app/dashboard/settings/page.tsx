"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { X } from "lucide-react"

interface ProfileForm {
  name: string
  bio: string
  image: string
  githubUrl: string
  linkedinUrl: string
  websiteUrl: string
  techStack: string[]
  isPublic: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { status } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    image: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    techStack: [],
    isPublic: true,
  })
  const [techInput, setTechInput] = useState("")

  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    fetch("/api/profile/me")
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username ?? "")
        setEmail(data.email ?? "")
        setForm({
          name: data.name ?? "",
          bio: data.bio ?? "",
          image: data.image ?? "",
          githubUrl: data.githubUrl ?? "",
          linkedinUrl: data.linkedinUrl ?? "",
          websiteUrl: data.websiteUrl ?? "",
          techStack: data.techStack ?? [],
          isPublic: data.isPublic ?? true,
        })
      })
      .finally(() => setLoading(false))
  }, [status])

  function addTech(value: string) {
    const clean = value.trim()
    if (clean && !form.techStack.includes(clean) && form.techStack.length < 20) {
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
    setSaved(false)
    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({
        name: data.name ?? "",
        bio: data.bio ?? "",
        image: data.image ?? "",
        githubUrl: data.githubUrl ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        websiteUrl: data.websiteUrl ?? "",
        techStack: data.techStack ?? [],
        isPublic: data.isPublic ?? true,
      })
      setSaved(true)
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== username) return
    if (!window.confirm("Sei assolutamente sicuro? Questa azione è definitiva e irreversibile: verranno eliminati il tuo account e tutti i tuoi progetti.")) {
      return
    }

    setDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch("/api/profile/me", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Errore durante l'eliminazione")
      }
      await signOut({ callbackUrl: "/" })
    } catch (err: any) {
      setDeleteError(err.message || "Errore durante l'eliminazione")
      setDeleting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Impostazioni profilo</h1>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="mb-4 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-lg">
          Profilo aggiornato con successo
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-6"
      >
        {/* Account (sola lettura) */}
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Account</h2>
          <div className="flex items-center justify-between text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5">
            <span className="text-zinc-500 dark:text-zinc-400">Username</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">@{username}</span>
          </div>
          <div className="flex items-center justify-between text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5">
            <span className="text-zinc-500 dark:text-zinc-400">Email</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">{email}</span>
          </div>
          <p className="text-xs text-zinc-400">Username ed email non sono modificabili da questa pagina.</p>
        </div>

        {/* Info profilo */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Informazioni profilo</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={300}
              placeholder="Due righe su di te (max 300 caratteri)"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <p className="text-xs text-zinc-400 text-right">{form.bio.length}/300</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL foto profilo <span className="text-zinc-400 font-normal">(opzionale)</span>
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://esempio.com/foto.jpg"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {form.image && (
            <img
              src={form.image}
              alt="Anteprima foto profilo"
              className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
          )}
        </div>

        {/* Link social */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Link social</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub</label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              placeholder="https://github.com/tuonome"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">LinkedIn</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/tuonome"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sito web</label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              placeholder="https://tuosito.com"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Tech stack */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Tecnologie che conosci</h2>
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
          <p className="text-xs text-zinc-400">{form.techStack.length}/20 tecnologie</p>
        </div>

        {/* Visibilità */}
        <div className="flex flex-col gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Visibilità</h2>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="mt-0.5 accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Profilo pubblico</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Se disattivato, la tua pagina <code>/profile/{username}</code> non sarà raggiungibile dai visitatori
              </p>
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
            Torna alla dashboard
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      </form>

      {/* Zona pericolosa */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-1">Zona pericolosa</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Eliminare l&apos;account è <strong>definitivo e irreversibile</strong>: verranno cancellati subito il tuo profilo,
          tutti i tuoi progetti e le tue sessioni attive. Non è previsto alcun periodo di recupero.
        </p>

        {deleteError && (
          <div className="mb-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
            {deleteError}
          </div>
        )}

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Per confermare, scrivi <span className="font-mono font-semibold">{username}</span>
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={username}
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleteConfirmText !== username || deleting}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {deleting ? "Eliminazione in corso..." : "Elimina account definitivamente"}
        </button>
      </div>
    </div>
  )
}
