// FILE: app/podcast/page.tsx (server component, Metadata)
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPodcastEpisodes } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Podcast | FinNexus Lab',
  description: 'Market intelligence in 30 minutes. The FinNexus Lab Podcast delivers sharp analysis on Indian startups, quick commerce, and financial markets.',
};

export default function PodcastPage() {
  const episodes = getAllPodcastEpisodes();

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <section className="bg-brand-navy py-20">
        <div className="wrap max-w-6xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎙️</span>
              <span className="section-label text-brand-teal">Podcast</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              The FinNexus Lab Podcast
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Market Intelligence in 30 Minutes
            </p>
            
            {/* Subscribe buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://open.spotify.com/show/example"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white flex items-center gap-2"
              >
                <span>🎵</span> Spotify
              </a>
              <a
                href="https://podcasts.apple.com/example"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white flex items-center gap-2"
              >
                <span>🍎</span> Apple Podcasts
              </a>
              <a
                href="https://podcasts.google.com/example"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white flex items-center gap-2"
              >
                <span>📻</span> Google Podcasts
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes list */}
      <section className="wrap max-w-6xl py-14">
        <h2 className="text-3xl font-bold text-brand-navy mb-8">Latest Episodes</h2>
        
        <div className="space-y-6">
          {episodes.map((episode) => (
            <div
              key={episode.slug}
              className="card p-6 mb-4 flex flex-col md:flex-row gap-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
            >
              {/* Left: episode number circle */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center">
                  <span className="text-2xl font-bold text-brand-teal">
                    {episode.episodeNumber}
                  </span>
                </div>
              </div>

              {/* Right: content */}
              <div className="flex-grow">
                {/* Format tag */}
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-brand-teal/10 text-brand-teal mb-3">
                  {episode.format}
                </span>

                {/* Title */}
                <h3 className="font-bold text-brand-navy text-xl mb-2">
                  {episode.title}
                </h3>

                {/* Guest info if present */}
                {episode.guestName && (
                  <p className="text-sm text-gray-600 mb-2">
                    Guest: <span className="font-medium">{episode.guestName}</span>
                    {episode.guestRole && `, ${episode.guestRole}`}
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-700 mb-4">
                  {episode.description}
                </p>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {new Date(episode.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                      {episode.duration}
                    </span>
                  </div>
                  <Link
                    href={`/podcast/${episode.slug}`}
                    className="btn-ghost text-brand-navy hover:text-brand-teal inline-flex items-center gap-2"
                  >
                    Listen & Read Notes →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {episodes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No podcast episodes published yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}