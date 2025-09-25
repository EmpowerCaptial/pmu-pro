"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';

interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
  depositPercentage?: number; // Default deposit percentage
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface BookingData {
  service: Service | null;
  date: Date | null;
  timeSlot: string;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
  };
  depositAmount: number;
  totalAmount: number;
  remainingAmount: number;
}

export default function PublicBookingPage({ params }: { params: { handle: string } }) {
  const [currentStep, setCurrentStep] = useState<'service' | 'datetime' | 'client' | 'payment' | 'confirmation'>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: null,
    timeSlot: '',
    clientInfo: { name: '', email: '', phone: '' },
    depositAmount: 0,
    totalAmount: 0,
    remainingAmount: 0
  });

  // Load services and availability
  useEffect(() => {
    loadServices();
    loadAvailableDates();
  }, [params.handle]);

  // Load time slots when date is selected
  useEffect(() => {
    if (bookingData.date) {
      loadTimeSlots(bookingData.date);
    }
  }, [bookingData.date]);

  // Calculate deposit when service changes
  useEffect(() => {
    if (bookingData.service) {
      const depositPercentage = bookingData.service.depositPercentage || 0.3; // Default 30%
      const depositAmount = Math.round(bookingData.service.price * depositPercentage);
      const remainingAmount = bookingData.service.price - depositAmount;
      
      setBookingData(prev => ({
        ...prev,
        depositAmount,
        totalAmount: bookingData.service!.price,
        remainingAmount
      }));
    }
  }, [bookingData.service]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services`, {
        headers: {
          'x-user-email': 'universalbeautystudioacademy@gmail.com', // Demo user
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeServices = data.services?.filter((s: any) => s.isActive) || [];
        setServices(activeServices.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.defaultPrice || 0,
          durationMinutes: s.defaultDuration || 120,
          description: s.description,
          depositPercentage: s.depositPercentage || 0.3
        })));
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = () => {
    // Generate available dates for the next 30 days
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      // Skip Sundays (assuming artist doesn't work Sundays)
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  };

  const loadTimeSlots = async (date: Date) => {
    // Generate time slots for the selected date
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const timeString30 = `${hour.toString().padStart(2, '0')}:30`;
      
      // Check if slot is available (mock logic - in real app, check against existing appointments)
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      
      slots.push(
        { time: timeString, available: isAvailable },
        { time: timeString30, available: isAvailable }
      );
    }
    
    setTimeSlots(slots);
  };

  const handleServiceSelect = (service: Service) => {
    setBookingData(prev => ({ ...prev, service }));
    setCurrentStep('datetime');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingData(prev => ({ ...prev, date }));
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    setBookingData(prev => ({ ...prev, timeSlot }));
    setCurrentStep('client');
  };

  const handleClientInfoChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, [field]: value }
    }));
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      
      // Create appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'universalbeautystudioacademy@gmail.com'
        },
        body: JSON.stringify({
          clientName: bookingData.clientInfo.name,
          clientEmail: bookingData.clientInfo.email,
          clientPhone: bookingData.clientInfo.phone,
          service: bookingData.service!.name,
          date: bookingData.date!.toISOString().split('T')[0],
          time: bookingData.timeSlot,
          duration: bookingData.service!.durationMinutes,
          price: bookingData.totalAmount,
          deposit: bookingData.depositAmount,
          status: 'pending_deposit'
        })
      });

      if (appointmentResponse.ok) {
        const appointment = await appointmentResponse.json();
        
        // Create deposit payment
        const depositResponse = await fetch('/api/deposit-payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': 'universalbeautystudioacademy@gmail.com'
          },
          body: JSON.stringify({
            clientId: appointment.clientId,
            appointmentId: appointment.id,
            amount: bookingData.depositAmount,
            totalAmount: bookingData.totalAmount,
            currency: 'USD',
            notes: `Deposit for ${bookingData.service!.name} appointment`
          })
        });

        if (depositResponse.ok) {
          const depositData = await depositResponse.json();
          setCurrentStep('payment');
          
          // Redirect to Stripe checkout
          window.location.href = depositData.checkoutUrl;
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const isDateDisabled = (date: Date) => {
    return !isDateAvailable(date) || isBefore(date, new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Book Your Appointment</h1>
          <p className="text-muted-text">Select your service and preferred date/time</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['service', 'datetime', 'client', 'payment', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-lavender text-white' : 
                  ['service', 'datetime', 'client', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {['service', 'datetime', 'client', 'payment', 'confirmation'].indexOf(currentStep) > index ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div className={`w-8 h-0.5 ${
                    ['service', 'datetime', 'client', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Step 1: Service Selection */}
            {currentStep === 'service' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Your Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-lavender/20"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender">
                            ${service.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Duration: {Math.round(service.durationMinutes / 60)}h
                        </p>
                        {service.description && (
                          <p className="text-sm text-gray-500">{service.description}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Deposit:</span> ${Math.round(service.price * (service.depositPercentage || 0.3))}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Due day of:</span> ${Math.round(service.price * (1 - (service.depositPercentage || 0.3)))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 'datetime' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <h3 className="font-medium mb-3">Choose Date</h3>
                    <Calendar
                      mode="single"
                      selected={bookingData.date || undefined}
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-medium mb-3">Available Times</h3>
                    {bookingData.date ? (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={slot.available ? "outline" : "secondary"}
                            disabled={!slot.available}
                            onClick={() => slot.available && handleTimeSelect(slot.time)}
                            className={`text-sm ${
                              bookingData.timeSlot === slot.time ? 'bg-lavender text-white' : ''
                            }`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Please select a date first</p>
                    )}
                  </div>
                </div>

                {bookingData.date && bookingData.timeSlot && (
                  <div className="mt-6 p-4 bg-lavender/10 rounded-lg">
                    <h3 className="font-medium mb-2">Selected Appointment</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm"><strong>Service:</strong> {bookingData.service?.name}</p>
                        <p className="text-sm"><strong>Date:</strong> {format(bookingData.date, 'PPP')}</p>
                        <p className="text-sm"><strong>Time:</strong> {bookingData.timeSlot}</p>
                      </div>
                      <Button onClick={() => setCurrentStep('client')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Client Information */}
            {currentStep === 'client' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={bookingData.clientInfo.name}
                      onChange={(e) => handleClientInfoChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.clientInfo.email}
                      onChange={(e) => handleClientInfoChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={bookingData.clientInfo.phone}
                      onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Service: {bookingData.service?.name}</span>
                      <span>${bookingData.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit (30%)</span>
                      <span>${bookingData.depositAmount}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Due on appointment day</span>
                      <span>${bookingData.remainingAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('datetime')}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleBookingSubmit}
                    disabled={!bookingData.clientInfo.name || !bookingData.clientInfo.email || !bookingData.clientInfo.phone || loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Pay Deposit & Book
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Processing */}
            {currentStep === 'payment' && (
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-lavender" />
                <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                <p className="text-gray-600">Redirecting to secure payment...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}