import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import ResearchCard from '@/components/research/ResearchCard';
import { formatDate } from '@/lib/utils';
import { getResearchBySlug, getAllResearch, getRelatedResearch } from '@/lib/content';

export async function generateStaticParams() {
  const research = getAllResearch();
  return research.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getResearchBySlug(slug);

  if (!post) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function ResearchReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getResearchBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedResearch(post.slug, post.sector, 3);
  const tags = post.tags ?? [];

  return (
    <article className="pt-16 bg-gradient-to-b from-slate-50 to-white">
      {/* Reading Progress Bar */}
      <div id="reading-progress" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('scroll', function() {
              const progress = document.getElementById('reading-progress');
              const scrollTop = window.scrollY;
              const docHeight = document.body.scrollHeight - window.innerHeight;
              const scrollPercent = (scrollTop / docHeight) * 100;
              progress.style.width = scrollPercent + '%';
            });
          `,
        }}
      />

      {/* Report Header */}
      <header className="relative overflow-hidden bg-brand-navy py-16 md:py-20">
        <div className="absolute inset-0 bg-pattern opacity-70" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="wrap relative">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-300 mb-6 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> /{' '}
            <Link href="/research" className="hover:text-white transition-colors">Research</Link> /{' '}
            <span>{post.sector}</span>
          </div>

          {/* Sector Tag */}
          <Tag text={post.sector} variant="teal" />

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
            {post.title}
          </h1>

          {/* Summary */}
          <p className="text-gray-200 text-lg leading-relaxed mb-8 max-w-3xl">
            {post.summary}
          </p>

          {/* Metadata Card */}
          <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Published</p>
                <p className="text-sm text-white font-medium mt-1">{formatDate(post.date)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Author</p>
                <p className="text-sm text-white font-medium mt-1">{post.author}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Length</p>
                <p className="text-sm text-white font-medium mt-1">{post.pageCount} pages</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-gray-200 font-mono border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Report Body */}
      <div className="wrap max-w-5xl mt-10 mb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
            <div className="prose prose-lg max-w-none report-body">
              {post.content ? (
                <MDXRemote source={post.content} />
              ) : (
                <p className="text-center italic text-gray-500">
                  Report content not available.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="section-label mb-2">Research Brief</p>
              <p className="text-sm text-brand-slate leading-relaxed">
                This report tracks market dynamics, operating metrics, and strategic positioning to help
                teams evaluate where opportunity and risk are shifting.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-teal/20 bg-teal-50 p-5">
              <p className="text-sm font-semibold text-brand-navy mb-2">Need a custom cut for your team?</p>
              <p className="text-sm text-brand-slate mb-4">
                Get a focused version with company-specific benchmarks and decision-ready recommendations.
              </p>
              <Link href="/contact" className="btn btn-primary w-full">
                Request Custom Research
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Reports */}
      {related.length > 0 && (
        <section className="bg-brand-silver py-16 border-y border-gray-200">
          <div className="wrap max-w-5xl">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              Related {post.sector} Research
            </h2>
            <p className="text-brand-slate mb-8">Explore adjacent reports to compare assumptions and outcomes.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <ResearchCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="wrap max-w-5xl mt-12 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <Link
            href="/research"
            className="text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors"
          >
            ← Back to All Research
          </Link>
          <Link
            href="/contact?service=Research Inquiry"
            className="text-sm font-semibold text-brand-navy hover:text-brand-teal transition-colors"
          >
            Discuss This Sector →
          </Link>
        </div>
      </div>
    </article>
  );
}