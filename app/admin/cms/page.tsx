import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ArticleType, Post } from "@prisma/client"
import {
  Plus,
  Search,
  Edit2,
  Eye,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import React from "react"
import ActionButtons from "./ActionButtons"
import HeroBackground from "@/components/ui/HeroBackground"

type PostWithAuthor = Post & { author: { name: string | null } }

export default async function CMSDashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")
  if (!["ADMIN", "ANALYST"].includes(session.user.role as string)) redirect("/")

  const params = await searchParams
  const type = params.type as ArticleType | undefined
  const status = params.status
  const search = params.search || ""
  const page = Math.max(1, Number(params.page || 1))
  const pageSize = 15
  const skip = (page - 1) * pageSize

  const where: any = {
    AND: [
      type ? { type } : {},
      status === "published" ? { published: true } : status === "draft" ? { published: false } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { excerpt: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  }

  let posts: PostWithAuthor[] = []
  let totalCount = 0
  const typeCounts: Record<string, number> = {}

  try {
    const [postsData, count, grouped] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          type: true,
          published: true,
          featuredImage: true,
          authorId: true,
          seoTitle: true,
          metaDescription: true,
          focusKeywords: true,
          ogImage: true,
          ogTitle: true,
          tags: true,
          difficulty: true,
          targetAudience: true,
          contentStatus: true,
          estimatedReadingTime: true,
          scheduledPublishAt: true,
          viewCount: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          blockContent: true,
          contentType: true,
          author: { select: { name: true } }
        },
      }),
      prisma.post.count({ where }),
      prisma.post.groupBy({ by: ["type"], _count: { id: true } }),
    ])
    posts = postsData
    totalCount = count
    grouped.forEach((g) => { typeCounts[g.type] = (g._count as any).id })
  } catch (e) {
    console.error("Prisma fetch failed:", e)
    // Provide empty data to prevent page crash
    posts = []
    totalCount = 0
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const categories = [
    { label: "All", value: "", count: Object.values(typeCounts).reduce((a, b) => a + b, 0) },
    { label: "Research", value: "RESEARCH", count: typeCounts.RESEARCH ?? 0 },
    { label: "Insights", value: "INSIGHT", count: typeCounts.INSIGHT ?? 0 },
    { label: "Case Studies", value: "CASE_STUDY", count: typeCounts.CASE_STUDY ?? 0 },
    { label: "Media", value: "MEDIA", count: typeCounts.MEDIA ?? 0 },
    { label: "Other", value: "OTHER", count: typeCounts.OTHER ?? 0 },
  ]

  const typeColors: Record<string, string> = {
    RESEARCH: "bg-blue-500/10 text-blue-400",
    INSIGHT: "bg-emerald-500/10 text-emerald-400",
    CASE_STUDY: "bg-purple-500/10 text-purple-400",
    MEDIA: "bg-pink-500/10 text-pink-400",
    OTHER: "bg-slate-500/10 text-slate-400",
  }

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({
      ...(search ? { search } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      page: String(page),
      ...overrides,
    })
    return `/admin/cms?${p.toString()}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-8 md:p-10 shadow-xl border border-white/5">
        <HeroBackground />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="section-label text-teal-400">Library Management</span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Content Repository</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md">
              All content — from MDX files and CMS entries — in one place.
            </p>
          </div>
          <Link href="/admin/cms/new" className="btn-primary bg-white text-brand-navy hover:bg-gray-100 flex items-center justify-center gap-2 group shadow-lg">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Create New Entry
          </Link>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={buildUrl({ type: cat.value, page: "1" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              (type ?? "") === cat.value
                ? "bg-[#0D6E6E]/20 border-[#0D6E6E]/50 text-[#0D6E6E]"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat.label}
            <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-[9px]">{cat.count}</span>
          </Link>
        ))}
      </div>

      {/* Search + Status Filter */}
      <form method="GET" action="/admin/cms" className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1A1F2E] p-4 rounded-2xl border border-[#2D3748]">
        <input type="hidden" name="type" value={type ?? ""} />
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0D6E6E] transition-colors" />
          <input
            type="text"
            name="search"
            placeholder="Search by title or excerpt..."
            defaultValue={search}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-[#0D6E6E]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="relative">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="appearance-none w-full bg-white/5 border border-white/10 rounded-2xl text-sm px-5 py-3 text-slate-300 outline-none focus:border-[#0D6E6E]/50 transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Table */}
      <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Views</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Author</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Published</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="max-w-xs md:max-w-sm">
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0D6E6E] transition-colors line-clamp-1">{post.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${typeColors[post.type] ?? "bg-slate-500/10 text-slate-400"}`}>
                        {post.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.published ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-bold uppercase">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-60" />
                          <span className="text-[10px] font-bold uppercase">Draft</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">{post.viewCount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">{post.author.name || "Unknown"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link
                          href={`/${post.type.toLowerCase().replace("_", "-")}/${post.slug}`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                          title="View Live"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/cms/edit/${post.id}`}
                          className="p-2 text-slate-500 hover:text-[#0D6E6E] bg-white/5 hover:bg-[#0D6E6E]/10 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <ActionButtons post={post} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 border border-white/5">
                        <FileText className="w-8 h-8 opacity-20" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-bold">No content found</h4>
                        <p className="text-slate-500 text-sm mt-1">
                          {search ? `No results for "${search}"` : "Your content repository is empty."}
                        </p>
                      </div>
                      <Link href="/admin/cms/new" className="btn-primary text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Entry
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2D3748]">
            <p className="text-xs text-slate-500">
              Showing <span className="text-gray-900 dark:text-white font-bold">{skip + 1}–{Math.min(skip + pageSize, totalCount)}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalCount}</span> entries
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Link>
              )}
              <span className="px-3 py-2 bg-[#0D6E6E]/10 border border-[#0D6E6E]/20 rounded-xl text-xs font-bold text-[#0D6E6E]">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
