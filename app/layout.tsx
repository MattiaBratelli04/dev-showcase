import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/frontend/components/layout/Navbar"
import { SessionProvider } from "@/frontend/components/providers/SessionProvider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevShelf — Mostra i tuoi progetti",
  description:
    "La piattaforma per sviluppatori che vogliono presentare i propri progetti in modo visivo e interattivo.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="scroll-smooth">
      <body
        className={`${geist.className} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}
      >
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
