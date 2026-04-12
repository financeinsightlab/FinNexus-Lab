import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCaseStudies } from '@/lib/content';
import HeroBackground from '@/components/ui/HeroBackground';
import Tag from '@/components/ui/Tag';
import CTAButton from '@/components/ui/CTAButton';
import { prisma } from "@/lib/prisma";
import React from "react";

export const metadata: Metadata = {
  title: 'Case Studies | FinNexus Lab',
  description: 'Analytical work in practice: real‑world consulting engagements across startups, PE firms, and platform builders.',
};

export default async function CaseStudiesPage() {
  // 1. Legacy
  const legacyStudies = getAllCaseStudies();

  // 2. New CMS
  let dbStudies: any[] = [];
  try {
    dbStudies = await (prisma as any).post.findMany({
      where: { type: 'CASE_STUDY', published: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("Case Studies DB fetch failed:", e);
  }

  // 3. Merge
  const allStudies = [
    ...dbStudies.map(s => ({
      slug: s.slug,
      title: s.title,
      outcome: s.excerpt || 'New corporate transformation project.',
      engagementType: 'Strategic Advisory',
      clientType: 'Enterprise',
      isNewCMS: true
    })),
    ...legacyStudies
  ];

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <section className="relative overflow-hidden bg-brand-navy py-20">
        <HeroBackground />
        <div className="wrap max-w-6xl relative z-10">
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
        {allStudies.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No case studies yet</h3>
            <p className="text-gray-500 mb-8">Check back soon for detailed case studies.</p>
            <CTAButton href="/contact" variant="primary">
              Request a Case Study
            </CTAButton>
          </div>
        ) : (
          <div className="space-y-6">
            {allStudies.map((study: any) => (
              <div
                key={study.slug}
                className="card p-8 mb-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow relative"
              >
                {study.isNewCMS && (
                  <span className="absolute top-4 right-8 px-2 py-0.5 bg-teal-500/10 text-teal-600 text-[10px] font-bold rounded uppercase tracking-wider">
                    New CMS
                  </span>
                )}
                
                <Tag variant="teal" text={study.engagementType} className="mb-4" />
                
                <h2 className="text-2xl font-bold text-brand-navy mb-3">
                  {study.title}
                </h2>
                
                <div className="text-sm text-gray-500 mb-4">
                  Client: <span className="font-medium">{study.clientType}</span>
                </div>
                
                <p className="text-gray-700 mb-6 line-clamp-2">
                  {study.outcome}
                </p>
                
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-teal font-medium transition-colors"
                >
                  Read Case Study →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

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