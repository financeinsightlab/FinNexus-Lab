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

  return (
    <article className="pt-16">
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
      <header className="bg-brand-navy py-16 md:py-20">
        <div className="wrap">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">Home</Link> /{' '}
            <Link href="/research" className="hover:text-white">Research</Link> /{' '}
            <span>{post.sector}</span>
          </div>

          {/* Sector Tag */}
          <Tag text={post.sector} variant="teal" />

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
            {post.title}
          </h1>

          {/* Summary */}
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
            {post.summary}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <span>Published {formatDate(post.date)}</span>
            <span>By {post.author}</span>
            <span>{post.pageCount} pages</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-gray-300 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Report Body */}
      <div className="wrap max-w-4xl mt-12 mb-16">
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

      {/* Related Reports */}
      {related.length > 0 && (
        <section className="bg-brand-silver py-16">
          <div className="wrap max-w-4xl">
            <h2 className="text-2xl font-bold text-brand-navy mb-8">
              Related {post.sector} Research
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <ResearchCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="wrap max-w-4xl mt-12 pb-12">
        <Link
          href="/research"
          className="text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors"
        >
          ← Back to All Research
        </Link>
      </div>
    </article>
  );
}