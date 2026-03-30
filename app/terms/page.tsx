import { FileText, Scale, Gavel, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="wrap py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Scale className="w-12 h-12 text-brand-teal" />
            <div>
              <span className="section-label">Legal & Compliance</span>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">Terms of Service</h1>
              <p className="text-gray-600 mt-2">Effective: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing or using the FinNexus Lab platform, you agree to be bound by these Terms of Service.
                If you disagree with any part of the terms, you may not access the platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Professional Use Only</h2>
              <p className="text-gray-700 mb-6">
                This platform is intended for professional, institutional, and corporate use only.
                Individual consumers may not use the platform for personal financial advice or decision-making.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                All content, data, analytics, and research provided through the platform are proprietary
                intellectual property of FinNexus Lab Corporation. Unauthorized reproduction, distribution,
                or commercial use is strictly prohibited.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Disclaimer of Liability</h2>
              <p className="text-gray-700 mb-6">
                The platform provides financial intelligence and research for informational purposes only.
                It does not constitute financial advice, investment recommendations, or guarantees of any kind.
                Users assume all risk associated with their use of the information provided.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These Terms shall be governed by the laws of the State of Delaware, United States,
                without regard to its conflict of law provisions.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="btn-secondary">Privacy Policy</Link>
              <Link href="/cookies" className="btn-secondary">Cookie Policy</Link>
              <Link href="/gdpr" className="btn-secondary">GDPR Compliance</Link>
              <Link href="/" className="btn-primary">Return to Platform</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}