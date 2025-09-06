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
  Wallet,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles
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
    notes: 'First time client, wants natural look',
    avatar: 'SJ'
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
    notes: 'Touch-up appointment',
    avatar: 'MC'
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
    notes: 'Regular client',
    avatar: 'ER'
  }
]

const paymentMethods = [
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'venmo', name: 'Venmo', icon: Smartphone, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'zelle', name: 'Zelle', icon: Smartphone, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' }
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
      client: appointment.clientName,
      avatar: appointment.avatar
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
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1"><CheckCircle className="h-3 w-3 mr-1" />Arrived</Badge>
      case 'waiting':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1"><Clock className="h-3 w-3 mr-1" />Waiting</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1"><Zap className="h-3 w-3 mr-1" />In Progress</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return null
    }
  }

  const getAvatarColor = (avatar: string) => {
    const colors = ['bg-gradient-to-br from-pink-500 to-rose-500', 'bg-gradient-to-br from-blue-500 to-indigo-500', 'bg-gradient-to-br from-green-500 to-emerald-500', 'bg-gradient-to-br from-purple-500 to-violet-500', 'bg-gradient-to-br from-orange-500 to-amber-500']
    const index = avatar.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-lavender to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
                <p className="text-sm text-gray-500">Process payments for appointments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Appointments List */}
          <div className="xl:col-span-2">
            <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-lavender" />
                      Today's Appointments
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      {filteredAppointments.length} appointments scheduled
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-gray-200 focus:border-lavender focus:ring-lavender/20"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-200">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)] overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {filteredAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-6 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group ${
                        selectedAppointment?.id === appointment.id 
                          ? 'bg-lavender/5 border-l-4 border-lavender' 
                          : ''
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl ${getAvatarColor(appointment.avatar)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                            {appointment.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{appointment.clientName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{appointment.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">${appointment.price}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 font-medium">{appointment.service}</p>
                            <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(appointment.status)}
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(appointment)
                            }}
                            disabled={appointment.status === 'completed'}
                            className="bg-lavender hover:bg-lavender-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
          <div className="xl:col-span-1">
            <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-lavender" />
                  Cart & Payment
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Review and process payment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 h-[calc(100%-5rem)] overflow-y-auto">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Receipt className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No items in cart</p>
                      <p className="text-sm text-gray-400">Select an appointment to add to cart</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${getAvatarColor(item.avatar)} flex items-center justify-center text-white font-semibold text-xs`}>
                            {item.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">{item.client}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">${item.price}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8%):</span>
                      <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tip:</span>
                      <span className="font-semibold text-gray-900">${tipAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-lavender">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Tip Options */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Add Tip</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 18, 20].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          size="sm"
                          onClick={() => setTipAmount(subtotal * (percent / 100))}
                          className="border-gray-200 hover:border-lavender hover:bg-lavender/5"
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
                        className="border-gray-200 focus:border-lavender focus:ring-lavender/20"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const custom = parseFloat(customTip) || 0
                          setTipAmount(custom)
                        }}
                        className="border-gray-200 hover:border-lavender hover:bg-lavender/5"
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`flex items-center gap-2 h-12 ${
                            selectedPaymentMethod === method.id 
                              ? 'bg-lavender hover:bg-lavender-600 text-white' 
                              : `${method.bgColor} ${method.textColor} border-gray-200 hover:border-lavender`
                          }`}
                        >
                          <method.icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{method.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process Payment Button */}
                {cart.length > 0 && selectedPaymentMethod && (
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-lavender to-purple-600 hover:from-lavender-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold"
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
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Confirm Payment
              </CardTitle>
              <CardDescription>Review payment details before processing</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-semibold text-gray-900">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-lavender">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Payment Method:</p>
                <p className="font-semibold text-gray-900">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={processPayment}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:border-red-300 hover:bg-red-50"
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
  )
}
