import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

async function getProjectOrFail(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return { error: "Progetto non trovato", status: 404 }
  if (project.userId !== userId) return { error: "Non autorizzato", status: 403 }
  return { project }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }
  const { id } = await params
  const result = await getProjectOrFail(id, session.user.id)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.project)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }
  const { id } = await params
  const result = await getProjectOrFail(id, session.user.id)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  try {
    const body = await req.json()
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        screenshotUrl: body.screenshotUrl || null,
        projectUrl: body.projectUrl || null,
        techStack: body.techStack ?? [],
        category: body.category,
        isPublic: body.isPublic,
        fakeData: body.fakeData,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }
  const { id } = await params
  const result = await getProjectOrFail(id, session.user.id)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
