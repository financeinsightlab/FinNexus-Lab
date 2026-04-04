import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET: fetch current featured post config for a section
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const section = searchParams.get("section") ?? "RESEARCH"

  const featured = await prisma.featuredContent.findMany({
    where: { section },
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ featured })
}

// POST: save featured posts for a section
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { section, postIds } = body as { section: string; postIds: string[] }

  if (!section || !Array.isArray(postIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Delete existing for this section, then re-create
  await prisma.featuredContent.deleteMany({ where: { section } })

  if (postIds.length > 0) {
    await prisma.featuredContent.createMany({
      data: postIds.map((contentId, i) => ({
        id: `${section}-${contentId}`,
        section,
        contentId,
        order: i,
        updatedAt: new Date(),
      })),
       skipDuplicates: true,
    })
  }

  return NextResponse.json({ ok: true })
}
