import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import ResearchGrid from '@/components/research/ResearchGrid';
import InsightGrid from '@/components/insights/InsightGrid';
import NewsletterForm from '@/components/NewsletterForm';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { getFeaturedResearch, getFeaturedInsights } from '@/lib/content';

export default async function HomePage() {
  const research = getFeaturedResearch(3);
  const insights = getFeaturedInsights(3);

  return (
    <>
      <section className="relative min-h-screen bg-brand-navy flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-teal-500/18 to-transparent rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-gold-500/14 to-transparent rounded-full pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none bg-grid"
        />
        <div className="wrap relative z-10 py-32 md:py-40">
          <p className="section-label text-teal-300 mb-5 anim-fade">Financial Intelligence Platform</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 anim-fade-up">
            Smarter Decisions{' '}
            <span className="bg-gradient-to-r from-[#0D9E9E] to-[#92620A] bg-clip-text text-transparent">
              Start Here.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-10 anim-fade-up delay-200">
            Institutional-quality research on Indian markets — free. Sector analysis, unit economics,
            and strategic intelligence for investors, analysts, and founders.
          </p>
          <div className="flex flex-wrap gap-4 anim-fade-up delay-300">
            <Link href="/research" className="btn-white">
              View Research →
            </Link>
            <Link href="/insights" className="btn-outline-white">
              Explore Insights
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 mt-16 anim-fade delay-500">
            <div className="stat-card min-w-[100px]">
              <p className="text-2xl font-bold text-white mb-1">10+</p>
              <p className="text-xs text-gray-400">Reports</p>
            </div>
            <div className="stat-card min-w-[100px]">
              <p className="text-2xl font-bold text-white mb-1">₹1T+</p>
              <p className="text-xs text-gray-400">Market Cap</p>
            </div>
            <div className="stat-card min-w-[100px]">
              <p className="text-2xl font-bold text-white mb-1">5+</p>
              <p className="text-xs text-gray-400">Sectors</p>
            </div>
            <div className="stat-card min-w-[100px]">
              <p className="text-2xl font-bold text-white mb-1">Free</p>
              <p className="text-xs text-gray-400">Always</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-2">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent" />
        </div>
      </section>

      <section className="py-24 bg-white">
        <ScrollReveal>
          <SectionHeader
            label="What We Do"
            title="Platform Pillars of Financial Intelligence"
            align="center"
          />
        </ScrollReveal>
        <div className="wrap">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-14">
            {[
              {
                icon: '📊',
                title: 'Research Intelligence',
                desc: 'Deep-dive reports on market trends, competitive analysis, and strategic positioning.',
                href: '/research',
                bg: 'bg-blue-50',
                delay: 0,
              },
              {
                icon: '📈',
                title: 'Data Analytics',
                desc: 'Quantitative insights with proprietary models and financial metrics.',
                href: '/about',
                bg: 'bg-teal-50',
                delay: 100,
              },
              {
                icon: '🧠',
                title: 'Strategic Insights',
                desc: 'Expert commentary on sector developments and investment opportunities.',
                href: '/insights',
                bg: 'bg-amber-50',
                delay: 200,
              },
              {
                icon: '🔧',
                title: 'Financial Tools',
                desc: 'Practical frameworks and calculators for financial analysis.',
                href: '/tools',
                bg: 'bg-purple-50',
                delay: 300,
              },
              {
                icon: '📊',
                title: 'Data Lab',
                desc: 'Analytics projects, Power BI dashboards, and Python data analyses.',
                href: '/data-lab',
                bg: 'bg-emerald-50',
                delay: 400,
              },
              {
                icon: '📁',
                title: 'Case Studies',
                desc: 'Consulting-quality engagements — Challenge to Outcome narratives.',
                href: '/case-studies',
                bg: 'bg-rose-50',
                delay: 500,
              },
            ].map((pillar) => (
              <ScrollReveal key={pillar.title} delay={pillar.delay}>
                <Link href={pillar.href} className="card p-6 flex flex-col h-full group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${pillar.bg} flex items-center justify-center text-2xl mb-4`}>
                    {pillar.icon}
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2 group-hover:text-brand-teal transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-brand-slate leading-relaxed flex-1">
                    {pillar.desc}
                  </p>
                  <span className="btn-ghost mt-4 text-xs">Explore →</span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-20 bg-white">
        <div className="wrap">
          <SectionHeader
            label="Research"
            title="Featured Research"
            subtitle="Deep dives into emerging trends and market dynamics"
            align="center"
          />
          <ResearchGrid posts={research} />
        </div>
      </section>

      {/* Sector Trackers */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="wrap">
          <ScrollReveal>
            <SectionHeader
              label="Live Intelligence"
              title="Sector Intelligence Trackers"
              subtitle="Quarterly-updated data across 8 Indian market sectors"
              align="center"
            />
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-10">
            {[
              {
                emoji: '🚀',
                sector: 'Quick Commerce',
                metric: 'GMV Growth: 42% YoY',
                href: '/tracker/quick-commerce',
              },
              {
                emoji: '💰',
                sector: 'Fintech',
                metric: 'Digital Payments: ₹12.4T',
                href: '/tracker/fintech',
              },
              {
                emoji: '⚡',
                sector: 'EV',
                metric: 'EV Adoption: 8.5%',
                href: '/tracker/ev',
              },
              {
                emoji: '🍔',
                sector: 'Food Delivery',
                metric: 'Order Volume: 18M/month',
                href: '/tracker/food-delivery',
              },
            ].map((tracker) => (
              <Link
                key={tracker.sector}
                href={tracker.href}
                className="card p-5 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tracker.emoji}</span>
                  <h3 className="font-bold text-brand-navy">{tracker.sector}</h3>
                </div>
                <p className="text-sm text-brand-slate mb-3">{tracker.metric}</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
                  🔒 Full data: subscribers
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/tracker" className="btn-ghost text-sm">
              View All Trackers →
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Insights */}
      <section className="py-20 bg-brand-slate/5">
        <div className="wrap">
          <SectionHeader
            label="Insights"
            title="Latest Insights"
            subtitle="Timely analysis and market intelligence"
            align="center"
          />
          <InsightGrid posts={insights} />
        </div>
      </section>

      {/* Services CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-navy to-brand-slate text-white">
        <div className="wrap text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Intelligence?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Access our comprehensive suite of research tools, data analytics, and expert insights to stay ahead in the financial markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="btn-primary">
                Explore Services
              </Link>
              <Link href="/contact" className="btn-ghost">
                Get in Touch
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Podcast */}
      <section className="py-20 bg-brand-slate/5">
        <div className="wrap">
          <ScrollReveal>
            <SectionHeader
              label="FinNexus Podcast"
              title="Market Intelligence in 30 Minutes"
              align="center"
            />
          </ScrollReveal>
          <div className="mt-10">
            <div className="card p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="text-5xl font-bold text-brand-teal">01</div>
                <div className="mt-2 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">
                  Deep Dive
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-brand-navy mb-3">
                  Episode 1: Blinkit EBITDA Breakdown
                </h3>
                <p className="text-brand-slate leading-relaxed mb-6">
                  A detailed analysis of Blinkit's path to profitability, unit economics, and the broader quick‑commerce landscape in India. We break down the key drivers, competitive moats, and what it means for investors.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/podcast/ep001-blinkit-ebitda-breakdown" className="btn-ghost text-sm">
                    Listen & Read Notes →
                  </Link>
                  <Link href="/podcast" className="text-sm text-brand-teal hover:underline">
                    All Episodes →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="wrap">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              label="Stay Updated"
              title="Subscribe to Our Newsletter"
              subtitle="Get the latest research, insights, and market analysis delivered to your inbox"
              align="center"
            />
            <ScrollReveal delay={200}>
              <NewsletterForm />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}