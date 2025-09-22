'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  Upload,
  Download,
  PieChart,
  BarChart3,
  FileText
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  vendor: string
  paymentMethod: string
  receipt?: string
  isTaxDeductible: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  notes?: string
}

const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-01-15',
    category: 'Supplies',
    description: 'Microblading blades and pigments',
    amount: 245.50,
    vendor: 'PMU Supplies Co.',
    paymentMethod: 'Credit Card',
    isTaxDeductible: true,
    status: 'approved',
    createdAt: '2024-01-15T10:30:00Z',
    notes: 'Monthly supply order'
  },
  {
    id: '2',
    date: '2024-01-14',
    category: 'Equipment',
    description: 'New microblading pen',
    amount: 89.99,
    vendor: 'Professional PMU Tools',
    paymentMethod: 'PayPal',
    isTaxDeductible: true,
    status: 'pending',
    createdAt: '2024-01-14T14:20:00Z',
    notes: 'Upgrade to latest model'
  },
  {
    id: '3',
    date: '2024-01-12',
    category: 'Marketing',
    description: 'Social media advertising',
    amount: 150.00,
    vendor: 'Facebook Ads',
    paymentMethod: 'Credit Card',
    isTaxDeductible: true,
    status: 'approved',
    createdAt: '2024-01-12T09:15:00Z'
  },
  {
    id: '4',
    date: '2024-01-10',
    category: 'Training',
    description: 'Advanced PMU course',
    amount: 650.00,
    vendor: 'PMU Academy',
    paymentMethod: 'Bank Transfer',
    isTaxDeductible: true,
    status: 'approved',
    createdAt: '2024-01-10T16:45:00Z',
    notes: 'Continuing education for certification renewal'
  },
  {
    id: '5',
    date: '2024-01-08',
    category: 'Utilities',
    description: 'Monthly internet bill',
    amount: 79.99,
    vendor: 'Comcast',
    paymentMethod: 'Auto Pay',
    isTaxDeductible: true,
    status: 'approved',
    createdAt: '2024-01-08T00:00:00Z'
  }
]

const expenseCategories = [
  'Supplies',
  'Equipment',
  'Marketing',
  'Training',
  'Utilities',
  'Insurance',
  'Rent',
  'Professional Services',
  'Travel',
  'Meals',
  'Other'
]

const paymentMethods = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer',
  'Cash',
  'Check',
  'Auto Pay',
  'Other'
]

export default function ExpensesPage() {
  const { currentUser } = useDemoAuth()
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(mockExpenses)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    vendor: '',
    paymentMethod: '',
    isTaxDeductible: true,
    notes: ''
  })

  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(expense => expense.status === selectedStatus)
    }

    setFilteredExpenses(filtered)
  }, [searchTerm, selectedCategory, selectedStatus, expenses])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTotals = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const taxDeductible = expenses
      .filter(expense => expense.isTaxDeductible)
      .reduce((sum, expense) => sum + expense.amount, 0)
    const pending = expenses
      .filter(expense => expense.status === 'pending')
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    return { total, taxDeductible, pending }
  }

  const getCategoryTotals = () => {
    const categoryTotals = expenseCategories.reduce((acc, category) => {
      acc[category] = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
  }

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.category || !newExpense.amount) {
      alert('Please fill in required fields')
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date,
      category: newExpense.category,
      description: newExpense.description,
      amount: newExpense.amount,
      vendor: newExpense.vendor,
      paymentMethod: newExpense.paymentMethod,
      isTaxDeductible: newExpense.isTaxDeductible,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: newExpense.notes
    }

    setExpenses([...expenses, expense])
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      vendor: '',
      paymentMethod: '',
      isTaxDeductible: true,
      notes: ''
    })
    setShowAddDialog(false)
  }

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status } : expense
    ))
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id))
    }
  }

  const totals = calculateTotals()
  const categoryTotals = getCategoryTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
      <NavBar currentPath="/expenses" user={currentUser || undefined} />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Expense Tracking</h1>
            <p className="text-muted">Track and manage your business expenses</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lavender hover:bg-lavender-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Record a new business expense for tracking and tax purposes
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Brief description of the expense"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      placeholder="Vendor or merchant name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newExpense.notes}
                      onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                      placeholder="Additional notes or details"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense} className="bg-lavender hover:bg-lavender-600 text-white">
                    Add Expense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Expenses</p>
                  <p className="text-2xl font-bold">${totals.total.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Tax Deductible</p>
                  <p className="text-2xl font-bold">${totals.taxDeductible.toFixed(2)}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Pending</p>
                  <p className="text-2xl font-bold">${totals.pending.toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Items</p>
                  <p className="text-2xl font-bold">{expenses.length}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Expense List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expense Table */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses ({filteredExpenses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-sm text-gray-600">{expense.vendor}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{expense.category}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                              {expense.isTaxDeductible && (
                                <Badge variant="secondary" className="text-xs">Tax Deductible</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {expense.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleUpdateStatus(expense.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleUpdateStatus(expense.id, 'rejected')}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryTotals.map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Tag className="h-5 w-5 text-lavender" />
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {((amount / totals.total) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Expenses:</span>
                      <span className="font-semibold">${totals.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Deductible:</span>
                      <span className="font-semibold text-green-600">${totals.taxDeductible.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Approval:</span>
                      <span className="font-semibold text-yellow-600">${totals.pending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-semibold">{expenses.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Tax Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}