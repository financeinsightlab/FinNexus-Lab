// FILE: app/case-studies/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCaseStudies } from '@/lib/content';
import Tag from '@/components/ui/Tag';
import CTAButton from '@/components/ui/CTAButton';

export const metadata: Metadata = {
  title: 'Case Studies | FinNexus Lab',
  description: 'Analytical work in practice: real‑world consulting engagements across startups, PE firms, and platform builders.',
};

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <section className="bg-brand-navy py-20">
        <div className="wrap max-w-6xl">
          <div className="max-w-3xl">
            <span className="section-label text-brand-teal">Case Studies</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              Analytical Work in Practice
            </h1>
            <p className="text-xl text-gray-300">
              Real‑world consulting engagements across startups, PE firms, and platform builders.
              Each case study details the challenge, our approach, and the measurable outcome.
            </p>
          </div>
        </div>
      </section>

      {/* Case studies list */}
      <section className="wrap max-w-4xl py-16">
        {caseStudies.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No case studies yet</h3>
            <p className="text-gray-500 mb-8">Check back soon for detailed case studies.</p>
            <CTAButton href="/contact" variant="primary">
              Request a Case Study
            </CTAButton>
          </div>
        ) : (
          <div className="space-y-6">
            {caseStudies.map((study) => (
              <div
                key={study.slug}
                className="card p-8 mb-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
              >
                {/* Engagement type tag */}
                <Tag variant="teal" text={study.engagementType} className="mb-4" />
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-brand-navy mb-3">
                  {study.title}
                </h2>
                
                {/* Client type */}
                <div className="text-sm text-gray-500 mb-4">
                  Client: <span className="font-medium">{study.clientType}</span>
                </div>
                
                {/* Outcome summary */}
                <p className="text-gray-700 mb-6">
                  {study.outcome}
                </p>
                
                {/* Read link */}
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-teal font-medium"
                >
                  Read Case Study →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="wrap max-w-4xl py-16">
        <div className="bg-gradient-to-r from-brand-teal/10 to-brand-navy/10 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-brand-navy mb-4">
            Have a similar challenge?
          </h3>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Whether you're a startup entering a new market, a PE firm evaluating an investment,
            or a platform builder optimizing unit economics, we can help.
          </p>
          <CTAButton href="/services" variant="primary">
            Explore Our Services
          </CTAButton>
        </div>
      </section>
    </div>
  );
}