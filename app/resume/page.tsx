import { Metadata } from 'next';
import HeroBackground from '@/components/ui/HeroBackground';
import ResumeActions from './ResumeActions';

export const metadata: Metadata = {
  title: 'Resume | FinNexus Lab',
  description: 'Professional resume and CV for FinNexus Lab founder and research analyst.',
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 print:pt-0">
      {/* ✅ Client Component */}
      <ResumeActions />

      {/* Resume Content */}
      <div className="wrap py-10">
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg print:border-0 print:rounded-none print:shadow-none max-w-5xl mx-auto">

            {/* Header */}
            <header className="relative bg-brand-navy px-10 py-10 text-white overflow-hidden">
              <HeroBackground />
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-1">
                  Your Full Name Here
                </h1>
                <p className="text-brand-teal font-medium mb-4">
                  Finance & Business Analytics Professional
                </p>

                <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                  <span>📧 your@email.com</span>
                  <span>🔗 linkedin.com/in/your-profile</span>
                  <span>🌐 finnexuslab.com</span>
                  <span>📍 Your City, India</span>
                </div>
              </div>
            </header>

            {/* Body */}
            <div className="p-10 grid md:grid-cols-3 gap-10">

              {/* LEFT */}
              <div className="md:col-span-2 space-y-8">

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Professional Summary
                  </h2>
                  <p className="text-brand-slate leading-relaxed">
                    Passionate finance professional with expertise in financial analysis, business intelligence, and data-driven decision making. Proven track record of delivering actionable insights that drive growth and operational efficiency. Strong background in financial modeling, market research, and strategic planning across fintech, e-commerce, and consulting sectors.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Work Experience
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg">FinNexus Lab</h3>
                        <span className="text-brand-teal font-medium">2023 – Present</span>
                      </div>
                      <p className="text-gray-700 mb-2">Founder & Lead Analyst</p>
                      <ul className="text-brand-slate space-y-1 list-disc pl-5">
                        <li>Built a financial research platform serving 500+ monthly users</li>
                        <li>Published 20+ data-driven reports on fintech, quick commerce, and SaaS markets</li>
                        <li>Developed interactive financial calculators used by 100+ businesses</li>
                        <li>Led client consulting projects improving financial processes by 40%</li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg">ABC Consulting</h3>
                        <span className="text-brand-teal font-medium">2021 – 2023</span>
                      </div>
                      <p className="text-gray-700 mb-2">Senior Financial Analyst</p>
                      <ul className="text-brand-slate space-y-1 list-disc pl-5">
                        <li>Conducted due diligence for 10+ M&A deals worth $50M+</li>
                        <li>Built DCF and LBO models for portfolio companies</li>
                        <li>Automated reporting dashboards reducing manual work by 60%</li>
                        <li>Presented findings to C-suite executives and board members</li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg">FinTech Startup</h3>
                        <span className="text-brand-teal font-medium">2019 – 2021</span>
                      </div>
                      <p className="text-gray-700 mb-2">Business Intelligence Associate</p>
                      <ul className="text-brand-slate space-y-1 list-disc pl-5">
                        <li>Designed real-time KPI dashboards for leadership team</li>
                        <li>Analyzed customer LTV and cohort retention trends</li>
                        <li>Built predictive models for churn and conversion rates</li>
                        <li>Collaborated with engineering to implement data pipelines</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Key Projects
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold">India Quick Commerce Market Analysis</h3>
                      <p className="text-brand-slate">Comprehensive research report analyzing unit economics, competitive landscape, and growth projections for India's $5B quick commerce sector.</p>
                    </div>
                    <div>
                      <h3 className="font-bold">SaaS Financial Model Builder</h3>
                      <p className="text-brand-slate">Interactive tool that helps SaaS founders project revenue, CAC, LTV, and runway. Used by 200+ startups.</p>
                    </div>
                    <div>
                      <h3 className="font-bold">Autonomous Workforce ROI Calculator</h3>
                      <p className="text-brand-slate">Financial model quantifying the impact of AI automation on operational costs and productivity gains.</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT */}
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Core Skills
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-800">Financial Analysis</h3>
                      <p className="text-sm text-gray-600">DCF, LBO, 3‑Statement Modeling, Valuation, M&A Due Diligence</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Data & BI</h3>
                      <p className="text-sm text-gray-600">SQL, Python, Power BI, Tableau, Looker, Statistical Analysis</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Business Strategy</h3>
                      <p className="text-sm text-gray-600">Market Sizing, Go‑to‑Market, Competitive Analysis, OKR Planning</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Tools & Tech</h3>
                      <p className="text-sm text-gray-600">Excel, Google Sheets, R, JavaScript, Next.js, Git, AWS</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Education
                  </h2>
                  <div>
                    <h3 className="font-bold">MBA in Finance</h3>
                    <p className="text-gray-700">Top Business School</p>
                    <p className="text-sm text-gray-600">Graduated: 2019 | GPA: 3.8/4.0</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold">B.Tech in Computer Science</h3>
                    <p className="text-gray-700">Engineering College</p>
                    <p className="text-sm text-gray-600">Graduated: 2017 | GPA: 3.6/4.0</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Certifications
                  </h2>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-brand-teal mr-2">•</span>
                      <span>CFA Level II Candidate</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-brand-teal mr-2">•</span>
                      <span>Google Data Analytics Professional</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-brand-teal mr-2">•</span>
                      <span>AWS Cloud Practitioner</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-brand-teal mr-2">•</span>
                      <span>Financial Modeling & Valuation (FMVA)</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-brand-navy mb-4">
                    Languages
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>English</span>
                      <span className="text-gray-600">Fluent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hindi</span>
                      <span className="text-gray-600">Native</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spanish</span>
                      <span className="text-gray-600">Intermediate</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}