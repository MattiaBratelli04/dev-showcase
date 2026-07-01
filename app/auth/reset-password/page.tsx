"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const missingParams = !token || !email

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Le due password non coincidono")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Errore durante il reset")

      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 2500)
    } catch (err: any) {
      setError(err.message || "Errore durante il reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reimposta password</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Scegli una nuova password per {email || "il tuo account"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-4">
          {missingParams ? (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              Link non valido: mancano i parametri necessari. Richiedine uno nuovo dalla pagina{" "}
              <Link href="/auth/forgot-password" className="underline font-medium">
                Password dimenticata
              </Link>.
            </div>
          ) : success ? (
            <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg">
              Password aggiornata con successo. Ti reindirizziamo al login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nuova password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Minimo 8 caratteri"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Conferma password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Ripeti la password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition-colors mt-1"
              >
                {loading ? "Salvataggio..." : "Reimposta password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          <Link href="/auth/login" className="text-violet-600 hover:underline font-medium">
            Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}
