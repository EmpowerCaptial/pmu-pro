"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useDemoAuth } from '@/hooks/use-demo-auth';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  deposit: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface DepositPayment {
  id: string;
  amount: number;
  totalAmount: number;
  remainingAmount: number;
  status: string;
  paidAt?: string;
  depositLink: string;
}

export function AppointmentDetailsCard() {
  const { currentUser } = useDemoAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [depositPayments, setDepositPayments] = useState<DepositPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      loadAppointments();
      loadDepositPayments();
    }
  }, [currentUser]);

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'x-user-email': currentUser?.email || '',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    }
  };

  const loadDepositPayments = async () => {
    try {
      const response = await fetch('/api/deposit-payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepositPayments(data.depositPayments || []);
      } else {
        // Silently handle 401 - user not authenticated or no deposits
        setDepositPayments([]);
      }
    } catch (error) {
      // Silently fail - don't spam console
      setDepositPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_deposit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-lavender mr-2" />
            <span>Loading appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-lavender" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No appointments scheduled</p>
            <p className="text-sm">Appointments will appear here when clients book</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 8).map((appointment) => {
              const appointmentDate = new Date(appointment.date);
              const isToday = appointmentDate.toDateString() === new Date().toDateString();
              const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
              
              return (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-colors">
                  {/* Client Info & Time */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-lavender/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-lavender" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{appointment.clientName}</h3>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs px-2 py-0.5`}>
                          {appointment.status === 'pending_deposit' ? 'Pending' : appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">
                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(appointmentDate, 'MMM dd')} • {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Procedure & Cost */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {appointment.service}
                    </div>
                    <div className="text-sm font-semibold text-lavender">
                      ${appointment.price}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {appointments.length > 8 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-lavender hover:text-lavender-600">
                  View All ({appointments.length - 8} more)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
