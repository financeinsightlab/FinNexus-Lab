import { Metadata } from 'next';
import Link from 'next/link';
import CopyButton from '@/components/ui/CopyButton';
import HeroBackground from '@/components/ui/HeroBackground';

export const metadata: Metadata = {
  title: 'Speaking & Media',
  description: 'Available for speaking engagements, media coverage, and expert interviews on Indian markets, fintech, and data-driven strategy.'
};

// ⚠ REPLACE: Sample Media Mentions
const MEDIA_MENTIONS = [
  {
    publication: 'CNBC TV18',
    articleTitle: 'Analyzing the True Cost of Quick Commerce Deliveries in India',
    url: '#',
    date: 'February 2026',
    type: 'article'
  },
  {
    publication: 'Fintech Pulse Podcast',
    articleTitle: 'Guest: How Open Banking is Reshaping Credit Markets',
    url: '#',
    date: 'January 2026',
    type: 'podcast'
  },
  {
    publication: 'Tech in Asia Conference',
    articleTitle: 'Panel: The Future of Consumer Tech Unit Economics',
    url: '#',
    date: 'October 2025',
    type: 'conference'
  },
  {
    publication: 'The Economic Times',
    articleTitle: 'Quoted: "SaaS Valuation Multiples See Gradual Recovery"',
    url: '#',
    date: 'September 2025',
    type: 'article'
  },
  {
    publication: 'Slush 2024',
    articleTitle: 'Keynote: Data Analytics as the Ultimate Defensibility',
    url: '#',
    date: 'November 2024',
    type: 'conference'
  }
];

const EXPERTISE_AREAS = [
  {
    title: 'Quick Commerce Strategy',
    desc: 'Unit economics breakdowns, dark store efficiency models, and path to profitability analysis.'
  },
  {
    title: 'Indian Fintech Landscape',
    desc: 'Digital lending models, UPI scaling, and regulatory impacts on business moats.'
  },
  {
    title: 'Data Analytics in Finance',
    desc: 'Using alternative data, Power BI dashboarding, and practical machine learning in market research.'
  },
  {
    title: 'Market Research Methodology',
    desc: 'How to build institutional-quality research frameworks for venture capital and private equity.'
  },
  {
    title: 'Building a Financial Intelligence Platform',
    desc: 'The technical and operational playbook for scaling FinNexus Lab.'
  }
];

const BIOS = {
  short: 'The founder of FinNexus Lab, an institutional-quality financial intelligence platform providing data-driven sector analysis, unit economics breakdowns, and strategic insights on Indian markets.',
  medium: 'The founder of FinNexus Lab, a financial intelligence platform dedicated to democratising institutional-quality research. With deep expertise in Indian consumer tech, fintech, and quick commerce, FinNexus provides data-driven sector analytics, financial modelling tools, and strategic industry commentary for founders, analysts, and investors.',
  long: 'As the founder of FinNexus Lab, they have built a premier financial intelligence platform that bridges the gap between raw market data and actionable strategic insight. FinNexus Lab publishes institutional-quality research on emerging Indian sectors like Quick Commerce, Fintech, and SaaS.\n\nPrior to FinNexus, they spent years dissecting unit economics, building complex financial models, and evaluating startup trajectories. Today, they leverage tools like Power BI, advanced financial modeling, and proprietary scraping to generate unique proprietary datasets. They frequently speak on topics regarding market research methodologies, data analytics in finance, and the future of consumer tech profitability in India.'
};

function getBadgeColor(type: string) {
  switch (type) {
    case 'podcast': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'conference': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

export default function SpeakingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-navy to-slate-900 py-20 relative overflow-hidden">
        <HeroBackground />
        <div className="absolute inset-0 bg-pattern opacity-50" />
        <div className="wrap relative z-10 text-center">
          <p className="text-teal-400 font-semibold tracking-wider text-sm uppercase mb-4 tracking-widest">
            Speaking & Media
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Available for Speaking and Media
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
            Expert commentary, keynote presentations, and specialized workshops on financial modeling, data analytics, and Indian market dynamics.
          </p>
          <Link href="/contact?service=Speaking+Engagement" className="btn btn-primary shadow-lg hover:-translate-y-1 transition-transform">
            Invite to Speak
          </Link>
        </div>
      </header>

      {/* Bio and Expertise Section */}
      <section className="wrap py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Bios */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-navy mb-2">Speaking Bio</h2>
              <p className="text-brand-slate">
                Please use the bios below for conferences, podcasts, or media features.
              </p>
            </div>

            <div className="space-y-6">
              {/* Short Bio */}
              <div className="card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white hover:border-teal-100 transition-colors">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Short Bio (50 Words)</p>
                <p className="text-brand-slate leading-relaxed">{BIOS.short}</p>
                <CopyButton text={BIOS.short} />
              </div>

              {/* Medium Bio */}
              <div className="card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white hover:border-teal-100 transition-colors">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Medium Bio (100 Words)</p>
                <p className="text-brand-slate leading-relaxed">{BIOS.medium}</p>
                <CopyButton text={BIOS.medium} />
              </div>

              {/* Long Bio */}
              <div className="card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white hover:border-teal-100 transition-colors">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Long Bio (200 Words)</p>
                <div className="text-brand-slate leading-relaxed space-y-3">
                  {BIOS.long.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                <CopyButton text={BIOS.long} />
              </div>
            </div>
          </div>

          {/* Expertise */}
          <aside>
            <div className="card p-8 bg-brand-slate/5 border-none shadow-none rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Expertise Areas</h3>
              <ul className="space-y-6">
                {EXPERTISE_AREAS.map((area, idx) => (
                  <li key={idx}>
                    <h4 className="font-semibold text-brand-navy mb-1.5 flex items-start gap-2">
                       <span className="text-brand-teal mt-0.5">•</span>
                       {area.title}
                    </h4>
                    <p className="text-sm text-brand-slate pl-4 leading-relaxed bg-white/50 rounded-lg p-2">
                      {area.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Media Mentions */}
      <section className="py-16 md:py-24 bg-brand-silver border-y border-gray-200">
        <div className="wrap max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">In the Media</h2>
            <p className="text-brand-slate">Recent coverage, interviews, and panel appearances.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-2">
            <ul className="divide-y divide-gray-100">
              {MEDIA_MENTIONS.map((mention, idx) => (
                <li key={idx} className="p-6 md:p-8 hover:bg-slate-50 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-brand-navy">{mention.publication}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBadgeColor(mention.type)}`}>
                          {mention.type}
                        </span>
                      </div>
                      <Link 
                        href={mention.url} 
                        className="text-lg font-medium text-brand-slate group-hover:text-brand-teal transition-colors"
                      >
                        {mention.articleTitle}
                      </Link>
                    </div>
                    <div className="text-sm font-medium text-gray-400 whitespace-nowrap pt-1">
                      {mention.date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Booking Form CTA */}
      <section className="py-24 wrap text-center max-w-3xl">
        <h2 className="text-4xl font-bold text-brand-navy mb-6">Invite Me to Speak</h2>
        <p className="text-xl text-brand-slate mb-10 leading-relaxed">
          Whether you are hosting an intimate virtual fireside chat, a large tech conference, or looking for an analytical voice on your podcast — let's collaborate to bring data-driven insights to your audience.
        </p>
        <Link href="/contact?service=Speaking" className="btn btn-primary px-10 py-4 text-lg">
          Submit Speaking Inquiry →
        </Link>
      </section>
    </div>
  );
}
