import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
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
      createdAt: true,
      projects: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          screenshotUrl: true,
          projectUrl: true,
          techStack: true,
          category: true,
          fakeData: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user || !user.isPublic) {
    return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 })
  }

  return NextResponse.json(user)
}
