"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Receipt, 
  Plus, 
  Download, 
  Upload, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calculator,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  BarChart3
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  vendor: string
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
  receipt?: string
  isDeductible: boolean
  notes?: string
  createdAt: string
}

interface ExpenseCategory {
  id: string
  name: string
  description: string
  isDeductible: boolean
  scheduleCLine: string
}

const scheduleCCategories: ExpenseCategory[] = [
  { id: 'advertising', name: 'Advertising', description: 'Marketing and promotional expenses', isDeductible: true, scheduleCLine: 'Line 8' },
  { id: 'car_truck', name: 'Car and Truck Expenses', description: 'Vehicle expenses for business use', isDeductible: true, scheduleCLine: 'Line 9' },
  { id: 'commissions', name: 'Commissions and Fees', description: 'Professional fees and commissions', isDeductible: true, scheduleCLine: 'Line 10' },
  { id: 'contract_labor', name: 'Contract Labor', description: 'Independent contractor payments', isDeductible: true, scheduleCLine: 'Line 11' },
  { id: 'depletion', name: 'Depletion', description: 'Natural resource depletion', isDeductible: true, scheduleCLine: 'Line 12' },
  { id: 'depreciation', name: 'Depreciation', description: 'Asset depreciation expenses', isDeductible: true, scheduleCLine: 'Line 13' },
  { id: 'employee_benefits', name: 'Employee Benefit Programs', description: 'Health insurance, retirement plans', isDeductible: true, scheduleCLine: 'Line 14' },
  { id: 'insurance', name: 'Insurance (other than health)', description: 'Business insurance premiums', isDeductible: true, scheduleCLine: 'Line 15' },
  { id: 'interest', name: 'Interest', description: 'Business loan interest', isDeductible: true, scheduleCLine: 'Line 16' },
  { id: 'legal_professional', name: 'Legal and Professional Services', description: 'Attorney, accountant fees', isDeductible: true, scheduleCLine: 'Line 17' },
  { id: 'office_expenses', name: 'Office Expenses', description: 'Office supplies and equipment', isDeductible: true, scheduleCLine: 'Line 18' },
  { id: 'pension_plans', name: 'Pension and Profit-Sharing Plans', description: 'Retirement plan contributions', isDeductible: true, scheduleCLine: 'Line 19' },
  { id: 'rent_equipment', name: 'Rent or Lease', description: 'Equipment, vehicles, other business property', isDeductible: true, scheduleCLine: 'Line 20a' },
  { id: 'rent_other', name: 'Rent or Lease', description: 'Other business property', isDeductible: true, scheduleCLine: 'Line 20b' },
  { id: 'repairs_maintenance', name: 'Repairs and Maintenance', description: 'Equipment and property maintenance', isDeductible: true, scheduleCLine: 'Line 21' },
  { id: 'supplies', name: 'Supplies', description: 'Materials and supplies', isDeductible: true, scheduleCLine: 'Line 22' },
  { id: 'taxes_licenses', name: 'Taxes and Licenses', description: 'Business taxes and licensing fees', isDeductible: true, scheduleCLine: 'Line 23' },
  { id: 'travel', name: 'Travel', description: 'Business travel expenses', isDeductible: true, scheduleCLine: 'Line 24a' },
  { id: 'meals', name: 'Meals', description: 'Business meal expenses', isDeductible: true, scheduleCLine: 'Line 24b' },
  { id: 'utilities', name: 'Utilities', description: 'Electricity, gas, water, phone', isDeductible: true, scheduleCLine: 'Line 25' },
  { id: 'wages', name: 'Wages', description: 'Employee wages and salaries', isDeductible: true, scheduleCLine: 'Line 26' },
  { id: 'other', name: 'Other Expenses', description: 'Other business expenses', isDeductible: true, scheduleCLine: 'Line 27a' }
]

const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'PMU pigments and supplies',
    category: 'supplies',
    amount: 245.50,
    vendor: 'PMU Supply Co',
    paymentMethod: 'card',
    isDeductible: true,
    notes: 'Monthly pigment order',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    date: '2024-01-12',
    description: 'Office rent - January',
    category: 'rent_other',
    amount: 1200.00,
    vendor: 'Downtown Office Space',
    paymentMethod: 'transfer',
    isDeductible: true,
    notes: 'Monthly office rent',
    createdAt: '2024-01-12T09:00:00Z'
  },
  {
    id: '3',
    date: '2024-01-10',
    description: 'Business insurance premium',
    category: 'insurance',
    amount: 180.00,
    vendor: 'Business Insurance Co',
    paymentMethod: 'card',
    isDeductible: true,
    notes: 'Quarterly premium payment',
    createdAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '4',
    date: '2024-01-08',
    description: 'Marketing materials and business cards',
    category: 'advertising',
    amount: 85.75,
    vendor: 'Print Shop Plus',
    paymentMethod: 'cash',
    isDeductible: true,
    notes: 'New business cards and flyers',
    createdAt: '2024-01-08T16:45:00Z'
  },
  {
    id: '5',
    date: '2024-01-05',
    description: 'Professional development course',
    category: 'other',
    amount: 350.00,
    vendor: 'PMU Training Institute',
    paymentMethod: 'card',
    isDeductible: true,
    notes: 'Advanced microblading techniques',
    createdAt: '2024-01-05T11:15:00Z'
  }
]

