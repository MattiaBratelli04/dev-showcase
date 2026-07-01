import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tech = searchParams.get("tech")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = 12

  const users = await prisma.user.findMany({
    where: {
      isPublic: true,
      projects: {
        some: {
          isPublic: true,
          ...(tech ? { techStack: { has: tech } } : {}),
        },
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      techStack: true,
      createdAt: true,
      _count: {
        select: { projects: { where: { isPublic: true } } },
      },
      projects: {
        where: { isPublic: true },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { screenshotUrl: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  })

  const total = await prisma.user.count({
    where: {
      isPublic: true,
      projects: { some: { isPublic: true } },
    },
  })

  return NextResponse.json({ users, total, page, limit })
}
