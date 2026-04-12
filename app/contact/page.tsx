import { Suspense } from 'react';
import { Metadata } from 'next';
import HeroBackground from '@/components/ui/HeroBackground';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact | FinNexus Lab',
  description:
    'Get in touch with FinNexus Lab for research inquiries, financial modeling projects, and custom analytics solutions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand-navy py-16">
        <HeroBackground />
        <div className="wrap relative z-10">
          <p className="section-label text-teal-300 mb-5">Get in Touch</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
            Start a Conversation
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Have a research question, need custom analysis, or want to discuss a project?
            We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="wrap py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Form */}
          <div className="md:col-span-2">
            <Suspense fallback={<div>Loading form...</div>}>
              <ContactForm />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-brand-navy mb-4">Direct Contact</h3>
              <div className="space-y-3">
                <a
                  href="mailto:hello@finnexuslab.com"
                  className="block text-brand-teal hover:text-brand-navy"
                >
                  📧 hello@finnexuslab.com
                </a>
                <a
                  href="https://linkedin.com/company/finnexuslab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-brand-teal hover:text-brand-navy"
                >
                  💼 LinkedIn Profile
                </a>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-brand-navy mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-brand-slate">
                <li>› Market Research Reports</li>
                <li>› Financial Modelling</li>
                <li>› Competitive Intelligence</li>
                <li>› Analytics Dashboards</li>
                <li>› Strategy Notes</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-brand-navy mb-4">Response Time</h3>
              <p className="text-sm text-brand-slate">
                We typically respond within 24–48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}