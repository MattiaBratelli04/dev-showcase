"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [devResetUrl, setDevResetUrl] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    setDevResetUrl("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Errore durante la richiesta")

      setMessage(data.message)
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl)
    } catch (err: any) {
      setError(err.message || "Errore durante la richiesta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Password dimenticata?</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Inserisci la tua email, ti mandiamo un link per reimpostarla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg flex flex-col gap-2">
              <span>{message}</span>
              {devResetUrl && (
                <>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Nessun servizio email è configurato in questo ambiente: ecco il link diretto (in produzione arriverebbe via email).
                  </span>
                  <Link href={devResetUrl} className="text-xs text-violet-600 hover:underline break-all">
                    {devResetUrl}
                  </Link>
                </>
              )}
            </div>
          )}

          {!message && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="tu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition-colors mt-1"
              >
                {loading ? "Invio in corso..." : "Invia link di reset"}
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          <Link href="/auth/login" className="text-violet-600 hover:underline font-medium">
            Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}