export default function ExpensesPage() {
  const { currentUser } = useDemoAuth()
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: 0,
    vendor: '',
    paymentMethod: 'card' as const,
    isDeductible: true,
    notes: ''
  })

  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "artist@pmupro.com",
    initials: "PA",
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const deductibleExpenses = expenses.filter(e => e.isDeductible).reduce((sum, expense) => sum + expense.amount, 0)
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = scheduleCCategories.map(category => {
    const categoryExpenses = expenses.filter(e => e.category === category.id)
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      ...category,
      total,
      count: categoryExpenses.length
    }
  }).filter(cat => cat.total > 0)

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.category || newExpense.amount <= 0) {
      alert('Please fill in required fields')
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      ...newExpense,
      createdAt: new Date().toISOString()
    }

    setExpenses([...expenses, expense])
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      amount: 0,
      vendor: '',
      paymentMethod: 'card',
      isDeductible: true,
      notes: ''
    })
    setShowAddExpense(false)
    alert('Expense added successfully!')
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== expenseId))
      alert('Expense deleted successfully')
    }
  }

  const handleExportScheduleC = () => {
    alert('Schedule C export functionality would open here')
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳'
      case 'cash':
        return '💵'
      case 'check':
        return '📝'
      case 'transfer':
        return '🏦'
      default:
        return '💳'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/expenses" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Expense Tracking</h1>
              <p className="text-muted">Track business expenses for Schedule C tax reporting</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowAddExpense(true)}
                className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportScheduleC}
                className="border-lavender text-lavender hover:bg-lavender/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Schedule C
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Expenses</p>
                  <p className="text-2xl font-bold text-ink">${totalExpenses.toFixed(2)}</p>
                </div>
                <Receipt className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Deductible</p>
                  <p className="text-2xl font-bold text-green-600">${deductibleExpenses.toFixed(2)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">${thisMonthExpenses.toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{categoryTotals.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {scheduleCCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="schedule-c" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Schedule C
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Expenses */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Recent Expenses</CardTitle>
                  <CardDescription>Latest expense entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ink">{expense.description}</h3>
                            <p className="text-sm text-muted">{expense.vendor}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-ink">${expense.amount.toFixed(2)}</span>
                            <span className="text-lg">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{scheduleCCategories.find(c => c.id === expense.category)?.name}</span>
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Expense Categories</CardTitle>
                  <CardDescription>Breakdown by Schedule C categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryTotals.slice(0, 5).map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-semibold text-ink">{category.name}</h3>
                          <p className="text-sm text-muted">{category.scheduleCLine}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink">${category.total.toFixed(2)}</p>
                          <p className="text-xs text-muted">{category.count} expenses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">All Expenses</CardTitle>
                <CardDescription>Complete list of business expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{expense.description}</h3>
                          <p className="text-sm text-muted">{expense.vendor}</p>
                          <p className="text-xs text-muted">
                            {scheduleCCategories.find(c => c.id === expense.category)?.name} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-ink">${expense.amount.toFixed(2)}</p>
                          <Badge className={expense.isDeductible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {expense.isDeductible ? 'Deductible' : 'Non-deductible'}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200 shadow-lg">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Edit className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <FileText className="mr-2 h-4 w-4 text-green-500" />
                              <span>View Receipt</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule C Tab */}
          <TabsContent value="schedule-c" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Schedule C Categories</CardTitle>
                <CardDescription>Business expenses organized by IRS Schedule C lines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryTotals.map((category) => (
                    <div key={category.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-ink">{category.name}</h3>
                          <p className="text-sm text-muted">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink">${category.total.toFixed(2)}</p>
                          <p className="text-xs text-muted">{category.scheduleCLine}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted">
                        {category.count} expense{category.count !== 1 ? 's' : ''} • {category.isDeductible ? 'Deductible' : 'Non-deductible'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
                <CardDescription>Record a new business expense</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Office supplies"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleCCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.scheduleCLine})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="e.g., Office Depot"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(value: any) => setNewExpense({ ...newExpense, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDeductible"
                    checked={newExpense.isDeductible}
                    onChange={(e) => setNewExpense({ ...newExpense, isDeductible: e.target.checked })}
                  />
                  <Label htmlFor="isDeductible">This expense is tax deductible</Label>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAddExpense}
                    className="flex-1 bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white"
                  >
                    Add Expense
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}