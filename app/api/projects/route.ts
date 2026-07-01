import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/backend/lib/auth"
import { prisma } from "@/backend/lib/prisma"
import { z } from "zod"

const projectSchema = z.object({
  title: z.string().min(1, "Titolo obbligatorio").max(100),
  description: z.string().max(500).optional(),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
  projectUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).max(10).default([]),
  category: z.string().optional(),
  isPublic: z.boolean().default(false),
  fakeData: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...data,
        screenshotUrl: data.screenshotUrl || null,
        projectUrl: data.projectUrl || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}
