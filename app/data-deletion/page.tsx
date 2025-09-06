"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Shield, 
  Database,
  Clock,
  User,
  Calendar,
  CreditCard,
  MessageSquare
} from "lucide-react";

export default function DataDeletionPage() {
  const [formData, setFormData] = useState({
    email: '',
    reason: '',
    confirmation: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          reason: formData.reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }

      const result = await response.json();
      console.log('Deletion request submitted:', result);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      alert('Failed to submit deletion request. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted</h1>
              <p className="text-lg text-gray-700 mb-6">
                Your data deletion request has been submitted successfully.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <p className="text-green-800">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-green-700 text-sm mt-2 space-y-1">
                  <li>• We'll verify your identity within 24 hours</li>
                  <li>• Your data will be permanently deleted within 30 days</li>
                  <li>• You'll receive a confirmation email when complete</li>
                  <li>• Some data may be retained for legal compliance</li>
                </ul>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-lavender hover:bg-lavender-600 text-white"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-ink">Data Deletion Request</h1>
          </div>
          <p className="text-xl text-muted">Request permanent deletion of your personal data</p>
          <Badge className="mt-4 bg-red-100 text-red-800">
            Facebook App Review Compliant
          </Badge>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-semibold mb-2">
                This action cannot be undone. Please read the following information carefully:
              </p>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• All your personal data will be permanently deleted</li>
                <li>• Your account will be deactivated immediately</li>
                <li>• You will lose access to all PMU Pro services</li>
                <li>• Some data may be retained for legal compliance</li>
                <li>• This process may take up to 30 days to complete</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* What Data Will Be Deleted */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-lavender" />
              Data That Will Be Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <User className="h-4 w-4 text-lavender" />
                    <span>Profile and personal details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-lavender" />
                    <span>Email addresses and contact info</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-lavender" />
                    <span>Appointment history and bookings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-lavender" />
                    <span>Payment and billing information</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Data</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-lavender" />
                    <span>Messages and communications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-lavender" />
                    <span>Login credentials and sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-lavender" />
                    <span>Usage analytics and preferences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-lavender" />
                    <span>Activity logs and timestamps</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Integration Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-lavender" />
              Facebook/Instagram Integration Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Meta Integration Data</h3>
              <p className="text-blue-800 text-sm mb-3">
                If you've connected your Facebook/Instagram accounts, the following data will also be deleted:
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Facebook Page access tokens</li>
                <li>• Instagram Business Account information</li>
                <li>• Page and account IDs</li>
                <li>• AI response suggestions and preferences</li>
                <li>• Integration settings and configurations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Notice */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-lavender" />
              Data Retention for Legal Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-semibold mb-2">
                Some data may be retained for legal compliance:
              </p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Financial records (for tax and accounting purposes)</li>
                <li>• Legal documents and contracts</li>
                <li>• Security logs (for fraud prevention)</li>
                <li>• Data required by law enforcement</li>
                <li>• Backup data (deleted within 90 days)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Request Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-lavender" />
              Submit Deletion Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-800 font-semibold">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter the email associated with your account"
                  className="mt-2 bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  We'll use this to verify your identity and send confirmation
                </p>
              </div>

              <div>
                <Label htmlFor="reason" className="text-gray-800 font-semibold">
                  Reason for Deletion (Optional)
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Tell us why you're requesting data deletion..."
                  className="mt-2 bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20"
                  rows={4}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirmation"
                    checked={formData.confirmation}
                    onChange={(e) => setFormData({...formData, confirmation: e.target.checked})}
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="confirmation" className="text-gray-800 font-semibold">
                    I understand that this action is permanent and cannot be undone
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mt-2 ml-6">
                  By checking this box, you confirm that you want to permanently delete all your data 
                  from PMU Pro and understand the consequences of this action.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!formData.email || !formData.confirmation || isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Submit Deletion Request
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Alternative Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-lavender" />
              Alternative Contact Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Requests</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Data Deletion:</strong> deletion@thepmuguide.com</li>
                  <li>• <strong>Privacy Questions:</strong> privacy@thepmuguide.com</li>
                  <li>• <strong>General Support:</strong> support@thepmuguide.com</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Time</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Verification:</strong> Within 24 hours</li>
                  <li>• <strong>Deletion Process:</strong> Within 30 days</li>
                  <li>• <strong>Confirmation:</strong> Email notification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-lavender" />
              Legal Rights and Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Your Rights</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Right to be forgotten (GDPR Article 17)</li>
                  <li>• Right to data portability (GDPR Article 20)</li>
                  <li>• Right to erasure (CCPA Section 1798.105)</li>
                  <li>• Right to opt-out of data processing</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Facebook App Review Compliance</h3>
                <p className="text-blue-800 text-sm">
                  This data deletion process complies with Facebook's App Review requirements 
                  and provides users with a clear, accessible way to request data deletion 
                  as required by Facebook's Platform Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>© 2025 PMU Pro. All rights reserved.</p>
          <p className="mt-2">
            This data deletion process complies with GDPR, CCPA, and Facebook App Review requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
