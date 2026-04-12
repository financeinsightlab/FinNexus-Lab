import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  FilePlus,
  FileText,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Wifi,
  Clock,
  UserPlus,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import React from "react"
import HeroBackground from "@/components/ui/HeroBackground"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/admin/cms")

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsersThisWeek,
    newUsersLastWeek,
    activeSessions,
    totalPosts,
    publishedPosts,
    recentUsers,
    recentPosts,
    postsByType,
    totalPageViews,
    totalLogins,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.session.count({ where: { expires: { gt: now } } }),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, subscriptionStatus: true },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, type: true, published: true, createdAt: true, viewCount: true },
    }),
    prisma.post.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.pageView.count(),
    prisma.loginEvent.count(),
  ])

  const userGrowth = newUsersLastWeek > 0
    ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100)
    : newUsersThisWeek > 0 ? 100 : 0

  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      trend: `+${newUsersThisWeek} this week`,
      trendUp: true,
    },
    {
      label: "Active Sessions",
      value: activeSessions.toLocaleString(),
      icon: Wifi,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: "Currently online",
      trendUp: true,
    },
    {
      label: "Total Logins",
      value: totalLogins.toLocaleString(),
      icon: LogIn,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      trend: "All time",
      trendUp: true,
    },
    {
      label: "Total Content",
      value: totalPosts.toLocaleString(),
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      trend: `${publishedPosts} published`,
      trendUp: true,
    },
    {
      label: "Page Views",
      value: totalPageViews.toLocaleString(),
      icon: TrendingUp,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      trend: "All time",
      trendUp: true,
    },
  ]

  const typeColors: Record<string, string> = {
    RESEARCH: "text-blue-400 bg-blue-500/10",
    INSIGHT: "text-emerald-400 bg-emerald-500/10",
    CASE_STUDY: "text-purple-400 bg-purple-500/10",
    MEDIA: "text-pink-400 bg-pink-500/10",
    OTHER: "text-slate-400 bg-slate-500/10",
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-8 md:p-10 shadow-xl border border-white/5">
        <HeroBackground />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="section-label text-teal-400">Command Center</span>
            <h1 className="text-4xl font-extrabold text-white mt-2 leading-tight">Administration Overview</h1>
            <p className="text-slate-300 mt-2 max-w-xl">
              Welcome back, <span className="text-white font-semibold">{session.user?.name || "Admin"}</span>. Here's your live platform snapshot.
            </p>
          </div>
          <Link href="/admin/cms/new" className="btn-primary bg-white text-brand-navy hover:bg-gray-100 flex items-center gap-2 group whitespace-nowrap shadow-lg">
            <FilePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Create New Content
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1A1F2E] p-6 rounded-2xl border border-[#2D3748] hover:border-[#0D6E6E]/50 transition-all group shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Live</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">{stat.value}</h3>
            <p className="text-xs text-slate-500 mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content by Type */}
        <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0D6E6E]" /> Content Breakdown
          </h3>
          <div className="space-y-3">
            {postsByType.map((g) => (
              <div key={g.type} className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${typeColors[g.type] ?? "text-slate-400 bg-slate-500/10"}`}>
                  {g.type.replace("_", " ")}
                </span>
                <span className="text-gray-900 dark:text-white font-bold text-sm">{(g._count as any).id}</span>
              </div>
            ))}
            {postsByType.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No content yet</p>
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" /> Recent Signups
            </h3>
            <Link href="/admin/users" className="text-[10px] text-[#0D6E6E] font-bold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#0D6E6E]/10 border border-[#0D6E6E]/20 flex items-center justify-center text-[#0D6E6E] text-xs font-bold flex-shrink-0">
                  {(u.name || u.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{u.name || "Anonymous"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${u.role === "ADMIN" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-slate-500"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Content */}
        <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Recent Content
            </h3>
            <Link href="/admin/cms" className="text-[10px] text-[#0D6E6E] font-bold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map((p) => (
              <Link key={p.id} href={`/admin/cms/edit/${p.id}`} className="block group">
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${p.published ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#0D6E6E] transition-colors">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-600 font-mono">{p.type}</span>
                      <span className="text-[9px] text-slate-600">· {p.viewCount} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
          <span className="text-xs text-[#0D6E6E] font-semibold">Content Engine v2.0</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Manage Research", href: "/admin/cms?type=RESEARCH", color: "text-blue-400" },
            { label: "Manage Insights", href: "/admin/cms?type=INSIGHT", color: "text-emerald-400" },
            { label: "Case Studies", href: "/admin/cms?type=CASE_STUDY", color: "text-purple-400" },
            { label: "User Directory", href: "/admin/users", color: "text-amber-400" },
            { label: "Live Analytics", href: "/admin/analytics", color: "text-pink-400" },
            { label: "New Content", href: "/admin/cms/new", color: "text-[#0D6E6E]" },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-transparent hover:border-white/5"
            >
              <span className={`text-sm font-semibold ${link.color} group-hover:text-white transition-colors`}>{link.label}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#0D6E6E] transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
