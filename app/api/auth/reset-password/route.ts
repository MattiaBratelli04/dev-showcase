import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/backend/lib/prisma"
import { z } from "zod"

const resetPasswordSchema = z.object({
  email: z.string().email("Email non valida"),
  token: z.string().min(1, "Token mancante"),
  password: z.string().min(8, "Password minimo 8 caratteri"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, token, password } = resetPasswordSchema.parse(body)

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.json({ error: "Link di reset non valido" }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.json({ error: "Il link di reset è scaduto, richiedine uno nuovo" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Token monouso: eliminato subito dopo l'utilizzo
    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({ message: "Password aggiornata con successo" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}
