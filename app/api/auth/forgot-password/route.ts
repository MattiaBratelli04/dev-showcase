import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/backend/lib/prisma"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Email non valida"),
})

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 ora

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Risposta sempre generica, indipendentemente dall'esistenza dell'email,
    // per non rivelare quali indirizzi sono registrati (user enumeration).
    const genericResponse = NextResponse.json({
      message: "Se l'indirizzo è registrato, riceverai un link per reimpostare la password.",
    })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      // Utente inesistente o account solo-OAuth (senza password da resettare)
      return genericResponse
    }

    // Invalida eventuali token precedenti per lo stesso indirizzo
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const token = crypto.randomBytes(32).toString("hex")
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    // Nessun servizio email configurato in questo progetto: il link viene
    // loggato lato server e restituito in risposta per uso in sviluppo/demo.
    // In produzione andrebbe sostituito con un invio email reale (vedi docs/manuale-sviluppatore.md).
    console.log(`[reset-password] Link per ${email}: ${resetUrl}`)

    return NextResponse.json({
      message: "Se l'indirizzo è registrato, riceverai un link per reimpostare la password.",
      devResetUrl: resetUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}
