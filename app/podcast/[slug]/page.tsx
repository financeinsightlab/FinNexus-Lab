// FILE: app/podcast/[slug]/page.tsx (server async)
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getPodcastEpisodeBySlug, getAllPodcastEpisodes } from '@/lib/content';

export async function generateStaticParams() {
  const episodes = getAllPodcastEpisodes();
  return episodes.map((ep) => ({
    slug: ep.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    return {
      title: 'Episode Not Found',
    };
  }

  return {
    title: `${episode.title} | FinNexus Lab Podcast`,
    description: episode.description,
  };
}

export default async function PodcastEpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Episode header */}
      <section className="bg-brand-navy py-16">
        <div className="wrap max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/podcast" className="hover:text-white">Podcast</Link>
            {' / '}
            <span className="text-white">Episode {episode.episodeNumber}</span>
          </nav>

          {/* Episode number badge + format tag */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {episode.episodeNumber}
              </span>
            </div>
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-white/20 text-white">
              {episode.format}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {episode.title}
          </h1>

          {/* Guest info if present */}
          {episode.guestName && (
            <div className="text-lg text-gray-300 mb-6">
              Guest: <span className="font-medium">{episode.guestName}</span>
              {episode.guestRole && `, ${episode.guestRole}`}
            </div>
          )}

          {/* Duration badge + date */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-300">⏱️</span>
              <span className="text-white font-medium">{episode.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">📅</span>
              <span className="text-white">
                {formatDate(episode.date)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Audio player section */}
      <section className="wrap max-w-4xl py-12">
        <h2 className="text-2xl font-bold text-brand-navy mb-6">Listen Now</h2>
        {episode.audioUrl ? (
          <div className="mb-10">
            {/* Spotify embed placeholder */}
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300">
              <p className="text-sm text-gray-600 mb-4">
                Listen on your preferred platform:
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={episode.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex items-center gap-2"
                >
                  <span>🎵</span> Spotify
                </a>
                <a
                  href="#"
                  className="btn-outline flex items-center gap-2"
                >
                  <span>🍎</span> Apple Podcasts
                </a>
                <a
                  href="#"
                  className="btn-outline flex items-center gap-2"
                >
                  <span>📻</span> Google Podcasts
                </a>
              </div>
              <div className="mt-6">
                <audio controls className="w-full">
                  <source src={episode.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center mb-10">
            <div className="text-5xl mb-4">🎙️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Audio Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              This episode will be available on podcast platforms shortly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://open.spotify.com/show/example"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <span>🎵</span> Spotify
              </a>
              <a
                href="https://podcasts.apple.com/example"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <span>🍎</span> Apple Podcasts
              </a>
            </div>
          </div>
        )}

        {/* Show notes + transcript */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Show Notes & Transcript</h2>
          {episode.content ? (
            <MDXRemote source={episode.content} />
          ) : (
            <p className="text-gray-500">No show notes available for this episode.</p>
          )}
        </div>
      </section>

      {/* Subscribe CTA at bottom */}
      <section className="bg-gradient-to-r from-brand-navy to-slate-800 py-12">
        <div className="wrap max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Never Miss an Episode</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to the FinNexus Lab Podcast for weekly market intelligence, delivered in 30 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://open.spotify.com/show/example"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white flex items-center gap-2"
            >
              <span>🎵</span> Spotify
            </a>
            <a
              href="https://podcasts.apple.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white flex items-center gap-2"
            >
              <span>🍎</span> Apple Podcasts
            </a>
            <a
              href="https://podcasts.google.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white flex items-center gap-2"
            >
              <span>📻</span> Google Podcasts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}