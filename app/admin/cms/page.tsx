import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ArticleType, Post } from "@prisma/client"
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Eye,
  ExternalLink,
  FileText,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import React from "react"
import ActionButtons from "./ActionButtons"

type PostWithAuthor = Post & {
  author: {
    name: string | null
  }
}

export default async function CMSDashboard({
  searchParams,
}: {
  searchParams: {
    search?: string
    type?: string
    status?: string
  }
}) {
  const session = await auth()

  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  const type = searchParams.type as ArticleType | undefined
  const status = searchParams.status

  // Fetch posts with error handling
  let posts: PostWithAuthor[] = []
  try {
     const postsData = await prisma.post.findMany({
      where: {
        AND: [
          type ? { type } : {},
          status === "published" ? { published: true } : status === "draft" ? { published: false } : {},
          searchParams.search ? {
            OR: [
              { title: { contains: searchParams.search, mode: "insensitive" } },
              { excerpt: { contains: searchParams.search, mode: "insensitive" } },
            ]
          } : {}
        ]
      },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } }
    })
    posts = postsData
  } catch (e) {
    console.error("Prisma fetch failed:", e)
  }

  const categories = [
    { label: "All Categories", value: "" },
    { label: "Research", value: "RESEARCH" },
    { label: "Insights", value: "INSIGHT" },
    { label: "Case Studies", value: "CASE_STUDY" },
    { label: "Media", value: "MEDIA" },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="section-label">Library Management</span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Content Repository</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md">Maintain the integrity of your corporate intellectual property and technical documentation.</p>
        </div>
        <Link 
          href="/admin/cms/new" 
          className="btn-primary flex items-center justify-center gap-2 group shadow-xl shadow-teal-900/10"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create New Entry
        </Link>
      </div>

      {/* Filters & Search UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1A1F2E] p-4 md:p-6 rounded-3xl border border-[#2D3748] shadow-2xl">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0D6E6E] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by title or excerpt..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-[#0D6E6E]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none w-full bg-white/5 border border-white/10 rounded-2xl text-sm px-5 py-3 text-slate-300 outline-none focus:border-[#0D6E6E]/50 focus:bg-white/10 transition-all cursor-pointer"
            aria-label="Filter by category"
            title="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-[#1A1F2E]">{cat.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none w-full bg-white/5 border border-white/10 rounded-2xl text-sm px-5 py-3 text-slate-300 outline-none focus:border-[#0D6E6E]/50 focus:bg-white/10 transition-all cursor-pointer"
            aria-label="Filter by status"
            title="Filter by status"
          >
            <option value="" className="bg-[#1A1F2E]">All Status</option>
            <option value="published" className="bg-[#1A1F2E]">Published</option>
            <option value="draft" className="bg-[#1A1F2E]">Drafts</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#1A1F2E] rounded-3xl border border-[#2D3748] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Item Details</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Visibility</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Created</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="max-w-xs md:max-w-md">
                        <p className="text-sm font-bold text-white group-hover:text-[#0D6E6E] transition-colors line-clamp-1">{post.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 opacity-60 group-hover:opacity-100 transition-opacity uppercase">SLUG: {post.slug}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="tag tag-teal text-[9px]">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {post.published ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-xs font-bold uppercase tracking-wide">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-50" />
                          <span className="text-xs font-bold uppercase tracking-wide">Draft</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                        <Link 
                          href={`/${post.type.toLowerCase()}/${post.slug}`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                          title="View Live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/cms/edit/${post.id}`}
                          className="p-2 text-slate-500 hover:text-[#0D6E6E] bg-white/5 hover:bg-[#0D6E6E]/10 rounded-xl transition-all"
                          title="Edit Document"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <ActionButtons post={post} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-600 border border-white/5 shadow-inner">
                        <FileText className="w-10 h-10 opacity-20" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">No content found</h4>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">Your content repository is currently empty. Initiate your repository by creating a new corporate entry.</p>
                      </div>
                      <Link 
                        href="/admin/cms/new" 
                        className="btn-primary text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Initialize Entry
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
