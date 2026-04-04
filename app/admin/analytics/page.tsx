import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Users, Eye, Clock, Activity, BarChart3, LogIn } from "lucide-react"
import React from "react"
import LiveAnalyticsClient from "./LiveAnalyticsClient"

export default async function AdminAnalytics() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  const now = new Date()

  // Core live stats
  const [totalUsers, activeSessions, totalPageViews, totalLogins] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { expires: { gt: now } } }),
    prisma.pageView.count(),
    prisma.loginEvent.count(),
  ])

  // Average duration across all page views
  const avgResult = await prisma.pageView.aggregate({ _avg: { durationMs: true } })
  const avgDurationMs = Math.floor(avgResult._avg.durationMs ?? 0)

  // Top pages — using Prisma groupBy
  const topPagesGrouped = await prisma.pageView.groupBy({
    by: ["path"],
    _count: { id: true },
    _sum: { durationMs: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  })

  // Count unique sessions per path separately
  const topPages = await Promise.all(
    topPagesGrouped.map(async (g) => {
      const uniqueSessions = await prisma.pageView.findMany({
        where: { path: g.path },
        distinct: ["sessionId"],
        select: { sessionId: true },
      })
      return {
        path: g.path,
        views: g._count.id,
        totalDurationMs: g._sum.durationMs ?? 0,
        uniqueSessions: uniqueSessions.length,
      }
    })
  )

  // Recent page views with user info
  const recentViewsRaw = await prisma.pageView.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const userIds = [...new Set(recentViewsRaw.filter((v) => v.userId).map((v) => v.userId as string))]
  const usersMap: Record<string, { name: string | null; email: string | null }> = {}
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    users.forEach((u) => { usersMap[u.id] = { name: u.name, email: u.email } })
  }

  const liveViews = recentViewsRaw.map((v) => ({
    id: v.id,
    path: v.path,
    userId: v.userId,
    sessionId: v.sessionId,
    durationMs: v.durationMs,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    userName: v.userId ? (usersMap[v.userId]?.name ?? null) : null,
    userEmail: v.userId ? (usersMap[v.userId]?.email ?? null) : null,
  }))

  // Login events per provider breakdown
  const loginsByProvider = await prisma.loginEvent.groupBy({
    by: ["provider"],
    _count: { id: true },
  })

  // Monthly user signups (last 6 months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const [signups, logins] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: month, lte: monthEnd } } }),
      prisma.loginEvent.count({ where: { createdAt: { gte: month, lte: monthEnd } } }),
    ])
    monthlyData.push({ month: monthNames[month.getMonth()], users: signups, logins })
  }

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Sessions", value: activeSessions.toLocaleString(), icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Logins", value: totalLogins.toLocaleString(), icon: LogIn, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Page Views", value: totalPageViews.toLocaleString(), icon: Eye, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Avg Time on Page", value: formatDuration(avgDurationMs), icon: Clock, color: "text-pink-400", bg: "bg-pink-500/10" },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="section-label">Analytics Hub</span>
          <h1 className="text-4xl font-extrabold text-white mt-2 leading-tight">Performance Intelligence</h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Real-time: who is on what page, how long, total logins, and user trends.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">LIVE DATA</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1A1F2E] p-5 rounded-2xl border border-[#2D3748] hover:border-[#0D6E6E]/50 transition-all group shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Login Breakdown + Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0D6E6E]" /> Monthly Signups & Logins — Last 6 Months
          </h3>
          <div className="space-y-3">
            {monthlyData.map((m, i) => {
              const maxLogins = Math.max(...monthlyData.map((x) => x.logins), 1)
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500 w-8">{m.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-[#0D6E6E]" style={{ width: `${Math.max((m.logins / maxLogins) * 100, m.logins > 0 ? 4 : 0)}%` }} />
                      <span className="text-[10px] text-slate-400">{m.logins} logins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max((m.users / maxLogins) * 100, m.users > 0 ? 4 : 0)}%` }} />
                      <span className="text-[10px] text-slate-400">{m.users} signups</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2D3748]">
            <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-full bg-[#0D6E6E]" /><span className="text-[10px] text-slate-400">Logins</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-full bg-blue-500" /><span className="text-[10px] text-slate-400">Signups</span></div>
          </div>
        </div>

        {/* Login by Provider */}
        <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-purple-400" /> Logins by Provider
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Total All Time</span>
              <span className="text-xl font-bold text-purple-400">{totalLogins.toLocaleString()}</span>
            </div>
            <div className="h-px bg-[#2D3748]" />
            {loginsByProvider.length > 0 ? loginsByProvider.map((g, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${g.provider === "google" ? "bg-blue-400" : g.provider === "credentials" ? "bg-[#0D6E6E]" : "bg-slate-400"}`} />
                  <span className="text-xs text-slate-300 capitalize">{g.provider}</span>
                </div>
                <span className="text-sm font-bold text-white">{(g._count as any).id}</span>
              </div>
            )) : (
              <p className="text-xs text-slate-600 text-center py-4">Logins will appear here after users sign in.</p>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity */}
      <LiveAnalyticsClient
        initialLive={liveViews}
        topPages={topPages}
        totalViews={totalPageViews}
        activeSessionsCount={activeSessions}
        avgDurationMs={avgDurationMs}
      />
    </div>
  )
}

function formatDuration(ms: number) {
  if (ms < 1000) return "<1s"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem.toString().padStart(2, "0")}s`
}