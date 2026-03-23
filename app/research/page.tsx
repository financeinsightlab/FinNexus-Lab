// FILE: app/research/page.tsx
import type { Metadata } from 'next';
import AlgoliaSearch from '@/components/research/AlgoliaSearch';

export const metadata: Metadata = {
  title: 'Research | FinNexus Lab',
  description:
    'Search and explore in-depth research reports and strategic insights across India’s market sectors.',
};

export default function ResearchPage() {
  return (
    <>
      <header className="bg-brand-navy py-20">
        <div className="wrap">
          <p className="section-label text-teal-300 mb-5">Research Library</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            In-Depth Analysis
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Comprehensive research reports on Indian market sectors, with detailed analysis,
            data-driven insights, and strategic recommendations.
          </p>
        </div>
      </header>

      <AlgoliaSearch />
    </>
  );
}