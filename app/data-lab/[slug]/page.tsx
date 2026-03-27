// FILE: app/data-lab/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils';
import { getDataLabBySlug, getAllDataLab } from '@/lib/content';

export async function generateStaticParams() {
  const projects = getAllDataLab();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getDataLabBySlug(slug);

  if (!project) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${project.title} | Data Lab`,
    description: project.businessQuestion,
  };
}

export default async function DataLabProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getDataLabBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Project header */}
      <section className="bg-brand-navy py-16">
        <div className="wrap max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/data-lab" className="hover:text-white">Data Lab</Link>
            {' / '}
            <span className="text-brand-teal">{project.sector}</span>
          </nav>

          {/* Tool badges + sector tag */}
          <div className="flex flex-wrap gap-3 mb-6">
            {project.tools.map((tool) => (
              <Tag key={tool} variant="silver" text={tool} className="text-sm" />
            ))}
            <Tag variant="teal" text={project.sector} className="text-sm" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            {project.title}
          </h1>

          {/* Thesis blockquote */}
          <blockquote className="border-l-4 border-brand-teal pl-6 py-2 my-8">
            <p className="text-xl text-gray-200 italic">
              {project.businessQuestion}
            </p>
          </blockquote>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-700 text-gray-300">
            <div>
              <div className="text-sm text-gray-400">Date Published</div>
              <div className="font-medium">{formatDate(project.date)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Duration</div>
              <div className="font-medium">{project.duration}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Tools Used</div>
              <div className="font-medium">{project.tools.join(', ')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Project body */}
      <section className="wrap max-w-4xl mt-12">
        {project.content ? (
          <div className="prose prose-lg max-w-none">
            <MDXRemote source={project.content} />
          </div>
        ) : (
          <p className="text-gray-500">Content not available.</p>
        )}

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/data-lab"
            className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-teal"
          >
            ← All Data Lab Projects
          </Link>
        </div>
      </section>
    </div>
  );
}