import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const config = await prisma.homePageConfig.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json({ config })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { section, config, enabled } = body

  if (!section) return NextResponse.json({ error: "Missing section" }, { status: 400 })

  const existing = await prisma.homePageConfig.findUnique({ where: { section } })

  if (existing) {
    await prisma.homePageConfig.update({
      where: { section },
      data: {
        config: config ?? existing.config,
        enabled: enabled ?? existing.enabled,
        updatedAt: new Date(),
      },
    })
  } else {
    const count = await prisma.homePageConfig.count()
    await prisma.homePageConfig.create({
      data: {
        id: `config-${section}`,
        section,
        config: config ?? {},
        enabled: enabled ?? true,
        order: count,
        updatedAt: new Date(),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
