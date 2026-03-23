// FILE: app/insights/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { formatDate, CATEGORY_VARIANT } from '@/lib/utils';
import { getInsightBySlug, getAllInsights } from '@/lib/content';

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

  return (
    <article className="pt-28 pb-24">
      {/* Header Section */}
      <header className="wrap max-w-prose mb-12">
        <Tag text={post.category} variant={tagVariant} />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4">
          {post.title}
        </h1>

        <blockquote className="border-l-4 border-brand-teal pl-5 py-3 bg-brand-silver rounded-r-lg mb-6">
          <p className="italic text-brand-slate text-lg">
            {post.thesis}
          </p>
        </blockquote>

        <div className="text-xs text-gray-400">
          {formatDate(post.date)} · {post.readingTime} min read · By {post.author}
        </div>
      </header>

      <hr className="border-gray-200 mb-12" />

      {/* Article Body */}
      <div className="wrap max-w-prose">
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

      {/* Back Link */}
      <div className="wrap max-w-prose mt-16">
        <Link
          href="/insights"
          className="text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors"
        >
          ← All Insights
        </Link>
      </div>
    </article>
  );
}