import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import React from "react"
import type { Metadata } from "next"
import UsersTableClient from "./UsersTableClient"
import { Users as UsersIcon, ShieldCheck, Zap, Search, ChevronLeft, ChevronRight, Wifi } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Manage Users | Admin Panel",
  description: "User management and analytics for FinNexus Lab.",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const page = Math.max(1, Number(params.page || 1))
  const pageSize = 10
  const skip = (page - 1) * pageSize
  const now = new Date()

  const filters: any = { AND: [] }

  if (params.search) {
    filters.AND.push({
      OR: [
        { email: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
      ],
    })
  }

  if (params.role) {
    filters.AND.push({ role: params.role })
  }

  const where = filters.AND.length ? filters : undefined

  let users: any[] = []
  let totalUsersCount = 0
  let activeUsers = 0
  let proUsers = 0
  let onlineCount = 0

  try {
    const [usersData, total, activeSubs, proSubs, activeSessions] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          _count: { select: { accounts: true, sessions: true, savedArticles: true } },
          sessions: {
            where: { expires: { gt: now } },
            orderBy: { expires: "desc" },
            take: 1,
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.user.count({ where: { subscriptionPlan: "PRO" } }),
      prisma.session.count({ where: { expires: { gt: now } } }),
    ])

    users = usersData.map((u) => ({
      ...u,
      isOnline: u.sessions.length > 0,
      lastLogin: u.sessions[0]?.expires ?? null,
      sessions: undefined, // don't send all sessions to client
    }))
    totalUsersCount = total
    activeUsers = activeSubs
    proUsers = proSubs
    onlineCount = activeSessions
  } catch (error) {
    console.error("Database error in AdminUsersPage:", error)
  }

  const totalPages = Math.ceil(totalUsersCount / pageSize)

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({
      ...(params.search ? { search: params.search } : {}),
      ...(params.role ? { role: params.role } : {}),
      page: String(page),
      ...overrides,
    })
    return `/admin/users?${p.toString()}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="section-label">Access Control</span>
          <h1 className="text-3xl font-extrabold text-white mt-2">User Directory</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md">
            Live view of all members, their sessions, subscriptions, and activity.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">{onlineCount} Online Now</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: totalUsersCount, icon: UsersIcon, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Online Now", value: onlineCount, icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Active Subs", value: activeUsers, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Pro Tier", value: proUsers, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1A1F2E] p-5 rounded-2xl border border-[#2D3748] shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{stat.label}</p>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <form method="GET" action="/admin/users" className="bg-[#1A1F2E] p-5 rounded-2xl border border-[#2D3748] shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0D6E6E] transition-colors" />
            <input
              type="text"
              name="search"
              placeholder="Filter by name or email..."
              defaultValue={params.search || ""}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-[#0D6E6E]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
            />
          </div>
          <select
            name="role"
            defaultValue={params.role || ""}
            className="appearance-none bg-white/5 border border-white/10 rounded-2xl text-sm px-5 py-3 text-slate-300 outline-none focus:border-[#0D6E6E]/50 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
            <option value="MEMBER">MEMBER</option>
          </select>
          <button type="submit" className="btn-primary">Apply Filter</button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] overflow-hidden shadow-2xl">
        <UsersTableClient initialUsers={users} />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Showing <span className="text-white">{Math.min(skip + 1, totalUsersCount)}–{Math.min(page * pageSize, totalUsersCount)}</span> of <span className="text-white">{totalUsersCount}</span> users
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          )}
          <div className="flex items-center gap-1 px-4 py-2 bg-[#0D6E6E]/10 rounded-xl border border-[#0D6E6E]/20">
            <span className="text-xs font-bold text-[#0D6E6E]">PAGE {page} / {totalPages || 1}</span>
          </div>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}