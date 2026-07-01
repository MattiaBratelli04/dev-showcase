"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
          Dev<span className="text-violet-600">Shelf</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Esplora
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href={`/profile/${(session.user as any).username}`}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Profilo
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Accedi
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Inizia gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 flex flex-col gap-3">
          <Link href="/explore" className="text-sm" onClick={() => setOpen(false)}>Esplora</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href={`/profile/${(session.user as any).username}`} className="text-sm" onClick={() => setOpen(false)}>Profilo</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-left text-red-500">Esci</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm" onClick={() => setOpen(false)}>Accedi</Link>
              <Link href="/auth/register" className="text-sm text-violet-600 font-medium" onClick={() => setOpen(false)}>Inizia gratis</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
