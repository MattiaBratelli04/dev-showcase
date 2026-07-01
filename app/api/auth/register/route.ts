import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/backend/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Nome troppo corto"),
  username: z
    .string()
    .min(3, "Username troppo corto")
    .max(20, "Username troppo lungo")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo lettere, numeri e underscore"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "Password minimo 8 caratteri"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingEmail) {
      return NextResponse.json({ error: "Email già in uso" }, { status: 400 })
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    })
    if (existingUsername) {
      return NextResponse.json({ error: "Username già in uso" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, username: true, email: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}
