"use client"

import { useState, useEffect } from "react"
import Editor from "@/components/admin/Editor"
import { updatePost, PostFormData } from "@/actions/cms-actions"
import { ArticleType, Post } from "@prisma/client"
import { useRouter } from "next/navigation"
import {
  Save,
  Send,
  Settings,
  Layout,
  Image as ImageIcon,
  ChevronLeft,
  Search,
  Globe,
  Share2,
  BarChart,
  Eye,
  Type,
  Hash,
  X,
  Plus
} from "lucide-react"
import Link from "next/link"
import React from "react"

type ActiveTab = "general" | "seo" | "social" | "advanced"

interface EditClientProps {
  post: Post & {
    author: {
      name: string | null
    }
  }
}

export default function EditClient({ post }: EditClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("general")
  const [previewMode, setPreviewMode] = useState(false)

  // Core Data
  const [title, setTitle] = useState(post.title || "")
  const [slug, setSlug] = useState(post.slug || "")
  const [excerpt, setExcerpt] = useState(post.excerpt || "")
  const [content, setContent] = useState(post.content || "")
  const [type, setType] = useState<ArticleType>(post.type || "RESEARCH")
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage || "")
  const [published, setPublished] = useState(post.published || false)
  
  // CMS Elite Metadata (SEO)
  const [seoTitle, setSeoTitle] = useState(post.seoTitle || "")
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || "")
  const [focusKeywords, setFocusKeywords] = useState(post.focusKeywords || "")
  
  // CMS Elite Metadata (Social)
  const [ogTitle, setOgTitle] = useState(post.ogTitle || "")
  const [ogImage, setOgImage] = useState(post.ogImage || "")
  
  // Taxonomy
  const [tags, setTags] = useState<string[]>(post.tags || [])
  const [newTag, setNewTag] = useState("")

  const handleSave = async (isPublishing: boolean) => {
    setLoading(true)
    try {
      const data: PostFormData = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        type,
        published: isPublishing,
        featuredImage: featuredImage || null,
        seoTitle: seoTitle || null,
        metaDescription: metaDescription || null,
        focusKeywords: focusKeywords || null,
        ogTitle: ogTitle || null,
        ogImage: ogImage || null,
        tags,
        publishedAt: post.publishedAt || null
      }
      
      await updatePost(post.id, data)
      router.push("/admin/cms")
      router.refresh()
    } catch (error) {
      console.error("Failed to update post:", error)
      alert("Error updating post. Ensure database schema is updated.")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    setSlug(s)
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/cms" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Repository
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0D6E6E]" />
            <span className="text-sm font-bold text-white">Editing: {post.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="px-5 py-2.5 bg-[#0D6E6E] hover:bg-[#0D6E6E]/90 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#0D6E6E]/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {post.published ? "Update & Publish" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Main Editor Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="lg:col-span-2 flex flex-col border-r border-white/10">
          <div className="px-8 py-6 border-b border-white/10">
            <input
              type="text"
              placeholder="Document Title"
              className="w-full text-3xl font-extrabold bg-transparent text-white placeholder:text-slate-600 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Permalink</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="slug"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0D6E6E]/50"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <button
                    onClick={generateSlug}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Type</div>
                <select
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0D6E6E]/50 cursor-pointer"
                  value={type}
                  onChange={(e) => setType(e.target.value as ArticleType)}
                  aria-label="Post type"
                  title="Post type"
                >
                  <option value="RESEARCH">Research</option>
                  <option value="INSIGHT">Insight</option>
                  <option value="CASE_STUDY">Case Study</option>
                  <option value="MEDIA">Media</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Panel - Settings */}
        <div className="flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {(["general", "seo", "social", "advanced"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === tab ? "text-white border-b-2 border-[#0D6E6E]" : "text-slate-500 hover:text-slate-300"}`}
              >
                {tab === "general" && <Settings className="w-4 h-4 inline mr-2" />}
                {tab === "seo" && <Search className="w-4 h-4 inline mr-2" />}
                {tab === "social" && <Share2 className="w-4 h-4 inline mr-2" />}
                {tab === "advanced" && <BarChart className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "general" && (
              <>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Excerpt
                  </label>
                  <textarea
                    placeholder="Brief summary for listings..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50 resize-none"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Featured Image URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                    />
                    <button
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                      title="Select image"
                      aria-label="Select image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Publication Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPublished(true)}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${published ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${published ? "bg-emerald-500" : "bg-slate-600"}`} />
                        <span className="text-sm font-medium">Published</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setPublished(false)}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${!published ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${!published ? "bg-amber-500" : "bg-slate-600"}`} />
                        <span className="text-sm font-medium">Draft</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "seo" && (
              <>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    placeholder="Optimized for search engines..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Meta Description
                  </label>
                  <textarea
                    placeholder="Appears in search results..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50 resize-none"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Focus Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="primary, secondary, tertiary"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                    value={focusKeywords}
                    onChange={(e) => setFocusKeywords(e.target.value)}
                  />
                </div>
              </>
            )}

            {activeTab === "social" && (
              <>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Open Graph Title
                  </label>
                  <input
                    type="text"
                    placeholder="Appears when shared on social..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                  />
                </div>
              </>
            )}

            {activeTab === "advanced" && (
              <>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Taxonomy Tags
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#0D6E6E]/50"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
                      title="Add tag"
                      aria-label="Add tag"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5"
                      >
                        <Hash className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-white">{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title={`Remove tag ${tag}`}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}