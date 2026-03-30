import { Shield, Lock, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="wrap py-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Shield className="w-12 h-12 text-brand-teal" />
            <div>
              <span className="section-label">Legal & Compliance</span>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">Privacy Policy</h1>
              <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-brand-teal mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Data Protection</h3>
                  <p className="text-sm text-gray-600 mt-1">Enterprise-grade encryption and security protocols</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-brand-teal mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Transparency</h3>
                  <p className="text-sm text-gray-600 mt-1">Clear disclosure of data collection and usage</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-brand-teal mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Compliance</h3>
                  <p className="text-sm text-gray-600 mt-1">GDPR, CCPA, and global privacy regulations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
              <p className="text-gray-700 mb-6">
                FinNexus Lab Corporation is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our corporate intelligence platform and related services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Professional Information</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Name, job title, and company affiliation</li>
                    <li>Professional contact information</li>
                    <li>Institutional credentials and access permissions</li>
                    <li>Usage data and platform interaction metrics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Technical Data</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>IP addresses and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Usage patterns and platform analytics</li>
                    <li>Security logs and access records</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-6">
                We use collected information to provide, maintain, and improve our services; 
                to communicate with you about platform updates, security alerts, and support; 
                to ensure compliance with regulatory requirements; and to protect the security 
                and integrity of our platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement enterprise-grade security measures including encryption, 
                access controls, regular security audits, and compliance with ISO 27001 
                standards. All data is stored in secure, SOC 2 Type II compliant facilities.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights</h2>
              <p className="text-gray-700 mb-6">
                Depending on your jurisdiction, you may have rights to access, correct, 
                delete, or restrict processing of your personal data. To exercise these 
                rights, contact our Data Protection Officer at dpo@finnexuslab.com.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer:</strong> privacy@finnexuslab.com<br />
                  <strong>Legal Department:</strong> legal@finnexuslab.com<br />
                  <strong>Corporate Address:</strong> 123 Connaught Place, New Delhi, Delhi 110001, India
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="btn-secondary">Terms of Service</Link>
              <Link href="/cookies" className="btn-secondary">Cookie Policy</Link>
              <Link href="/gdpr" className="btn-secondary">GDPR Compliance</Link>
              <Link href="/security" className="btn-secondary">Security Standards</Link>
              <Link href="/" className="btn-primary">Return to Platform</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}