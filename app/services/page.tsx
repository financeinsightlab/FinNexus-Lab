import { Metadata } from 'next';
import Link from 'next/link';
import HeroBackground from '@/components/ui/HeroBackground';

interface Service {
  icon: string;
  title: string;
  price: string;
  timeline: string;
  color: string;
  accent: string;
  desc?: string;
  includes: string[];
  for: string;
}

const SERVICES: Service[] = [
  {
    icon: '📋',
    title: 'Market Research Report',
    price: '₹15,000 – ₹75,000',
    timeline: '2–4 weeks',
    color: 'bg-blue-50 border-blue-100',
    accent: 'text-blue-900',
    desc: 'Custom sector analysis covering market size, competitive landscape, unit economics',
    includes: [
      'Executive Summary',
      'Market sizing TAM/SAM/SOM',
      'Competitive benchmarking',
      'Unit economics model',
      'Strategic risks & outlook'
    ],
    for: 'Startups, investors, PE/VC firms'
  },
  {
    icon: '📐',
    title: 'Financial Modelling',
    price: '₹8,000 – ₹40,000',
    timeline: '1–2 weeks',
    color: 'bg-teal-50 border-teal-100',
    accent: 'text-teal-900',
    desc: 'Three-statement models, DCF valuations, scenario analysis built to IB standard',
    includes: [
      '3-statement model',
      'DCF or CCA',
      'Scenario tables',
      'Full documentation'
    ],
    for: 'Founders, CFOs, investment analysts'
  },
  {
    icon: '🔍',
    title: 'Competitive Intelligence',
    price: '₹10,000 – ₹35,000',
    timeline: '1–2 weeks',
    color: 'bg-amber-50 border-amber-100',
    accent: 'text-amber-900',
    includes: [
      'Competitor profiling 5-10 players',
      'Benchmarking table 20+ KPIs',
      'Positioning matrix',
      'SWOT/Porter\'s Five Forces'
    ],
    for: 'Strategy teams, consulting firms'
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    price: '₹12,000 – ₹50,000',
    timeline: '2–4 weeks',
    color: 'bg-purple-50 border-purple-100',
    accent: 'text-purple-900',
    includes: [
      'Data model design',
      'KPI definition',
      'Power BI/Excel build',
      'User guide',
      '30-day support'
    ],
    for: 'Operations teams, SMEs, startups'
  },
  {
    icon: '🧠',
    title: 'Strategy Note',
    price: '₹5,000 – ₹20,000',
    timeline: '3–5 days',
    color: 'bg-green-50 border-green-100',
    accent: 'text-green-900',
    desc: 'Focused 5-10 page advisory note on one strategic question',
    includes: [
      'Problem framing',
      'Data-backed analysis',
      'Clear recommendation',
      'Implementation considerations'
    ],
    for: 'Founders, senior management teams'
  }
];

const PROCESS = [
  'Scoping Call',
  'Proposal',
  'Research',
  'Draft Review',
  'Final Delivery'
];

export const metadata: Metadata = {
  title: 'Services | FinNexus Lab',
  description: 'Custom research, financial modeling, and analytics services for organizations that move on data.',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand-navy py-20">
        <HeroBackground />
        <div className="wrap relative z-10">
          <p className="section-label text-teal-300 mb-5">Services</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Custom Research & Analytics
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            For organisations that move on data. Professional-grade research, modeling, and insights tailored to your strategic needs.
          </p>
        </div>
      </header>

      {/* Services Grid */}
      <section className="wrap py-20">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className={`card border p-7 flex flex-col ${service.color}`}
            >
              {/* Icon */}
              <span className="text-4xl mb-4">{service.icon}</span>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-3 ${service.accent}`}>
                {service.title}
              </h3>

              {/* Price & Timeline */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-brand-navy">{service.price}</span>
                <span className="text-sm text-brand-slate">{service.timeline}</span>
              </div>

              {/* Description */}
              {service.desc && (
                <p className="text-sm text-brand-slate mb-4">{service.desc}</p>
              )}

              {/* Includes */}
              <div className="mb-6 flex-1">
                <p className="text-sm font-medium text-brand-navy mb-2">Includes:</p>
                <ul className="text-sm text-brand-slate space-y-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <p className="text-xs text-brand-slate mb-3">
                  Best for: {service.for}
                </p>
                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="btn btn-primary w-full text-center"
                >
                  Inquire →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-brand-silver py-20">
        <div className="wrap">
          <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">
            Our Process
          </h2>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline */}
            <div className="flex items-center justify-between">
              {PROCESS.map((step, index) => (
                <div key={step} className="flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className="w-12 h-12 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-lg mb-4">
                    {index + 1}
                  </div>

                  {/* Step Title */}
                  <h3 className="font-semibold text-brand-navy mb-2">{step}</h3>

                  {/* Connector Line */}
                  {index < PROCESS.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-1/2 transform translate-x-6 w-full h-px bg-brand-teal/30 -z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-navy py-20">
        <div className="wrap text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Book a free 30-minute scoping call to discuss your project requirements and explore how we can help.
          </p>
          <Link href="/contact" className="btn btn-white text-lg px-8 py-3">
            Book Free Scoping Call →
          </Link>
        </div>
      </section>
    </div>
  );
}