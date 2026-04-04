import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const views = await (prisma as any).pageView.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const userIds = [...new Set(views.filter((v: any) => v.userId).map((v: any) => v.userId))] as string[]
  const usersMap: Record<string, { name: string | null; email: string | null }> = {}
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    users.forEach((u) => { usersMap[u.id] = { name: u.name, email: u.email } })
  }

  const formatted = views.map((v: any) => ({
    id: v.id,
    path: v.path,
    userId: v.userId,
    sessionId: v.sessionId,
    durationMs: v.durationMs,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    userName: v.userId ? usersMap[v.userId]?.name ?? null : null,
    userEmail: v.userId ? usersMap[v.userId]?.email ?? null : null,
  }))

  return NextResponse.json({ views: formatted })
}
