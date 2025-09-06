"use client"

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Receipt,
  QrCode,
  Smartphone,
  Wallet
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Sample booked appointments
const sampleAppointments = [
  {
    id: 1,
    clientName: 'Sarah Johnson',
    phone: '(555) 123-4567',
    email: 'sarah.j@email.com',
    service: 'Eyebrow Microblading',
    duration: '2 hours',
    price: 350.00,
    scheduledTime: '10:00 AM',
    date: '2024-01-15',
    status: 'arrived',
    notes: 'First time client, wants natural look'
  },
  {
    id: 2,
    clientName: 'Mike Chen',
    phone: '(555) 987-6543',
    email: 'mike.chen@email.com',
    service: 'Lip Blush',
    duration: '1.5 hours',
    price: 280.00,
    scheduledTime: '2:00 PM',
    date: '2024-01-15',
    status: 'waiting',
    notes: 'Touch-up appointment'
  },
  {
    id: 3,
    clientName: 'Emily Rodriguez',
    phone: '(555) 456-7890',
    email: 'emily.r@email.com',
    service: 'Eyeliner',
    duration: '1 hour',
    price: 200.00,
    scheduledTime: '4:00 PM',
    date: '2024-01-15',
    status: 'waiting',
    notes: 'Regular client'
  }
]

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500' },
  { id: 'venmo', name: 'Venmo', icon: Smartphone, color: 'bg-purple-500' },
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-yellow-500' },
  { id: 'zelle', name: 'Zelle', icon: Smartphone, color: 'bg-indigo-500' }
]

export default function POSPage() {
  const [appointments, setAppointments] = useState(sampleAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [tipAmount, setTipAmount] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const filteredAppointments = appointments.filter(apt =>
    apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax + tipAmount

  const addToCart = (appointment: any) => {
    const cartItem = {
      id: appointment.id,
      name: appointment.service,
      price: appointment.price,
      client: appointment.clientName
    }
    setCart([...cart, cartItem])
    setSelectedAppointment(appointment)
  }

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const processPayment = () => {
    // Simulate payment processing
    alert(`Payment of $${total.toFixed(2)} processed successfully via ${selectedPaymentMethod}!`)
    setCart([])
    setTipAmount(0)
    setCustomTip('')
    setShowPaymentModal(false)
    
    // Update appointment status
    if (selectedAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'completed' }
          : apt
      ))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'arrived':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Arrived</Badge>
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Waiting</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Point of Sale</h1>
            <p className="text-muted">Process payments for booked appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Receipts
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>Select an appointment to process payment</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAppointment?.id === appointment.id 
                          ? 'border-lavender bg-lavender/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{appointment.clientName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>${appointment.price}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{appointment.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(appointment.status)}
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(appointment)
                            }}
                            disabled={appointment.status === 'completed'}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart & Payment */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 sticky top-4">
              <CardHeader>
                <CardTitle>Cart & Payment</CardTitle>
                <CardDescription>Review and process payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items in cart</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.client}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${item.price}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>${tipAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Tip Options */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <Label>Add Tip</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 18, 20].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          size="sm"
                          onClick={() => setTipAmount(subtotal * (percent / 100))}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Custom tip"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        onBlur={() => {
                          const custom = parseFloat(customTip) || 0
                          setTipAmount(custom)
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const custom = parseFloat(customTip) || 0
                          setTipAmount(custom)
                        }}
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className="flex items-center gap-2"
                        >
                          <method.icon className="h-4 w-4" />
                          <span className="text-xs">{method.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process Payment Button */}
                {cart.length > 0 && selectedPaymentMethod && (
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Process Payment - ${total.toFixed(2)}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Confirmation Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Confirm Payment</CardTitle>
                <CardDescription>Review payment details before processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Payment Method:</p>
                  <p className="font-medium">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={processPayment}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
