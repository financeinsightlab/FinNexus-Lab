'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HeroBackground from '@/components/ui/HeroBackground';
// Simplified approach w/ direct routing to calculators

export interface Tool {
  id: number;
  icon: string;
  title: string;
  category: string;
  tool: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  gated: boolean;
  desc: string;
  includes: string[];
  slug: string;
}

const TOOLS: Tool[] = [
  {
    id: 1,
    icon: '📊',
    title: 'DCF Valuation Model — Comprehensive',
    category: 'Valuation',
    tool: 'Excel',
    difficulty: 'Intermediate',
    gated: true,
    desc: 'Full DCF model with 3 scenarios, sensitivity analysis, and WACC calculator.',
    includes: ['Revenue projections (5-year)', 'WACC calculator', 'Sensitivity tables', '3 scenarios'],
    slug: 'dcf-valuation-model'
  },
  {
    id: 2,
    icon: '🚀',
    title: 'Startup 3-Statement Financial Model',
    category: 'Financial Model',
    tool: 'Excel',
    difficulty: 'Intermediate',
    gated: true,
    desc: 'Complete financial model for early-stage companies.',
    includes: ['P&L · Balance Sheet · Cash Flow', 'Headcount planner', 'Runway calculator', 'Unit economics'],
    slug: '3-statement-model'
  },
  {
    id: 3,
    icon: '🗺️',
    title: 'Market Sizing Framework (TAM/SAM/SOM)',
    category: 'Market Analysis',
    tool: 'Excel + PDF',
    difficulty: 'Beginner',
    gated: false,
    desc: 'Templates for market size estimation and analysis.',
    includes: ['Top-down template', 'Bottom-up template', 'India market data', 'Worked examples'],
    slug: 'market-sizing-framework'
  },
  {
    id: 4,
    icon: '⚡',
    title: 'Q-Commerce Unit Economics Model',
    category: 'Sector Model',
    tool: 'Excel',
    difficulty: 'Advanced',
    gated: true,
    desc: 'Detailed unit economics for quick commerce businesses.',
    includes: ['Dark store P&L', 'Order volume scenarios', 'CM% waterfall chart', 'Breakeven calculator'],
    slug: 'q-commerce-model'
  },
  {
    id: 5,
    icon: '🏛️',
    title: "Porter's Five Forces Template",
    category: 'Strategy',
    tool: 'PowerPoint',
    difficulty: 'Beginner',
    gated: false,
    desc: 'Strategic analysis framework for competitive positioning.',
    includes: ['5-Forces visual template', 'Rating framework', 'India sector examples', 'Strategy notes'],
    slug: 'porters-five-forces'
  },
  {
    id: 6,
    icon: '📐',
    title: 'Comparable Company Analysis (CCA)',
    category: 'Valuation',
    tool: 'Excel',
    difficulty: 'Intermediate',
    gated: true,
    desc: 'Peer company comparison and valuation multiples.',
    includes: ['Peer comp table', 'Multiple normalisation', 'Sector medians', 'Visual benchmarks'],
    slug: 'cca-valuation'
  },
  {
    id: 7,
    icon: '💻',
    title: 'SaaS LTV/CAC & Cohort Analysis',
    category: 'SaaS & Tech',
    tool: 'Excel',
    difficulty: 'Advanced',
    gated: true,
    desc: 'Comprehensive SaaS unit economics with cohort retention mapping.',
    includes: ['LTV:CAC ratio calculator', 'Subscription cohort heatmap', 'Churn velocity model', 'Payback period'],
    slug: 'saas-ltv-cac-model'
  },
  {
    id: 8,
    icon: '🤖',
    title: 'Enterprise AI ROI Calculator',
    category: 'AI Strategy',
    tool: 'Excel',
    difficulty: 'Intermediate',
    gated: false,
    desc: 'Framework to calculate the ROI of deploying AI agents vs human capital.',
    includes: ['Cost-displacement model', 'Productivity multiplier', 'Implementation Capex amortisation', 'Breakeven timeline'],
    slug: 'ai-agent-roi-calculator'
  },
  {
    id: 11,
    icon: '🧠',
    title: 'Autonomous Workforce Restructuring Simulator',
    category: 'AI Strategy',
    tool: 'Web App',
    difficulty: 'Advanced',
    gated: true,
    desc: 'Next-generation financial model simulating the EBITDA and valuation impact of replacing human departments with autonomous agent swarms.',
    includes: ['Swarm Arbitrage calculation', 'Valuation re-rating engine', 'Restructuring cost logic', 'Live margin mapping'],
    slug: 'autonomous-workforce'
  },
  {
    id: 9,
    icon: '🪙',
    title: 'Web3 Tokenomics & Vesting Model',
    category: 'Web3',
    tool: 'Excel',
    difficulty: 'Advanced',
    gated: true,
    desc: 'Token distribution, vesting schedule modeling, and circulating supply forecasting.',
    includes: ['Vesting cliff schedules', 'Inflation rate modeling', 'FDV vs Market Cap tracker', 'Allocation pie charts'],
    slug: 'crypto-tokenomics-model'
  },
  {
    id: 10,
    icon: '🎯',
    title: 'B2B Enterprise Marketing ROI & Pipeline',
    category: 'Growth & Marketing',
    tool: 'Excel',
    difficulty: 'Advanced',
    gated: true,
    desc: 'Full-funnel attribution and ROI tracking for enterprise B2B sales cycles.',
    includes: ['Lead-to-Close pipeline tracker', 'CAC by acquisition channel', 'Marketing spend ROI calculator', 'Sales quota modelling'],
    slug: 'b2b-enterprise-marketing-roi'
  }
];

