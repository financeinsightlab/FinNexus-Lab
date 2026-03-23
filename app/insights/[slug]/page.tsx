// FILE: app/insights/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { formatDate, CATEGORY_VARIANT } from '@/lib/utils';
import { getInsightBySlug, getAllInsights } from '@/lib/content';
import InsightCard from '@/components/insights/InsightCard';

export async function generateStaticParams() {
  const insights = getAllInsights();
  return insights.map((i) => ({
    slug: i.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);

  if (!post) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: post.title,
    description: post.thesis,
  };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);

  if (!post) {
    notFound();
  }

  const tagVariant = CATEGORY_VARIANT[post.category] ?? 'teal';
  const related = getAllInsights()
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);

  return (
    <article className="pt-24 pb-24 bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate py-16 mb-12">
        <div className="absolute inset-0 bg-pattern opacity-80" />
        <div className="wrap max-w-5xl relative">
          <div className="text-xs text-gray-300 mb-5 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> /{' '}
            <Link href="/insights" className="hover:text-white transition-colors">Insights</Link> /{' '}
            <span>{post.category}</span>
          </div>

          <Tag text={post.category} variant={tagVariant} />

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-4 mb-6 max-w-4xl">
            {post.title}
          </h1>

          <blockquote className="border-l-4 border-brand-teal pl-5 py-3 bg-white/10 rounded-r-lg mb-7 max-w-4xl">
            <p className="italic text-white/90 text-lg">
              {post.thesis}
            </p>
          </blockquote>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Published</p>
                <p className="text-sm text-white font-medium mt-1">{formatDate(post.date)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Reading Time</p>
                <p className="text-sm text-white font-medium mt-1">{post.readingTime} min</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Author</p>
                <p className="text-sm text-white font-medium mt-1">{post.author}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="wrap max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
            <div className="prose prose-lg max-w-none report-body">
              {post.content ? (
                <MDXRemote source={post.content} />
              ) : (
                <p className="text-center italic text-gray-500">
                  Insight content not available.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="section-label mb-2">What This Means</p>
              <p className="text-sm text-brand-slate leading-relaxed">
                Use this note as a directional signal. Validate the thesis against your own distribution,
                cost, and competitive context before acting.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-teal/20 bg-teal-50 p-5">
              <p className="text-sm font-semibold text-brand-navy mb-2">Want tailored implications?</p>
              <p className="text-sm text-brand-slate mb-4">
                We can convert this thesis into an operator or investor memo for your specific exposure.
              </p>
              <Link href="/contact?service=Data Analytics Project" className="btn btn-primary w-full">
                Request Custom Note
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Insights */}
      {related.length > 0 && (
        <section className="mt-16 bg-brand-silver py-16 border-y border-gray-200">
          <div className="wrap max-w-5xl">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              More in {post.category}
            </h2>
            <p className="text-brand-slate mb-8">Continue with adjacent notes in the same analytical track.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <InsightCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="wrap max-w-5xl mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <Link
            href="/insights"
            className="text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors"
          >
            ← All Insights
          </Link>
          <Link
            href="/research"
            className="text-sm font-semibold text-brand-navy hover:text-brand-teal transition-colors"
          >
            Explore Full Research →
          </Link>
        </div>
      </div>
    </article>
  );
}