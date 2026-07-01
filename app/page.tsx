import Link from "next/link"
import { ArrowRight, Code2, Layers, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950/20 dark:via-zinc-950 dark:to-indigo-950/20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-10 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-100 dark:border-violet-900 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Portfolio per sviluppatori
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Mostra i tuoi progetti{" "}
            <span className="text-violet-600">come un pro</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Carica i tuoi progetti e presentali come schede browser interattive.
            Un profilo che si ricorda — non il solito elenco di link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Inizia gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-xl font-medium border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              Esplora i profili
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-12">
            Tutto quello che ti serve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code2 className="text-violet-600" size={24} />,
                title: "Browser Cards interattive",
                desc: "Ogni progetto appare come una finestra browser. Cliccaci e si apre in un overlay full-screen.",
              },
              {
                icon: <Layers className="text-violet-600" size={24} />,
                title: "Privacy garantita",
                desc: "Attiva il banner 'dati fittizi' per avvertire i visitatori che i dati mostrati non sono reali.",
              },
              {
                icon: <Users className="text-violet-600" size={24} />,
                title: "Profilo pubblico condivisibile",
                desc: "Il tuo URL personale da condividere ovunque. Bio, tech stack, link social — tutto in un posto.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-20 px-4 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Pronto a creare il tuo profilo?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Ci vogliono meno di 2 minuti. Nessuna carta di credito richiesta.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Crea il tuo DevShelf
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
