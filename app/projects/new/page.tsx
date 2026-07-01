"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { X, Upload } from "lucide-react"

const CATEGORIES = ["Web App", "App Mobile", "API / Backend", "Design System", "Tool / Script", "Altro"]
const STEPS = ["Info base", "Screenshot", "Tecnologie", "Dettagli"]

export default function NewProjectPage() {
  const router = useRouter()
  const { status } = useSession()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    screenshotUrl: "",
    projectUrl: "",
    techStack: [] as string[],
    isPublic: false,
    fakeData: false,
  })
  const [techInput, setTechInput] = useState("")
  const [dragOver, setDragOver] = useState(false)

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

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

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    // In produzione qui si carica via Uploadthing
    // Per ora accettiamo un URL incollato
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio")
      setLoading(false)
    }
  }

  const canNext = [
    form.title.trim().length >= 1,
    true, // screenshot opzionale
    true, // tech opzionale
    true,
  ][step]

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Aggiungi progetto</h1>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
              i < step ? "bg-violet-600 text-white" :
              i === step ? "bg-violet-600 text-white" :
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-400"}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ml-1 rounded ${i < step ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        {/* Step 0: Info base */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Informazioni base</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Titolo *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Es. E-commerce Dashboard"
                className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Descrizione</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Cosa fa questo progetto? (max 500 caratteri)"
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
        )}

        {/* Step 1: Screenshot */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Screenshot del progetto</h2>
            <div
              onDrop={handleImageDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20" : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <Upload size={32} className="mx-auto text-zinc-300 mb-3" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                Trascina qui l&apos;immagine oppure
              </p>
              <p className="text-xs text-zinc-400 mb-4">JPG, PNG, WebP — max 5MB</p>
              <p className="text-xs text-zinc-400">(Upload diretto disponibile in produzione con Uploadthing)</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Oppure incolla l&apos;URL dell&apos;immagine
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
        )}

        {/* Step 2: Tech stack */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
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
                  <button onClick={() => removeTech(tech)} className="hover:text-red-500 ml-0.5">
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
        )}

        {/* Step 3: Dettagli finali */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
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
        )}
      </div>

      {/* Navigazione */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
        >
          ← Indietro
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Avanti →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !form.title}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "Salvataggio..." : "Pubblica progetto 🚀"}
          </button>
        )}
      </div>
    </div>
  )
}
