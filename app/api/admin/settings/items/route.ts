import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await prisma.homePageItem.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { section, items } = body as {
    section: string
    items: Array<{
      id?: string; title: string; subtitle?: string; description?: string;
      icon?: string; link?: string; color?: string; enabled?: boolean
    }>
  }

  if (!section || !Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Delete all items in this section and recreate
  await prisma.homePageItem.deleteMany({ where: { section } })

  if (items.length > 0) {
    await prisma.homePageItem.createMany({
      data: items.map((item, i) => ({
        id: item.id ?? `${section}-${i}-${Date.now()}`,
        section,
        title: item.title,
        subtitle: item.subtitle ?? null,
        description: item.description ?? null,
        icon: item.icon ?? null,
        link: item.link ?? null,
        color: item.color ?? null,
        order: i,
        enabled: item.enabled ?? true,
        updatedAt: new Date(),
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ ok: true })
}
