import { Metadata } from 'next';
import Link from 'next/link';
import HeroBackground from '@/components/ui/HeroBackground';

interface Skill {
  cat: string;
  items: string[];
}

interface MethodologyStep {
  n: string;
  title: string;
  desc: string;
}

const SKILLS: Skill[] = [
  {
    cat: 'Financial Analysis',
    items: [
      'DCF Valuation Models',
      'Comparable Company Analysis',
      'Financial Statement Analysis',
      'Unit Economics Modeling',
      'Sensitivity & Scenario Analysis'
    ]
  },
  {
    cat: 'Data & Analytics',
    items: [
      'Market Sizing (TAM/SAM/SOM)',
      'Competitive Intelligence',
      'Data Visualization',
      'Statistical Analysis',
      'Trend Forecasting'
    ]
  },
  {
    cat: 'Strategy',
    items: [
      'Porter\'s Five Forces',
      'SWOT Analysis',
      'Strategic Positioning',
      'Market Entry Strategies',
      'Risk Assessment'
    ]
  },
  {
    cat: 'Tools & Platforms',
    items: [
      'Excel Advanced Modeling',
      'Power BI Dashboards',
      'Python Data Analysis',
      'SQL Database Queries',
      'Financial APIs Integration'
    ]
  }
];

const METHODOLOGY: MethodologyStep[] = [
  {
    n: '01',
    title: 'Hypothesis',
    desc: 'Form clear research questions and develop testable hypotheses based on market observations and stakeholder needs.'
  },
  {
    n: '02',
    title: 'Data Sources',
    desc: 'Identify and collect data from primary sources, industry reports, financial statements, and proprietary databases.'
  },
  {
    n: '03',
    title: 'Modelling',
    desc: 'Build financial models, conduct quantitative analysis, and create data visualizations to test hypotheses.'
  },
  {
    n: '04',
    title: 'Synthesis',
    desc: 'Analyze findings, identify patterns, and draw evidence-based conclusions from the research and modeling work.'
  },
  {
    n: '05',
    title: 'Stress Test',
    desc: 'Validate conclusions through sensitivity analysis, scenario testing, and peer review to ensure robustness.'
  },
  {
    n: '06',
    title: 'Editorial',
    desc: 'Transform analysis into clear, actionable insights with professional writing and compelling data presentation.'
  }
];

export const metadata: Metadata = {
  title: 'About | FinNexus Lab',
  description: 'Learn about FinNexus Lab\'s mission to provide institutional-quality financial research and analysis free of charge.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand-navy py-20">
        <HeroBackground />
        <div className="wrap relative z-10">
          <p className="section-label text-teal-300 mb-5">About the Platform</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            What is FinNexus Lab?
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Institutional-quality financial research and analysis, made freely available to democratize access to professional-grade insights.
            {/* ⚠ REPLACE: Your personal story and motivation */}
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <section className="wrap max-w-4xl py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Mission */}
          <div>
            <p className="section-label mb-4">Mission</p>
            <h2 className="text-3xl font-bold text-brand-navy mb-6">
              Rigorous. Precise. Useful.
            </h2>
            <div className="space-y-4 text-brand-slate">
              <p>
                FinNexus Lab was founded on the belief that high-quality financial research should be accessible to everyone,
                not just large institutions with multi-million dollar research budgets.
              </p>
              <p>
                We combine institutional-grade methodologies with modern data science to deliver insights that matter
                to founders, investors, and industry professionals across emerging markets.
              </p>
              {/* ⚠ REPLACE: Your personal story and motivation */}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5 text-center">
              <div className="text-2xl font-bold text-brand-teal mb-1">10+</div>
              <div className="text-sm text-brand-slate">Research Reports</div>
            </div>
            <div className="card p-5 text-center">
              <div className="text-2xl font-bold text-brand-teal mb-1">5+</div>
              <div className="text-sm text-brand-slate">Sectors</div>
            </div>
            <div className="card p-5 text-center">
              <div className="text-2xl font-bold text-brand-teal mb-1">8+</div>
              <div className="text-sm text-brand-slate">Data Projects</div>
            </div>
            <div className="card p-5 text-center">
              <div className="text-2xl font-bold text-brand-teal mb-1">20+</div>
              <div className="text-sm text-brand-slate">Insights Written</div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="bg-brand-silver py-20">
        <div className="wrap">
          <div className="text-center mb-12">
            <p className="section-label mb-4">Process</p>
            <h2 className="text-3xl font-bold text-brand-navy">
              The Research Process
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {METHODOLOGY.map((step) => (
              <div key={step.n} className="card p-6">
                <div className="text-4xl font-bold text-brand-teal/30 mb-3">
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold text-brand-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-brand-slate">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="wrap py-20">
        <div className="text-center mb-12">
          <p className="section-label mb-4">Expertise</p>
          <h2 className="text-3xl font-bold text-brand-navy">
            Skills & Capabilities
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SKILLS.map((skill) => (
            <div key={skill.cat} className="card p-6">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">
                {skill.cat}
              </h3>
              <ul className="space-y-2">
                {skill.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-brand-slate">
                    <span className="text-brand-teal mt-1">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="bg-brand-silver py-20">
        <div className="wrap">
          <div className="text-center mb-12">
            <p className="section-label mb-4">Enterprise Solutions</p>
            <h2 className="text-3xl font-bold text-brand-navy">
              Built for Teams & Organizations
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-4">
                  Enterprise-Grade Research Intelligence
                </h3>
                <p className="text-brand-slate mb-6">
                  Our enterprise solutions provide dedicated support, custom research capabilities,
                  and team management tools for organizations that need reliable market intelligence
                  at scale.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-teal">✓</span>
                    <span className="text-sm">Dedicated account managers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-teal">✓</span>
                    <span className="text-sm">Custom research requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-teal">✓</span>
                    <span className="text-sm">Team dashboards & analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-teal">✓</span>
                    <span className="text-sm">Priority API access</span>
                  </li>
                </ul>
                <Link href="/enterprise" className="btn-primary">
                  View Enterprise Plans
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-brand-teal mb-1">50+</div>
                  <div className="text-xs text-brand-slate">Enterprise Clients</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-brand-teal mb-1">24/7</div>
                  <div className="text-xs text-brand-slate">Support SLA</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-brand-teal mb-1">48h</div>
                  <div className="text-xs text-brand-slate">Custom Research</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-brand-teal mb-1">99.9%</div>
                  <div className="text-xs text-brand-slate">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-navy py-16">
        <div className="wrap text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Let us work together.
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Have a research question or need custom analysis? We&apos;d love to hear from you.
          </p>
          <Link href="/contact" className="btn btn-primary text-lg px-8 py-3">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}