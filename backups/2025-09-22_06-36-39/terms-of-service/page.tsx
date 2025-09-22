"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Mail,
  Database,
  Lock,
  Eye
} from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-lavender" />
            <h1 className="text-4xl font-bold text-ink">Terms of Service</h1>
          </div>
          <p className="text-xl text-muted">Terms and conditions for using PMU Pro</p>
          <Badge className="mt-4 bg-blue-100 text-blue-800">
            Last Updated: September 6, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-lavender" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Welcome to PMU Pro ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of 
              our permanent makeup management platform and related services (collectively, the "Service"). 
              By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-blue-800 font-semibold">
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                PMU Pro is a comprehensive platform designed for permanent makeup artists to manage their 
                business operations, including but not limited to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lavender" />
                      <span>Appointment scheduling and management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-lavender" />
                      <span>Client relationship management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-lavender" />
                      <span>Payment processing and billing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-lavender" />
                      <span>Business analytics and reporting</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-lavender" />
                      <span>Facebook/Instagram DM management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lavender" />
                      <span>External calendar synchronization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-lavender" />
                      <span>Email marketing and notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-lavender" />
                      <span>Client portal and progress tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-lavender" />
              User Accounts and Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• You must provide accurate and complete information when creating an account</li>
                  <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>• You must be at least 18 years old to create an account</li>
                  <li>• One person or entity may not maintain multiple accounts</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• You are responsible for all activities that occur under your account</li>
                  <li>• You must notify us immediately of any unauthorized use</li>
                  <li>• We are not liable for any loss arising from unauthorized account use</li>
                  <li>• You must use strong, unique passwords</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-lavender" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Permitted Uses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Use the Service for legitimate business purposes</li>
                  <li>• Comply with all applicable laws and regulations</li>
                  <li>• Respect the rights and privacy of others</li>
                  <li>• Use the Service in accordance with these Terms</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prohibited Uses</h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 font-semibold mb-2">You may NOT:</p>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Use the Service for any illegal or unauthorized purpose</li>
                    <li>• Violate any laws in your jurisdiction</li>
                    <li>• Transmit any harmful, threatening, or offensive content</li>
                    <li>• Attempt to gain unauthorized access to our systems</li>
                    <li>• Interfere with or disrupt the Service</li>
                    <li>• Use automated systems to access the Service without permission</li>
                    <li>• Share your account credentials with others</li>
                    <li>• Use the Service to compete with us</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-lavender" />
              Payment Terms and Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Processing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Payments are processed securely through Stripe</li>
                  <li>• All prices are in USD unless otherwise specified</li>
                  <li>• You authorize us to charge your payment method for all fees</li>
                  <li>• Payment information is encrypted and stored securely</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deposit Payments</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Deposit payments secure appointment bookings</li>
                  <li>• Deposits are non-refundable unless otherwise specified</li>
                  <li>• Remaining balances are due on the day of service</li>
                  <li>• Payment links expire after 7 days</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Refunds and Cancellations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Refunds are processed according to our refund policy</li>
                  <li>• Cancellation policies vary by service type</li>
                  <li>• Refunds may take 5-10 business days to process</li>
                  <li>• Contact support for refund requests</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Integration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-lavender" />
              Facebook/Instagram Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Meta Platform Integration</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Our Service integrates with Facebook and Instagram platforms to provide enhanced 
                  social media management capabilities.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Integration requires your explicit consent</li>
                  <li>• We only access data necessary for Service functionality</li>
                  <li>• Your Facebook/Instagram data is handled according to Meta's policies</li>
                  <li>• You can revoke access at any time</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Response Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• AI-generated responses are suggestions only</li>
                  <li>• You are responsible for all content you send</li>
                  <li>• AI responses do not guarantee accuracy or appropriateness</li>
                  <li>• You must review all AI suggestions before sending</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-lavender" />
              Intellectual Property Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Content</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• The Service and its content are owned by PMU Pro</li>
                  <li>• All trademarks, logos, and service marks are our property</li>
                  <li>• You may not copy, modify, or distribute our content without permission</li>
                  <li>• Unauthorized use may result in legal action</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Content</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• You retain ownership of content you upload to the Service</li>
                  <li>• You grant us a license to use your content to provide the Service</li>
                  <li>• You are responsible for ensuring you have rights to your content</li>
                  <li>• We may remove content that violates these Terms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-lavender" />
              Privacy and Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Your privacy is important to us. Our collection and use of personal information 
                is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Collection</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• We collect only necessary information</li>
                    <li>• Data is used to provide and improve our Service</li>
                    <li>• We implement appropriate security measures</li>
                    <li>• You have control over your personal data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Access and update your information</li>
                    <li>• Request data deletion</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Export your data</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-lavender" />
              Service Availability and Modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>• Scheduled maintenance will be announced in advance</li>
                  <li>• Emergency maintenance may occur without notice</li>
                  <li>• We are not liable for service interruptions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Modifications</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• We may modify or discontinue features at any time</li>
                  <li>• We will provide reasonable notice of significant changes</li>
                  <li>• Continued use constitutes acceptance of changes</li>
                  <li>• You may terminate your account if you disagree with changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-lavender" />
              Account Termination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by You</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• You may terminate your account at any time</li>
                  <li>• Termination requests should be submitted through our support system</li>
                  <li>• Data deletion requests are processed within 30 days</li>
                  <li>• Some data may be retained for legal compliance</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by Us</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• We may terminate accounts that violate these Terms</li>
                  <li>• We may suspend accounts for investigation purposes</li>
                  <li>• We will provide notice before termination when possible</li>
                  <li>• Termination does not relieve you of payment obligations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-lavender" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Service Disclaimers</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• The Service is provided "as is" without warranties</li>
                  <li>• We do not guarantee error-free operation</li>
                  <li>• We are not responsible for third-party integrations</li>
                  <li>• Results may vary based on individual usage</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Limitation of Liability</h3>
                <p className="text-red-700 text-sm">
                  To the maximum extent permitted by law, PMU Pro shall not be liable for any 
                  indirect, incidental, special, or consequential damages arising from your 
                  use of the Service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-lavender" />
              Governing Law and Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by the laws of the State of Delaware, United States, 
                  without regard to conflict of law principles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• We encourage resolving disputes through direct communication</li>
                  <li>• Formal disputes will be resolved through binding arbitration</li>
                  <li>• Arbitration will be conducted in Delaware</li>
                  <li>• You waive the right to participate in class action lawsuits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may update these Terms from time to time. We will notify you of any material 
                changes by posting the new Terms on this page and updating the "Last Updated" date.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  <strong>Your continued use of the Service after any changes constitutes 
                  acceptance of the updated Terms.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-lavender" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">General Support</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email: support@thepmuguide.com</li>
                  <li>• Website: thepmuguide.com</li>
                  <li>• Business hours: 9 AM - 6 PM EST</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Inquiries</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email: legal@thepmuguide.com</li>
                  <li>• Privacy: privacy@thepmuguide.com</li>
                  <li>• Data deletion: deletion@thepmuguide.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>© 2025 PMU Pro. All rights reserved.</p>
          <p className="mt-2">
            These Terms of Service are effective as of September 6, 2025, and comply with 
            Facebook App Review requirements and applicable laws.
          </p>
        </div>
      </div>
    </div>
  );
}
