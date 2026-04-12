import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HeroBackground from '@/components/ui/HeroBackground';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import CTAButton from '@/components/ui/CTAButton';
import { formatDate } from '@/lib/utils';
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/content';
import { PrismaClient } from "@prisma/client"
import ContentRenderer from "@/components/ContentRenderer"
import { ChevronLeft, Calendar, User, Briefcase } from "lucide-react"
import React from "react"

const prisma = new PrismaClient()

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const dbPost = await prisma.post.findUnique({ where: { slug } })
    if (dbPost) {
      return {
        title: `${dbPost.title} | Case Study`,
        description: dbPost.excerpt || '',
      }
    }
  } catch (e) {}

  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) return { title: 'Not Found' };
  return { title: `${caseStudy.title} | Case Study`, description: caseStudy.outcome };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. New CMS
  let dbPost = null
  try {
    dbPost = await prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } }
    })
  } catch (e) {}

  if (dbPost && dbPost.type === 'CASE_STUDY') {
    return (
      <div className="min-h-screen bg-[#0B1C2C] text-slate-200">
        <header className="relative overflow-hidden bg-brand-navy py-16 md:py-20 text-white">
          <HeroBackground />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <Link href="/case-studies" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors mb-10">
              <ChevronLeft className="w-4 h-4" /> All Case Studies
            </Link>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full uppercase tracking-widest border border-teal-500/20">Case Study</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">{dbPost.title}</h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-3xl italic border-l-4 border-slate-700 pl-6">{dbPost.excerpt}</p>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-400 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> <span className="font-medium text-slate-300">{dbPost.author?.name || 'FinNexus Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> <span>{new Date(dbPost.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2 text-teal-400">
                  <Briefcase className="w-4 h-4" /> <span>Enterprise Solution</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <article className="max-w-4xl mx-auto px-6 pt-12 pb-32">
          <div className="bg-[#0F2335] rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl">
            <ContentRenderer content={dbPost.content} contentType={dbPost.contentType} blocks={dbPost.blockContent} />
          </div>
        </article>
      </div>
    )
  }

  // 2. Legacy
  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  const sections = ['Challenge', 'Approach', 'Analysis', 'Findings', 'Recommendation', 'Outcome'];

  return (
    <article className="pt-16 bg-gradient-to-b from-slate-50 to-white">
      <header className="relative overflow-hidden bg-gradient-to-r from-brand-navy to-slate-900 py-16">
        <HeroBackground />
        <div className="wrap max-w-4xl relative z-10">
          <nav className="text-sm text-gray-300 mb-6 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> /{' '}
            <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link> /{' '}
            <span className="text-brand-teal">{caseStudy.clientType}</span>
          </nav>
          <Tag variant="teal" text={caseStudy.engagementType} className="mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">{caseStudy.title}</h1>
          <div className="flex flex-wrap gap-8 text-gray-300 mb-10">
            <div><p className="text-[11px] uppercase tracking-wider text-gray-400">Client</p><p className="text-sm text-white font-medium mt-1">{caseStudy.clientType}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-gray-400">Date</p><p className="text-sm text-white font-medium mt-1">{formatDate(caseStudy.date)}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-gray-400 text-teal-400">Outcome</p><p className="text-sm text-white font-medium mt-1 max-w-md">{caseStudy.outcome}</p></div>
          </div>
        </div>
      </header>
      <div className="wrap max-w-6xl py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {sections.map((section, index) => (
            <section key={section} className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-teal text-white font-bold text-lg">{index + 1}</div>
                <h2 className="text-2xl font-bold text-brand-navy">{section}</h2>
              </div>
              <div className="prose prose-lg max-w-none">{caseStudy.content && index === 0 && <MDXRemote source={caseStudy.content} />}</div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}