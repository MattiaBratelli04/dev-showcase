import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/backend/lib/auth"
import { prisma } from "@/backend/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(300).optional(),
  image: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      image: true,
      githubUrl: true,
      linkedinUrl: true,
      websiteUrl: true,
      techStack: true,
      isPublic: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        image: data.image || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        techStack: true,
        isPublic: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  // Cancellazione definitiva e irreversibile (conformità GDPR, diritto alla
  // cancellazione). Project, Account e Session hanno onDelete: Cascade sullo
  // schema, quindi vengono rimossi automaticamente insieme all'utente.
  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ success: true })
}
