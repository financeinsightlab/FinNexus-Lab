import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ResearchPost, InsightPost, DataLabProject, CaseStudy, PodcastEpisode } from '@/types';

const CONTENT = path.join(process.cwd(), 'content');

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
}

function normalizeResearchPost(data: Record<string, unknown>, slug: string, content?: string): ResearchPost {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    sector: typeof data.sector === 'string' ? data.sector : 'General',
    tags: toStringArray(data.tags),
    summary: typeof data.summary === 'string' ? data.summary : '',
    pageCount: typeof data.pageCount === 'number' ? data.pageCount : 0,
    author: typeof data.author === 'string' ? data.author : 'FinNexus Lab',
    featured: Boolean(data.featured),
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
    content,
  };
}

function normalizeInsightPost(data: Record<string, unknown>, slug: string, content?: string): InsightPost {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    category: (typeof data.category === 'string' ? data.category : 'Market Update') as InsightPost['category'],
    readingTime: typeof data.readingTime === 'number' ? data.readingTime : 5,
    thesis: typeof data.thesis === 'string' ? data.thesis : '',
    author: typeof data.author === 'string' ? data.author : 'FinNexus Lab',
    featured: Boolean(data.featured),
    content,
  };
}

function readDir(dir: string): { slug: string; filePath: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => ({
      slug: file.replace('.mdx', ''),
      filePath: path.join(dir, file),
    }));
}

export function getAllResearch(): ResearchPost[] {
  const researchDir = path.join(CONTENT, 'research');
  const files = readDir(researchDir);
  return files
    .map(({ slug, filePath }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return normalizeResearchPost(data as Record<string, unknown>, slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getResearchBySlug(slug: string): Promise<ResearchPost | null> {
  const filePath = path.join(CONTENT, 'research', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return normalizeResearchPost(data as Record<string, unknown>, slug, content);
}

export function getFeaturedResearch(n = 3): ResearchPost[] {
  return getAllResearch().filter((post) => post.featured).slice(0, n);
}

export function getRelatedResearch(currentSlug: string, sector: string, n = 3): ResearchPost[] {
  return getAllResearch()
    .filter((post) => post.sector === sector && post.slug !== currentSlug)
    .slice(0, n);
}

export function getAllInsights(): InsightPost[] {
  const insightsDir = path.join(CONTENT, 'insights');
  const files = readDir(insightsDir);
  return files
    .map(({ slug, filePath }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return normalizeInsightPost(data as Record<string, unknown>, slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getInsightBySlug(slug: string): Promise<InsightPost | null> {
  const filePath = path.join(CONTENT, 'insights', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return normalizeInsightPost(data as Record<string, unknown>, slug, content);
}

export function getFeaturedInsights(n = 3): InsightPost[] {
  return getAllInsights().filter((post) => post.featured).slice(0, n);
}

export function getContentCounts(): { research: number; insights: number } {
  return {
    research: getAllResearch().length,
    insights: getAllInsights().length,
  };
}

function normalizeDataLabProject(data: Record<string, unknown>, slug: string, content?: string): DataLabProject {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    tools: toStringArray(data.tools),
    sector: typeof data.sector === 'string' ? data.sector : 'General',
    businessQuestion: typeof data.businessQuestion === 'string' ? data.businessQuestion : '',
    duration: typeof data.duration === 'string' ? data.duration : '',
    featured: Boolean(data.featured),
    content,
  };
}

function normalizeCaseStudy(data: Record<string, unknown>, slug: string, content?: string): CaseStudy {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    clientType: typeof data.clientType === 'string' ? data.clientType : '',
    engagementType: typeof data.engagementType === 'string' ? data.engagementType : '',
    outcome: typeof data.outcome === 'string' ? data.outcome : '',
    featured: Boolean(data.featured),
    content,
  };
}

export function getAllDataLab(): DataLabProject[] {
  const dataLabDir = path.join(CONTENT, 'data-lab');
  const files = readDir(dataLabDir);
  return files
    .map(({ slug, filePath }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return normalizeDataLabProject(data as Record<string, unknown>, slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getDataLabBySlug(slug: string): Promise<DataLabProject | null> {
  const filePath = path.join(CONTENT, 'data-lab', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return normalizeDataLabProject(data as Record<string, unknown>, slug, content);
}

export function getFeaturedDataLab(n = 3): DataLabProject[] {
  return getAllDataLab().filter((project) => project.featured).slice(0, n);
}

export function getAllCaseStudies(): CaseStudy[] {
  const caseStudiesDir = path.join(CONTENT, 'case-studies');
  const files = readDir(caseStudiesDir);
  return files
    .map(({ slug, filePath }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return normalizeCaseStudy(data as Record<string, unknown>, slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const filePath = path.join(CONTENT, 'case-studies', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return normalizeCaseStudy(data as Record<string, unknown>, slug, content);
}

function normalizePodcastEpisode(data: Record<string, unknown>, slug: string, content?: string): PodcastEpisode {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    episodeNumber: typeof data.episodeNumber === 'number' ? data.episodeNumber : 0,
    duration: typeof data.duration === 'string' ? data.duration : '',
    format: (typeof data.format === 'string' ? data.format : 'Solo Analysis') as PodcastEpisode['format'],
    guestName: typeof data.guestName === 'string' ? data.guestName : undefined,
    guestRole: typeof data.guestRole === 'string' ? data.guestRole : undefined,
    description: typeof data.description === 'string' ? data.description : '',
    audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : undefined,
    featured: Boolean(data.featured),
    content,
  };
}

export function getAllPodcastEpisodes(): PodcastEpisode[] {
  const podcastDir = path.join(CONTENT, 'podcast');
  const files = readDir(podcastDir);
  return files
    .map(({ slug, filePath }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return normalizePodcastEpisode(data as Record<string, unknown>, slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPodcastEpisodeBySlug(slug: string): Promise<PodcastEpisode | null> {
  const filePath = path.join(CONTENT, 'podcast', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return normalizePodcastEpisode(data as Record<string, unknown>, slug, content);
}