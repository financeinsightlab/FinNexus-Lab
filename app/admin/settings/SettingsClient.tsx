"use client"

import { useState, useCallback } from "react"
import {
  Star, BarChart2, Settings2, Layout,
  Check, Loader2, GripVertical, Plus, Trash2,
  Eye, EyeOff, Save, ChevronUp, ChevronDown, RefreshCw,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────
type Post = {
  id: string; title: string; slug: string; type: string
  excerpt: string | null; publishedAt: string | null
}

type Item = {
  id: string; section: string; title: string; subtitle: string | null
  description: string | null; icon: string | null; link: string | null
  color: string | null; order: number; enabled: boolean
  updatedAt: string; createdAt: string
}

type SectionConfig = {
  id: string; section: string; enabled: boolean; order: number
}

type Props = {
  allPosts: Post[]
  featuredResearchIds: string[]
  featuredInsightIds: string[]
  heroStats: Item[]
  trackers: Item[]
  pillars: Item[]
  sectionConfigs: SectionConfig[]
}

const TABS = [
  { id: "featured", label: "Featured Posts", icon: Star },
  { id: "hero", label: "Hero Stats", icon: BarChart2 },
  { id: "trackers", label: "Sector Trackers", icon: Layout },
  { id: "sections", label: "Section Visibility", icon: Settings2 },
] as const

type TabId = (typeof TABS)[number]["id"]

// ─── Toast ────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
      type === "success"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        : "bg-red-500/10 border-red-500/30 text-red-400"
    }`}>
      {type === "success" ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
      {message}
    </div>
  )
}

// ─── Featured Posts Tab ───────────────────────────────────────────────────
function FeaturedPostsTab({ allPosts, featuredResearchIds, featuredInsightIds, onSave }: {
  allPosts: Post[]
  featuredResearchIds: string[]
  featuredInsightIds: string[]
  onSave: (section: string, ids: string[]) => Promise<void>
}) {
  const researchPosts = allPosts.filter(p => p.type === "RESEARCH")
  const insightPosts = allPosts.filter(p => p.type === "INSIGHT")

  const [selectedResearch, setSelectedResearch] = useState<string[]>(featuredResearchIds)
  const [selectedInsights, setSelectedInsights] = useState<string[]>(featuredInsightIds)
  const [saving, setSaving] = useState<string | null>(null)

  const toggle = (list: string[], setList: (v: string[]) => void, id: string, max: number) => {
    if (list.includes(id)) {
      setList(list.filter(x => x !== id))
    } else if (list.length < max) {
      setList([...list, id])
    }
  }

  const moveUp = (list: string[], setList: (v: string[]) => void, id: string) => {
    const idx = list.indexOf(id)
    if (idx <= 0) return
    const next = [...list]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setList(next)
  }

  const moveDown = (list: string[], setList: (v: string[]) => void, id: string) => {
    const idx = list.indexOf(id)
    if (idx < 0 || idx >= list.length - 1) return
    const next = [...list]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setList(next)
  }

  const save = async (section: string, ids: string[]) => {
    setSaving(section)
    await onSave(section, ids)
    setSaving(null)
  }

  const PostPicker = ({
    label, description, posts, selected, setSelected, section, max
  }: {
    label: string; description: string; posts: Post[]
    selected: string[]; setSelected: (v: string[]) => void
    section: string; max: number
  }) => (
    <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white">{label}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
          <p className="text-[10px] text-[#0D6E6E] mt-1">{selected.length}/{max} selected</p>
        </div>
        <button
          onClick={() => save(section, selected)}
          disabled={saving === section}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D6E6E] text-white text-xs font-bold rounded-xl hover:bg-[#0B5E5E] transition-all disabled:opacity-50"
        >
          {saving === section ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>

      {/* Order preview */}
      {selected.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Display Order</p>
          {selected.map((id, idx) => {
            const post = posts.find(p => p.id === id)
            if (!post) return null
            return (
              <div key={id} className="flex items-center gap-3 bg-[#0D6E6E]/10 border border-[#0D6E6E]/20 px-3 py-2 rounded-xl">
                <span className="text-[10px] font-bold text-[#0D6E6E] w-4">{idx + 1}</span>
                <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs text-white flex-1 truncate">{post.title}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(selected, setSelected, id)} className="p-1 hover:text-white text-slate-500 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveDown(selected, setSelected, id)} className="p-1 hover:text-white text-slate-500 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setSelected(selected.filter(x => x !== id))} className="p-1 hover:text-red-400 text-slate-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Post list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {posts.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">No published {label.toLowerCase()} found in the database.<br />Import MDX files first.</p>
        ) : posts.map(post => {
          const isSelected = selected.includes(post.id)
          return (
            <button
              key={post.id}
              onClick={() => toggle(selected, setSelected, post.id, max)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? "bg-[#0D6E6E]/10 border-[#0D6E6E]/30 text-white"
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              } ${!isSelected && selected.length >= max ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-[#0D6E6E] border-[#0D6E6E]" : "border-slate-600"}`}>
                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-snug">{post.title}</p>
                {post.excerpt && <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{post.excerpt}</p>}
              </div>
              {isSelected && (
                <span className="text-[9px] font-bold text-[#0D6E6E] bg-[#0D6E6E]/10 px-1.5 py-0.5 rounded-md">
                  #{selected.indexOf(post.id) + 1}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-300">
          Select up to <strong>3 posts</strong> per section to feature on the homepage. Use the arrows to reorder them. Changes apply immediately when you save.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostPicker
          label="Featured Research"
          description="Shown in the Research section on homepage"
          posts={researchPosts}
          selected={selectedResearch}
          setSelected={setSelectedResearch}
          section="RESEARCH"
          max={3}
        />
        <PostPicker
          label="Featured Insights"
          description="Shown in the Insights section on homepage"
          posts={insightPosts}
          selected={selectedInsights}
          setSelected={setSelectedInsights}
          section="INSIGHTS"
          max={3}
        />
      </div>
    </div>
  )
}

