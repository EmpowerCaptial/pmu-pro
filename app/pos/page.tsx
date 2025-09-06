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
  Sparkles,
  Camera,
  Edit,
  Ban,
  RefreshCw,
  FileText,
  MoreHorizontal,
  ChevronDown
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
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [actionMenuAppointment, setActionMenuAppointment] = useState<any>(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState('')

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

  const handleCheckout = (appointment: any) => {
    setActionMenuAppointment(appointment)
    setShowActionMenu(true)
  }

  const handleAction = (action: string, appointment: any) => {
    switch (action) {
      case 'checkout':
        addToCart(appointment)
        setShowActionMenu(false)
        break
      case 'markPaid':
        setAppointments(appointments.map(apt => 
          apt.id === appointment.id 
            ? { ...apt, status: 'completed' }
            : apt
        ))
        alert(`${appointment.clientName} marked as paid!`)
        setShowActionMenu(false)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${appointment.clientName}'s appointment?`)) {
          setAppointments(appointments.filter(apt => apt.id !== appointment.id))
          alert('Appointment deleted!')
        }
        setShowActionMenu(false)
        break
      case 'reschedule':
        alert('Reschedule functionality coming soon!')
        setShowActionMenu(false)
        break
      case 'takePicture':
        alert('Camera functionality coming soon!')
        setShowActionMenu(false)
        break
      case 'leaveNotes':
        setNotes(appointment.notes || '')
        setShowNotesModal(true)
        setShowActionMenu(false)
        break
      case 'cancel':
        if (confirm(`Are you sure you want to cancel ${appointment.clientName}'s appointment?`)) {
          setAppointments(appointments.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, status: 'cancelled' }
              : apt
          ))
          alert('Appointment cancelled!')
        }
        setShowActionMenu(false)
        break
      case 'noShow':
        if (confirm(`Mark ${appointment.clientName} as no-show?`)) {
          setAppointments(appointments.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, status: 'no-show' }
              : apt
          ))
          alert('Marked as no-show!')
        }
        setShowActionMenu(false)
        break
    }
  }

  const saveNotes = () => {
    if (actionMenuAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === actionMenuAppointment.id 
          ? { ...apt, notes: notes }
          : apt
      ))
      alert('Notes saved!')
      setShowNotesModal(false)
      setNotes('')
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
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1"><X className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1"><AlertCircle className="h-3 w-3 mr-1" />No Show</Badge>
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
                      className={`p-6 hover:bg-gray-50/50 transition-all duration-200 group ${
                        selectedAppointment?.id === appointment.id 
                          ? 'bg-lavender/5 border-l-4 border-lavender' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-14 h-14 rounded-xl ${getAvatarColor(appointment.avatar)} flex items-center justify-center text-white font-semibold text-lg shadow-lg`}>
                            {appointment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-gray-900 text-xl">{appointment.clientName}</h3>
                              <Button 
                                size="sm"
                                onClick={() => handleCheckout(appointment)}
                                disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                                className="bg-gradient-to-r from-lavender to-purple-600 hover:from-lavender-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1 text-sm font-semibold h-8"
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Checkout
                              </Button>
                            </div>
                            <p className="text-lg text-gray-700 font-semibold mt-1">{appointment.service}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{appointment.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="font-bold text-gray-900">${appointment.price}</span>
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="text-xs text-gray-500 mt-2 italic">"{appointment.notes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(appointment.status)}
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

      {/* Action Menu Modal */}
      {showActionMenu && actionMenuAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MoreHorizontal className="h-5 w-5 text-lavender" />
                Appointment Actions
              </CardTitle>
              <CardDescription>
                {actionMenuAppointment.clientName} - {actionMenuAppointment.service}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('checkout', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-semibold">Checkout</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('markPaid', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Mark as Paid</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('reschedule', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm font-semibold">Reschedule</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('takePicture', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-5 w-5" />
                    <span className="text-sm font-semibold">Take Picture</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('leaveNotes', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-semibold">Leave Notes</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('delete', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">Delete</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('cancel', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <X className="h-5 w-5" />
                    <span className="text-sm font-semibold">Cancel</span>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleAction('noShow', actionMenuAppointment)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Ban className="h-5 w-5" />
                    <span className="text-sm font-semibold">No Show</span>
                  </div>
                </Button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 hover:border-gray-300"
                  onClick={() => setShowActionMenu(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && actionMenuAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-lavender" />
                Appointment Notes
              </CardTitle>
              <CardDescription>
                Add notes for {actionMenuAppointment.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-900">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this appointment..."
                  className="mt-2 border-gray-200 focus:border-lavender focus:ring-lavender/20"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-lavender to-purple-600 hover:from-lavender-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={saveNotes}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:border-gray-300"
                  onClick={() => {
                    setShowNotesModal(false)
                    setNotes('')
                  }}
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