const CATS = ['All', 'Valuation', 'Financial Model', 'Market Analysis', 'Sector Model', 'Strategy', 'SaaS & Tech', 'AI Strategy', 'Web3', 'Growth & Marketing'];
const DIFF_CLS = {
  Beginner: 'tag tag-green',
  Intermediate: 'tag tag-gold',
  Advanced: 'tag tag-navy'
};

export default function ToolsPage() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [modal, setModal] = useState<Tool | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    return cat === 'All' ? TOOLS : TOOLS.filter(tool => tool.category === cat);
  }, [cat]);

  const handleDownload = (tool: Tool) => {
    router.push(`/tools/${tool.slug}`);
  };

  const freeTools = TOOLS.filter(t => !t.gated).length;
  const gatedTools = TOOLS.filter(t => t.gated).length;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-brand-navy to-teal-800 py-20">
        <HeroBackground />
        <div className="wrap relative z-10">
          <p className="section-label text-teal-300 mb-5">Financial Tools</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Tools &amp; Models
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            Professional-grade financial models, templates, and frameworks for investment analysis and strategic planning.
          </p>

          {/* Stats Row */}
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
              {freeTools} Free Tools
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
              {gatedTools} Premium Tools
            </span>
          </div>
        </div>
      </header>

      {/* Sticky Category Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="wrap py-4">
          <div className="flex flex-wrap gap-2">
            {CATS.map((category) => (
              <button
                key={category}
                id={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setCat(category)}
                className={`pill ${cat === category ? 'pill-on' : 'pill-off'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <main className="wrap py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <div key={tool.id} className="card p-6 flex flex-col">
              {/* Top Section */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{tool.icon}</span>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tool.gated ? 'bg-gold-100 text-gold-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {tool.gated ? 'Premium' : 'Free'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_CLS[tool.difficulty]}`}>
                    {tool.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-brand-navy mb-2">{tool.title}</h3>
              <p className="text-sm text-brand-slate mb-4 flex-1">{tool.desc}</p>

              {/* Includes */}
              <div className="mb-4">
                <p className="text-xs font-medium text-brand-navy mb-2">Includes:</p>
                <ul className="text-xs text-brand-slate space-y-1">
                  {tool.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">{tool.tool}</span>
                  {done.has(tool.id) ? (
                    <span className="text-sm font-medium text-green-600">✓ Link Sent!</span>
                  ) : (
                    <button
                      onClick={() => handleDownload(tool)}
                      className="text-sm font-medium text-brand-teal hover:text-brand-navy transition-colors"
                    >
                      Open Calculator →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>


    </div>
  );
}