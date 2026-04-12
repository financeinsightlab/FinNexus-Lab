import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HeroBackground from '@/components/ui/HeroBackground';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import SaveButton from '@/components/ui/SaveButton';
import { formatDate, CATEGORY_VARIANT } from '@/lib/utils';
import { getInsightBySlug, getAllInsights } from '@/lib/content';
import InsightCard from '@/components/insights/InsightCard';
import { PrismaClient } from "@prisma/client"
import ContentRenderer from "@/components/ContentRenderer"
import { ChevronLeft, Calendar, User, BookOpen } from "lucide-react"
import React from "react"

const prisma = new PrismaClient()

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const dbPost = await prisma.post.findUnique({ where: { slug } })
    if (dbPost) {
      return {
        title: dbPost.title,
        description: dbPost.excerpt || '',
      }
    }
  } catch (e) {}

  const post = await getInsightBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return { title: post.title, description: post.thesis };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. New CMS
  let dbPost = null
  try {
    dbPost = await prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } }
    })
  } catch (e) {}

  if (dbPost && dbPost.type === 'INSIGHT') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1C2C] text-gray-800 dark:text-slate-200">
        <header className="relative overflow-hidden bg-brand-navy py-16 md:py-20 text-white">
          <HeroBackground />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <Link href="/insights" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors mb-10">
              <ChevronLeft className="w-4 h-4" /> All Insights
            </Link>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full uppercase tracking-widest border border-teal-500/20">Market Insight</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">{dbPost.title}</h1>
              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl italic border-l-4 border-slate-700 pl-6">{dbPost.excerpt}</p>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-400 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> <span className="font-medium text-slate-200">{dbPost.author?.name || 'FinNexus Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> <span>{new Date(dbPost.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <article className="max-w-4xl mx-auto px-6 pt-12 pb-32">
          <div className="bg-gray-50 dark:bg-[#0F2335] rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-2xl">
            <ContentRenderer content={dbPost.content} contentType={dbPost.contentType} blocks={dbPost.blockContent} />
          </div>
        </article>
      </div>
    )
  }

  // 2. Legacy
  const post = await getInsightBySlug(slug);
  if (!post) notFound();

  const tagVariant = CATEGORY_VARIANT[post.category] ?? 'teal';
  const related = getAllInsights().filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);

  return (
    <article className="pt-24 pb-24 bg-gradient-to-b from-slate-50 to-white">
      <header className="relative overflow-hidden bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate py-16 mb-12">
        <HeroBackground />
        <div className="wrap max-w-5xl relative z-10">
          <div className="text-xs text-gray-300 mb-5 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> /{' '}
            <Link href="/insights" className="hover:text-white transition-colors">Insights</Link> /{' '}
            <span>{post.category}</span>
          </div>
          <Tag text={post.category} variant={tagVariant} />
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-4 mb-6 max-w-4xl">{post.title}</h1>
          <blockquote className="border-l-4 border-brand-teal pl-5 py-3 bg-white/10 rounded-r-lg mb-7 max-w-4xl"><p className="italic text-white/90 text-lg">{post.thesis}</p></blockquote>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-[11px] uppercase tracking-wider text-gray-400">Published</p><p className="text-sm text-white font-medium mt-1">{formatDate(post.date)}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-gray-400">Reading Time</p><p className="text-sm text-white font-medium mt-1">{post.readingTime} min</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-gray-400">Author</p><p className="text-sm text-white font-medium mt-1">{post.author}</p></div>
            </div>
          </div>
        </div>
      </header>
      <div className="wrap max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
            <div className="prose prose-lg max-w-none report-body">
              {post.content ? <MDXRemote source={post.content} /> : <p className="text-center italic text-gray-500">Insight content not available.</p>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}