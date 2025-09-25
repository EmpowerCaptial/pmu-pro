"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  XCircle, 
  ArrowLeft,
  Calendar,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige p-4">
      <div className="max-w-2xl mx-auto">
        {/* Cancelled Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">Booking Cancelled</h1>
          <p className="text-muted-text">Your appointment booking was not completed</p>
        </div>

        {/* Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              What Happened?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>Your payment was cancelled or failed to process.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>No appointment has been scheduled.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>No charges have been made to your payment method.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-lavender" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>You can try booking again by clicking the button below.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>If you continue to have issues, please contact us directly.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>We're here to help you schedule your appointment.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Button>
          <Button 
            onClick={() => router.back()}
            className="bg-lavender hover:bg-lavender-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
