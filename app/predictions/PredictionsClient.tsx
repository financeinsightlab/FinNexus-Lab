"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import HeroBackground from '@/components/ui/HeroBackground'
import type { PredictionWithAuthor } from '@/lib/predictions'
import { createCommunityPrediction } from '@/actions/community-predictions'
import { VerificationBadge } from '@/components/ui/VerificationBadge'

interface PredictionsClientProps {
  predictions: PredictionWithAuthor[]
  sectors: string[]
  stats: any
  isLoggedIn: boolean
  isAdmin: boolean
}

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed',  bg: 'bg-green-500/10',  text: 'text-green-400', border: 'border-green-500/20', dot: '🟢' },
  INCORRECT: { label: 'Incorrect',  bg: 'bg-red-500/10',    text: 'text-red-400',   border: 'border-red-500/20', dot: '🔴' },
  PARTIAL:   { label: 'Partial',    bg: 'bg-amber-500/10',  text: 'text-amber-400', border: 'border-amber-500/20', dot: '🟡' },
  PENDING:   { label: 'Pending',    bg: 'bg-yellow-500/10', text: 'text-yellow-400',border: 'border-yellow-500/20', dot: '⏳' },
} as const

function slugify(str: string) {
  return (str ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function PredictionsClient({ predictions, sectors, stats, isLoggedIn, isAdmin }: PredictionsClientProps) {
  const [activeSector, setActiveSector] = useState('All')
  const [activeStatus, setActiveStatus] = useState('All')

  const officialPredictions = useMemo(() => predictions.filter(p => ["ADMIN", "ANALYST"].includes(p.author.role)), [predictions])
  const communityPredictions = useMemo(() => predictions.filter(p => !["ADMIN", "ANALYST"].includes(p.author.role)), [predictions])

  const filteredOfficial = useMemo(() => {
    return officialPredictions.filter((p) => {
      const sectorOk = activeSector === 'All' || p.sector === activeSector
      const statusOk = activeStatus === 'All' || p.status === activeStatus
      return sectorOk && statusOk
    })
  }, [officialPredictions, activeSector, activeStatus])

  const pct = (n: number) => stats.total === 0 ? '0' : Math.round((n / stats.total) * 100).toString()
  const now = Date.now()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D13]">
      {/* ─── Header Stats ─── */}
      <section className="relative overflow-hidden bg-brand-navy border-b border-white/5 py-14">
        <HeroBackground />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
              Intelligence Tracking
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-3">
              🎯 Predictions Board
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every prediction tracked. Every outcome published. Full accountability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Total Predictions', value: stats.total, sub: 'all time', color: 'text-white' },
              { label: '% Confirmed',   value: `${pct(stats.confirmed)}%`,  sub: `${stats.confirmed} confirmed`,  color: 'text-green-400' },
              { label: '% Incorrect',   value: `${pct(stats.incorrect)}%`,  sub: `${stats.incorrect} incorrect`,  color: 'text-red-400'   },
              { label: '% Pending',     value: `${pct(stats.pending)}%`,    sub: `${stats.pending} open`,         color: 'text-yellow-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/5 p-5 text-center rounded-2xl backdrop-blur-sm">
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Filters ─── */}
      <section className="bg-[#0f1522] border-b border-white/5 py-6 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 flex-wrap">
            {['All', 'PENDING', 'CONFIRMED', 'INCORRECT', 'PARTIAL'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeStatus === s ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5'}`}
              >
                {s === 'All' ? 'All Status' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </button>
            ))}
          </div>
          <div className="h-4 border-l border-white/10 hidden md:block" />
          <div className="flex gap-2 flex-wrap">
            {['All', ...sectors].map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeSector === sec ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5'}`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: OFFICIAL PREDICTIONS */}
          <div className="lg:col-span-3 space-y-8">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
               🏛️ Official Forecasts <span className="text-sm font-medium text-slate-500 ml-2">({filteredOfficial.length})</span>
            </h2>
            
            {filteredOfficial.length === 0 ? (
              <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-lg font-medium text-slate-400">No official predictions match your filters.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredOfficial.map((p) => {
                  const cfg        = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
                  const resolveMs  = new Date(p.resolveDate).getTime()
                  const daysLeft   = Math.ceil((resolveMs - now) / 86_400_000)
                  const isPast     = daysLeft < 0
                  const authorSlug = slugify(p.author.name ?? 'unknown')

                  return (
                    <article key={p.id} className="bg-[#1A1F2E] border border-[#2D3748] rounded-2xl p-6 flex flex-col gap-4 shadow-xl hover:border-[#0D6E6E]/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <VerificationBadge role={p.author.role} customBadge={p.author.customBadge} />
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{p.sector}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.dot} {cfg.label}
                        </span>
                      </div>

                      <p className="text-slate-200 font-medium leading-relaxed italic flex-1">
                        &ldquo;{p.claim}&rdquo;
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <Link href={`/authors/${authorSlug}`} className="font-bold text-teal-400 hover:text-teal-300">
                            {p.author.name}
                          </Link>
                        </div>
                        <span className={isPast ? 'text-red-400 font-mono font-bold' : 'text-slate-400 font-mono'}>
                          {isPast ? `Resolved ${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
                        </span>
                      </div>
                      
                      {p.resolutionNote && (
                        <div className="mt-2 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl">
                          <p className="text-xs text-yellow-500/80">📝 {p.resolutionNote}</p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: LIVE COMMUNITY FEED */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
               👥 Live Community Feed
            </h2>

            {/* Input Form */}
            {isLoggedIn ? (
              <form action={createCommunityPrediction} className="bg-[#1A1F2E] p-4 rounded-2xl border border-teal-500/30 shadow-[0_0_15px_rgba(13,110,110,0.15)] space-y-3">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Publish a Prediction</p>
                <textarea
                  name="claim"
                  required
                  placeholder="Drop a live prediction..."
                  rows={2}
                  className="w-full bg-[#0f1c2d] border border-[#2D3748] rounded-xl px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
                />
                <button type="submit" className="w-full bg-teal-500 text-white font-bold py-2 rounded-xl text-xs hover:bg-teal-400 transition-colors">
                  Send to Feed →
                </button>
              </form>
            ) : (
              <div className="bg-[#1A1F2E] p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-xs text-slate-400">Log in to post directly to the live prediction feed.</p>
              </div>
            )}

            {/* Community Feed Scrolling Container */}
            <div className="relative h-[800px] overflow-hidden bg-[#1A1F2E]/50 rounded-2xl border border-white/5 py-4 shrink-0">
              {/* Fade out edges */}
              <div className="absolute top-0 w-full h-10 bg-gradient-to-b from-[#0B0D13] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-[#0B0D13] to-transparent z-10 pointer-events-none" />
              
              <div className="flex flex-col gap-4 overflow-y-auto h-full px-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Scrollable List without duplicates */}
                {communityPredictions.map((p) => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0 relative group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-white text-xs">{p.author.name}</span>
                       <VerificationBadge role={p.author.role} customBadge={p.author.customBadge} />
                    </div>
                    <p className="text-sm text-slate-300 italic mb-2">"{p.claim}"</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                       <span>{new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       <span className="text-teal-400">{p.status}</span>
                    </div>
                    
                    {/* Admin Delete Action for live feed */}
                    {isAdmin && (
                       <button
                         onClick={async () => {
                           if (!confirm("Delete this community prediction?")) return;
                           const formData = new FormData();
                           formData.append("id", p.id);
                           const { deletePredictionAction } = await import('@/app/admin/predictions/actions');
                           await deletePredictionAction(formData);
                         }}
                         className="absolute top-2 right-2 text-xs font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         Delete
                       </button>
                    )}
                  </div>
                ))}
                
                {communityPredictions.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-slate-500 text-sm">No community predictions yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
