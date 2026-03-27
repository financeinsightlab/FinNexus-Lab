// FILE: app/case-studies/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import CTAButton from '@/components/ui/CTAButton';
import { formatDate } from '@/lib/utils';
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/content';

export async function generateStaticParams() {
  const caseStudies = getAllCaseStudies();
  return caseStudies.map((cs) => ({
    slug: cs.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${caseStudy.title} | Case Study`,
    description: caseStudy.outcome,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  // Section titles in order
  const sections = [
    'Challenge',
    'Approach', 
    'Analysis',
    'Findings',
    'Recommendation',
    'Outcome'
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-navy to-slate-900 py-16">
        <div className="wrap max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/case-studies" className="hover:text-white">Case Studies</Link>
            {' / '}
            <span className="text-brand-teal">{caseStudy.clientType}</span>
          </nav>

          {/* Engagement type tag */}
          <Tag variant="teal" text={caseStudy.engagementType} className="mb-6" />

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            {caseStudy.title}
          </h1>

          {/* Client & date */}
          <div className="flex flex-wrap gap-8 text-gray-300 mb-10">
            <div>
              <div className="text-sm text-gray-400">Client</div>
              <div className="font-medium">{caseStudy.clientType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Date</div>
              <div className="font-medium">{formatDate(caseStudy.date)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Outcome</div>
              <div className="font-medium max-w-md">{caseStudy.outcome}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="wrap max-w-6xl py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column: Sections */}
        <div className="lg:col-span-2">
          {sections.map((section, index) => (
            <section key={section} className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-teal text-white font-bold text-lg">
                  {index + 1}
                </div>
                <h2 className="text-2xl font-bold text-brand-navy">{section}</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                {caseStudy.content ? (
                  // We would need to extract section content from MDX
                  // For now, render the full content and rely on MDX structure
                  index === 0 && <MDXRemote source={caseStudy.content} />
                ) : (
                  <p className="text-gray-500">Content for {section} section not available.</p>
                )}
              </div>
            </section>
          ))}

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-teal"
            >
              ← All Case Studies
            </Link>
          </div>
        </div>

        {/* Right column: Sidebar */}
        <div className="space-y-8">
          {/* Tools Used card */}
          <div className="card p-6 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-brand-navy mb-4">Tools Used</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Market sizing models (Excel)</li>
              <li>• Discrete‑choice consumer surveys</li>
              <li>• Monte Carlo simulation (Python)</li>
              <li>• Competitive mapping (Power BI)</li>
              <li>• Unit‑economics financial model</li>
            </ul>
          </div>

          {/* Related case studies */}
          <div className="card p-6 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-brand-navy mb-4">Related Case Studies</h3>
            <ul className="space-y-4">
              {getAllCaseStudies()
                .filter((cs) => cs.slug !== caseStudy.slug)
                .slice(0, 2)
                .map((cs) => (
                  <li key={cs.slug}>
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="text-brand-navy hover:text-brand-teal font-medium"
                    >
                      {cs.title}
                    </Link>
                    <div className="text-sm text-gray-500">{cs.clientType}</div>
                  </li>
                ))}
            </ul>
          </div>

          {/* Work With Me CTA */}
          <div className="card p-6 bg-gradient-to-br from-brand-teal/10 to-brand-navy/10 rounded-xl">
            <h3 className="font-bold text-brand-navy mb-3">Work With Me</h3>
            <p className="text-gray-700 mb-6 text-sm">
              Have a similar challenge? Let's discuss how data‑driven analysis can help your business.
            </p>
            <CTAButton href="/services" variant="primary" className="w-full">
              Explore Services
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}