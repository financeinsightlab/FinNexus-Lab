// FILE: components/insights/InsightsClient.tsx
'use client';

import { useState, useMemo } from 'react';
import InsightCard from '@/components/insights/InsightCard';
import type { InsightPost } from '@/types';
import HeroBackground from '@/components/ui/HeroBackground';

interface InsightsClientProps {
  posts: InsightPost[];
}

const CATS = ['All', 'Sector Analysis', 'Strategy Note', 'Company Note', 'Market Update'];

export default function InsightsClient({ posts }: InsightsClientProps) {
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => {
    return cat === 'All' ? posts : posts.filter(p => p.category === cat);
  }, [cat, posts]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-brand-navy via-brand-slate to-teal-900 py-20">
        <HeroBackground />
        <div className="wrap relative z-10">
          <p className="section-label text-teal-300 mb-5">Strategic Insights</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Analytical Notes
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Short, opinionated analysis. Each note makes a specific argument — not a news summary.
          </p>
        </div>
      </header>

      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="wrap py-4">
          <div className="flex flex-wrap gap-2">
            {CATS.map((category) => (
              <button
                key={category}
                onClick={() => setCat(category)}
                className={`pill ${cat === category ? 'pill-on' : 'pill-off'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="wrap py-14">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">No insights found</h2>
            <p className="text-brand-slate mb-8 max-w-md mx-auto">
              Try selecting a different category to see more insights.
            </p>
            <button
              onClick={() => setCat('All')}
              className="btn btn-primary"
            >
              Show All Insights
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <InsightCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}