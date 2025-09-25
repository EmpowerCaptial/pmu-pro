"use client";

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  ArrowLeft
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface AppointmentData {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  deposit: number;
  status: string;
}

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const depositId = searchParams.get('deposit');
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (depositId) {
      loadAppointmentData(depositId);
    }
  }, [depositId]);

  const loadAppointmentData = async (depositId: string) => {
    try {
      // In a real app, you'd fetch this from your API
      // For now, we'll simulate the data
      setAppointment({
        id: 'apt-123',
        clientName: 'Client Name',
        clientEmail: 'client@example.com',
        service: 'Microblading',
        date: '2024-02-15',
        time: '10:00',
        duration: 120,
        price: 300,
        deposit: 90,
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error loading appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Appointment Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find your appointment details.</p>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingAmount = appointment.price - appointment.deposit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige p-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">Appointment Confirmed!</h1>
          <p className="text-muted-text">Your deposit has been processed successfully</p>
        </div>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-sm text-gray-600">{appointment.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-gray-600">{format(new Date(appointment.date), 'PPP')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Service</span>
                <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender">
                  {appointment.service}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm">{Math.round(appointment.duration / 60)} hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-lavender" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Service Cost</span>
                <span className="font-medium">${appointment.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Paid</span>
                <span className="text-green-600 font-medium">-${appointment.deposit}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Remaining Balance</span>
                  <span className="font-bold text-lg">${remainingAmount}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Due on appointment day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>You will receive a confirmation email with all appointment details.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>Please arrive 15 minutes early for your appointment.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>The remaining balance of ${remainingAmount} is due on the day of your appointment.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
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
            onClick={() => window.print()}
            className="bg-lavender hover:bg-lavender-600"
          >
            Print Confirmation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
