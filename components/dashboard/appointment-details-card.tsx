"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle,
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
      }
    } catch (error) {
      console.error('Error loading deposit payments:', error);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDepositStatus = (appointmentId: string) => {
    return depositPayments.find(dp => dp.id === appointmentId);
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
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appointment) => {
              const depositInfo = getDepositStatus(appointment.id);
              const remainingAmount = appointment.price - appointment.deposit;
              
              return (
                <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                  {/* Client Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lavender/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-lavender" />
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.clientName}</h3>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{Math.round(appointment.duration / 60)}h duration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>${appointment.price}</span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Status</span>
                      <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                        {appointment.paymentStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">${appointment.deposit}</div>
                        <div className="text-xs text-gray-500">Deposit</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">${remainingAmount}</div>
                        <div className="text-xs text-gray-500">Due Day Of</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">${appointment.price}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    {/* Deposit Status */}
                    {depositInfo && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Deposit Status:</span>
                        <div className="flex items-center gap-1">
                          {depositInfo.status === 'PAID' ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                          <span className={depositInfo.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>
                            {depositInfo.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{appointment.clientEmail}</span>
                    </div>
                    {appointment.clientPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {appointments.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All Appointments
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
