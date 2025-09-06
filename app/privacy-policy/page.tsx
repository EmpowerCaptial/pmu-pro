"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, Users, Mail, Calendar, CreditCard } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-lavender" />
            <h1 className="text-4xl font-bold text-ink">Privacy Policy</h1>
          </div>
          <p className="text-xl text-muted">How we protect and handle your personal information</p>
          <Badge className="mt-4 bg-green-100 text-green-800">
            Last Updated: September 6, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-lavender" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              PMU Pro ("we," "our," or "us") is committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our permanent makeup management platform and related services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              This policy applies to all users of PMU Pro, including artists, clients, and visitors to our website. 
              By using our services, you consent to the data practices described in this policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-lavender" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-lavender mt-1 flex-shrink-0" />
                  <span><strong>Account Information:</strong> Name, email address, phone number, business information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-lavender mt-1 flex-shrink-0" />
                  <span><strong>Appointment Data:</strong> Booking information, service details, client preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-lavender mt-1 flex-shrink-0" />
                  <span><strong>Payment Information:</strong> Billing details, transaction history (processed securely through Stripe)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-lavender mt-1 flex-shrink-0" />
                  <span><strong>Communication Data:</strong> Messages, emails, support requests</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Device information and IP addresses</li>
                <li>• Browser type and version</li>
                <li>• Usage patterns and preferences</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Facebook Integration Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Facebook Page access tokens (for Instagram DM management)</li>
                <li>• Instagram Business Account information</li>
                <li>• Page and account IDs for integration purposes</li>
                <li>• AI-generated response suggestions (not stored)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-lavender" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Provision</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Provide and maintain our platform</li>
                  <li>• Process appointments and bookings</li>
                  <li>• Manage client relationships</li>
                  <li>• Process payments securely</li>
                  <li>• Send appointment reminders</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Send important updates</li>
                  <li>• Provide customer support</li>
                  <li>• Share marketing communications</li>
                  <li>• Respond to inquiries</li>
                  <li>• Send payment confirmations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Facebook Integration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Connect Instagram Business accounts</li>
                  <li>• Generate AI response suggestions</li>
                  <li>• Manage Instagram DM workflows</li>
                  <li>• Provide social media insights</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Improvement</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Analyze usage patterns</li>
                  <li>• Improve our services</li>
                  <li>• Develop new features</li>
                  <li>• Ensure platform security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-lavender" />
              Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">We DO NOT sell your personal information</h3>
                <p className="text-blue-800 text-sm">
                  Your personal information is never sold to third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Limited Sharing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Service Providers:</strong> Stripe (payments), email services, hosting providers</li>
                  <li>• <strong>Facebook/Meta:</strong> Only for Instagram integration features you've authorized</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li>• <strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-lavender" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Measures</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• SSL encryption for all data transmission</li>
                  <li>• Secure database storage</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and authentication</li>
                  <li>• PCI DSS compliance for payments</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Responsibilities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Keep your login credentials secure</li>
                  <li>• Use strong, unique passwords</li>
                  <li>• Log out from shared devices</li>
                  <li>• Report suspicious activity immediately</li>
                  <li>• Keep your contact information updated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-lavender" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Access & Control</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Access your personal information</li>
                  <li>• Update or correct your data</li>
                  <li>• Download your data</li>
                  <li>• Delete your account</li>
                  <li>• Opt-out of marketing communications</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Exercise Rights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Use your account settings</li>
                  <li>• Contact us directly</li>
                  <li>• Use our data deletion tool</li>
                  <li>• Email: privacy@thepmuguide.com</li>
                  <li>• Response within 30 days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-lavender" />
              Cookies and Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                  <p className="text-sm text-gray-700">Required for basic platform functionality</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-700">Help us understand how you use our platform</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                  <p className="text-sm text-gray-700">Used for personalized advertising (optional)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-lavender" />
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                <strong>Important:</strong> Our services are not intended for children under 13 years of age. 
                We do not knowingly collect personal information from children under 13. If you believe we have 
                collected information from a child under 13, please contact us immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* International Users */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-lavender" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              applicable privacy laws, including GDPR and CCPA.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last Updated" date. Your continued use 
              of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-lavender" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Questions</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email: privacy@thepmuguide.com</li>
                  <li>• Data Protection Officer: dpo@thepmuguide.com</li>
                  <li>• Response time: Within 30 days</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">General Support</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email: support@thepmuguide.com</li>
                  <li>• Website: thepmuguide.com</li>
                  <li>• Business hours: 9 AM - 6 PM EST</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>© 2025 PMU Pro. All rights reserved.</p>
          <p className="mt-2">
            This Privacy Policy is effective as of September 6, 2025, and complies with 
            Facebook App Review requirements and applicable privacy laws.
          </p>
        </div>
      </div>
    </div>
  );
}
