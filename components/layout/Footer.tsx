import Link from 'next/link';
import { 
  Building2, 
  Shield, 
  Award, 
  Globe, 
  FileText, 
  Users, 
  BarChart3, 
  Cpu,
  Mail,
  Share2,
  MessageCircle,
  Video,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const corporateServices = [
    { name: 'Enterprise Research', href: '/services#research' },
    { name: 'Strategic Advisory', href: '/services#advisory' },
    { name: 'Data Intelligence', href: '/services#data' },
    { name: 'Market Analysis', href: '/services#market' },
    { name: 'Financial Modeling', href: '/services#modeling' },
    { name: 'Risk Assessment', href: '/services#risk' },
  ];

  const premiumResources = [
    { name: 'Research Library', href: '/research', icon: FileText },
    { name: 'Insights Hub', href: '/insights', icon: BarChart3 },
    { name: 'Analytical Tools', href: '/tools', icon: Cpu },
    { name: 'Case Studies', href: '/case-studies', icon: Users },
    { name: 'Data Lab', href: '/data-lab', icon: Cpu },
    { name: 'Podcast', href: '/podcast', icon: Video },
  ];

  const legalCompliance = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR Compliance', href: '/gdpr' },
    { name: 'Security Standards', href: '/security' },
    { name: 'Ethical Guidelines', href: '/ethics' },
  ];

  const corporateFeatures = [
    'ISO 27001 Certified',
    'SOC 2 Type II Compliant',
    'GDPR Ready',
    'Enterprise-Grade Security',
    '24/7 Premium Support',
    'Custom SLA Agreements',
  ];

  return (
    <footer className="bg-gradient-to-b from-brand-navy to-gray-900 text-white border-t border-gray-800">
      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-brand-teal/20 to-brand-gold/20 border-y border-gray-700">
        <div className="wrap py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-semibold">TRUSTED BY FORTUNE 500 COMPANIES & LEADING FINANCIAL INSTITUTIONS</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-teal" />
              <span className="text-xs text-gray-300">Enterprise-Grade Security & Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="wrap py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Corporate Branding Column */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-8 h-8 text-brand-teal" />
                <div>
                  <Link href="/" className="flex items-center space-x-1 font-bold text-2xl">
                    <span className="text-brand-teal">FinNexus</span>
                    <span className="text-brand-gold">Lab</span>
                  </Link>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">CORPORATE INTELLIGENCE PLATFORM</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                A premier financial intelligence platform delivering data-driven insights, 
                strategic analysis, and enterprise-grade research for global corporations 
                and financial institutions.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-teal" />
                  <span className="text-sm text-gray-300">Rigorous Quantitative Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-teal" />
                  <span className="text-sm text-gray-300">Institutional-Grade Research</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-teal" />
                  <span className="text-sm text-gray-300">Regulatory Compliance Focus</span>
                </div>
              </div>

              {/* Social & Contact */}
              <div className="pt-6 border-t border-gray-800">
                <h4 className="text-sm font-semibold mb-4">CORPORATE CONNECT</h4>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://linkedin.com/company/finnexuslab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Share2 className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://twitter.com/finnexuslab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Twitter"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://youtube.com/@finnexuslab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="YouTube"
                  >
                    <Video className="w-5 h-5" />
                  </a>
                  <a 
                    href="mailto:corporate@finnexuslab.com" 
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Services & Resources Columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Corporate Services */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  CORPORATE SERVICES
                </h3>
                <ul className="space-y-3">
                  {corporateServices.map((service) => (
                    <li key={service.name}>
                      <Link 
                        href={service.href}
                        className="group flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Resources */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  PREMIUM RESOURCES
                </h3>
                <ul className="space-y-3">
                  {premiumResources.map((resource) => {
                    const Icon = resource.icon;
                    return (
                      <li key={resource.name}>
                        <Link 
                          href={resource.href}
                          className="group flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                          {resource.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Legal & Compliance */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  LEGAL & COMPLIANCE
                </h3>
                <ul className="space-y-3">
                  {legalCompliance.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="group flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Corporate Features */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4">ENTERPRISE FEATURES</h4>
                  <div className="space-y-2">
                    {corporateFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                        <span className="text-xs text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Presence */}
        <div className="mt-16 pt-12 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-brand-teal" />
              <div>
                <h4 className="text-sm font-semibold">GLOBAL PRESENCE</h4>
                <p className="text-xs text-gray-400">Serving clients across North America, Europe, Asia-Pacific, and MENA regions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">50+</div>
                <div className="text-xs text-gray-400">Enterprise Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">24/7</div>
                <div className="text-xs text-gray-400">Support Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">99.9%</div>
                <div className="text-xs text-gray-400">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">ISO</div>
                <div className="text-xs text-gray-400">27001 Certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/50 border-t border-gray-800">
        <div className="wrap py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © {currentYear} FinNexus Lab Corporation. All rights reserved. |
              <span className="mx-2">•</span>
              Registered in Delhi, India |
              <span className="mx-2">•</span>
              CIN: U74999DL2024PTC123456
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500">SEBI Registered | RBI Compliant</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">SSL Encrypted</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center md:text-left">
            <p className="text-xs text-gray-500 italic">
              This platform is intended for institutional and professional use only. 
              All content is proprietary and confidential. Unauthorized distribution is prohibited.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}