// ─── Hero Stats Tab ────────────────────────────────────────────────────────
function HeroStatsTab({ initialStats, onSave }: {
  initialStats: Item[]
  onSave: (section: string, items: any[]) => Promise<void>
}) {
  const [stats, setStats] = useState(initialStats.map(s => ({ ...s })))
  const [saving, setSaving] = useState(false)

  const update = (id: string, field: keyof Item, value: string) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const addStat = () => {
    const newStat: Item = {
      id: `hs-new-${Date.now()}`, section: "HERO_STATS",
      title: "New Stat", subtitle: "Label", description: null,
      icon: null, link: null, color: null, order: stats.length,
      enabled: true, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    }
    setStats(prev => [...prev, newStat])
  }

  const remove = (id: string) => setStats(prev => prev.filter(s => s.id !== id))

  const save = async () => {
    setSaving(true)
    await onSave("HERO_STATS", stats)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Hero Stat Cards</h3>
            <p className="text-xs text-slate-500 mt-1">The 4 numbers shown at the bottom of the hero section</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addStat} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Stat
            </button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0D6E6E] text-white text-xs font-bold rounded-xl hover:bg-[#0B5E5E] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.filter(s => s.enabled).map(stat => (
            <div key={stat.id + '-preview'} className="bg-[#0D0F14] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.title}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={stat.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <span className="text-xs text-slate-500 w-4 font-bold">{idx + 1}</span>
              <input
                value={stat.title}
                onChange={e => update(stat.id, "title", e.target.value)}
                className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none border-b border-transparent focus:border-[#0D6E6E] transition-all"
                placeholder="Value (e.g. 10+)"
              />
              <input
                value={stat.subtitle ?? ""}
                onChange={e => update(stat.id, "subtitle", e.target.value)}
                className="flex-1 bg-transparent text-slate-400 text-sm focus:outline-none border-b border-transparent focus:border-[#0D6E6E] transition-all"
                placeholder="Label (e.g. Reports)"
              />
              <button onClick={() => remove(stat.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Trackers Tab ─────────────────────────────────────────────────────────
function TrackersTab({ initialTrackers, onSave }: {
  initialTrackers: Item[]
  onSave: (section: string, items: any[]) => Promise<void>
}) {
  const [trackers, setTrackers] = useState(initialTrackers.map(t => ({ ...t })))
  const [saving, setSaving] = useState(false)

  const update = (id: string, field: keyof Item, value: string | boolean) => {
    setTrackers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const addTracker = () => {
    setTrackers(prev => [...prev, {
      id: `tr-new-${Date.now()}`, section: "TRACKERS",
      title: "New Sector", subtitle: "Key Metric: N/A", description: null,
      icon: "📊", link: "/tracker", color: null, order: prev.length,
      enabled: true, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    }])
  }

  const remove = (id: string) => setTrackers(prev => prev.filter(t => t.id !== id))

  const save = async () => {
    setSaving(true)
    await onSave("TRACKERS", trackers)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Sector Intelligence Trackers</h3>
            <p className="text-xs text-slate-500 mt-1">The tracker cards shown on the homepage</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addTracker} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Tracker
            </button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0D6E6E] text-white text-xs font-bold rounded-xl hover:bg-[#0B5E5E] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {trackers.map((tracker, idx) => (
            <div key={tracker.id} className="grid grid-cols-12 gap-3 items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="col-span-1 text-slate-600"><GripVertical className="w-4 h-4" /></div>
              <div className="col-span-1">
                <input
                  value={tracker.icon ?? ""}
                  onChange={e => update(tracker.id, "icon", e.target.value)}
                  className="w-full bg-transparent text-xl text-center focus:outline-none"
                  placeholder="🔵"
                />
              </div>
              <div className="col-span-3">
                <input
                  value={tracker.title}
                  onChange={e => update(tracker.id, "title", e.target.value)}
                  className="w-full bg-transparent text-white text-sm font-bold focus:outline-none border-b border-transparent focus:border-[#0D6E6E] transition-all"
                  placeholder="Sector name"
                />
              </div>
              <div className="col-span-4">
                <input
                  value={tracker.subtitle ?? ""}
                  onChange={e => update(tracker.id, "subtitle", e.target.value)}
                  className="w-full bg-transparent text-slate-400 text-xs focus:outline-none border-b border-transparent focus:border-[#0D6E6E] transition-all"
                  placeholder="Key metric: e.g. GMV Growth: 42% YoY"
                />
              </div>
              <div className="col-span-2">
                <input
                  value={tracker.link ?? ""}
                  onChange={e => update(tracker.id, "link", e.target.value)}
                  className="w-full bg-transparent text-[#0D6E6E] text-xs font-mono focus:outline-none border-b border-transparent focus:border-[#0D6E6E] transition-all"
                  placeholder="/tracker/slug"
                />
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <button
                  onClick={() => update(tracker.id, "enabled", !tracker.enabled)}
                  className={`p-1.5 rounded-lg transition-all ${tracker.enabled ? "text-emerald-400 bg-emerald-500/10" : "text-slate-600 bg-white/5"}`}
                >
                  {tracker.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => remove(tracker.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Visibility Tab ────────────────────────────────────────────────
const SECTIONS = [
  { key: "RESEARCH", label: "Featured Research Section", description: "Shows curated research posts" },
  { key: "INSIGHTS", label: "Latest Insights Section", description: "Shows curated insight posts" },
  { key: "TRACKERS", label: "Sector Trackers Section", description: "Shows sector intelligence cards" },
  { key: "PILLARS", label: "Platform Pillars Section", description: "Shows what the platform does" },
  { key: "PODCAST", label: "Podcast Section", description: "Shows the latest podcast episode" },
  { key: "HERO_STATS", label: "Hero Stats", description: "Shows stat numbers in the hero" },
]

function SectionsTab({ sectionConfigs, onToggle }: {
  sectionConfigs: SectionConfig[]
  onToggle: (section: string, enabled: boolean) => Promise<void>
}) {
  const [configs, setConfigs] = useState<Record<string, boolean>>(
    Object.fromEntries(
      SECTIONS.map(s => {
        const cfg = sectionConfigs.find(c => c.section === s.key)
        return [s.key, cfg ? cfg.enabled : true]
      })
    )
  )
  const [saving, setSaving] = useState<string | null>(null)

  const toggle = async (section: string) => {
    const newEnabled = !configs[section]
    setConfigs(prev => ({ ...prev, [section]: newEnabled }))
    setSaving(section)
    await onToggle(section, newEnabled)
    setSaving(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Settings2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-300">
          Toggle sections on/off to control what appears on your homepage. Changes are applied immediately.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(section => {
          const enabled = configs[section.key] ?? true
          const isSaving = saving === section.key
          return (
            <div key={section.key} className="bg-[#1A1F2E] border border-[#2D3748] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xl">
              <div>
                <p className="text-sm font-bold text-white">{section.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
              </div>
              <button
                onClick={() => toggle(section.key)}
                disabled={isSaving}
                className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 ${enabled ? "bg-[#0D6E6E]" : "bg-white/10"}`}
              >
                {isSaving
                  ? <Loader2 className="w-3.5 h-3.5 absolute inset-0 m-auto animate-spin text-white" />
                  : <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? "left-6" : "left-0.5"}`} />
                }
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Settings Client ──────────────────────────────────────────────────
export default function SettingsClient(props: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("featured")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const saveFeatured = useCallback(async (section: string, postIds: string[]) => {
    const res = await fetch("/api/admin/settings/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, postIds }),
    })
    if (res.ok) showToast(`✓ ${section === "RESEARCH" ? "Research" : "Insights"} featured posts saved!`, "success")
    else showToast("Failed to save. Please try again.", "error")
  }, [])

  const saveItems = useCallback(async (section: string, items: any[]) => {
    const res = await fetch("/api/admin/settings/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, items }),
    })
    if (res.ok) showToast("✓ Changes saved to homepage!", "success")
    else showToast("Failed to save. Please try again.", "error")
  }, [])

  const toggleSection = useCallback(async (section: string, enabled: boolean) => {
    const res = await fetch("/api/admin/settings/section-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, enabled }),
    })
    if (res.ok) showToast(`✓ Section ${enabled ? "enabled" : "disabled"}`, "success")
    else showToast("Failed to update section.", "error")
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="section-label">Platform Control</span>
        <h1 className="text-4xl font-extrabold text-white mt-2 leading-tight">Settings</h1>
        <p className="text-slate-400 mt-2 max-w-xl">
          Control your homepage content, featured posts, stats, and section visibility.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#1A1F2E] p-2 rounded-2xl border border-[#2D3748] w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-[#0D6E6E] text-white shadow-lg shadow-[#0D6E6E]/20"
                : "text-slate-500 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "featured" && (
        <FeaturedPostsTab
          allPosts={props.allPosts}
          featuredResearchIds={props.featuredResearchIds}
          featuredInsightIds={props.featuredInsightIds}
          onSave={saveFeatured}
        />
      )}
      {activeTab === "hero" && (
        <HeroStatsTab
          initialStats={props.heroStats}
          onSave={saveItems}
        />
      )}
      {activeTab === "trackers" && (
        <TrackersTab
          initialTrackers={props.trackers}
          onSave={saveItems}
        />
      )}
      {activeTab === "sections" && (
        <SectionsTab
          sectionConfigs={props.sectionConfigs}
          onToggle={toggleSection}
        />
      )}

      {toast && <Toast {...toast} />}
    </div>
  )
}
