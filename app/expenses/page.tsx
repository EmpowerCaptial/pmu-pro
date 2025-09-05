"use client"

import { useState } from 'react'
import { 
  Receipt, 
  Plus, 
  DollarSign, 
  Calendar,
  Tag,
  Upload,
  Download,
  Filter,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const expenseCategories = [
  'Supplies',
  'Equipment',
  'Rent',
  'Utilities',
  'Marketing',
  'Training',
  'Travel',
  'Other'
]

const sampleExpenses = [
  {
    id: 1,
    description: 'Pigment supplies',
    amount: 245.50,
    category: 'Supplies',
    date: '2024-01-15',
    receipt: 'receipt_001.pdf',
    status: 'approved'
  },
  {
    id: 2,
    description: 'New tattoo machine',
    amount: 850.00,
    category: 'Equipment',
    date: '2024-01-14',
    receipt: 'receipt_002.pdf',
    status: 'pending'
  },
  {
    id: 3,
    description: 'Studio rent',
    amount: 1200.00,
    category: 'Rent',
    date: '2024-01-01',
    receipt: 'receipt_003.pdf',
    status: 'approved'
  },
  {
    id: 4,
    description: 'Marketing materials',
    amount: 125.75,
    category: 'Marketing',
    date: '2024-01-10',
    receipt: 'receipt_004.pdf',
    status: 'approved'
  }
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(sampleExpenses)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, expense) => sum + expense.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0)

  const handleAddExpense = () => {
    const expense = {
      id: expenses.length + 1,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      receipt: 'receipt_' + (expenses.length + 1).toString().padStart(3, '0') + '.pdf',
      status: 'pending'
    }
    setExpenses([expense, ...expenses])
    setNewExpense({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowAddForm(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
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
            <h1 className="text-3xl font-bold text-ink mb-2">Expense Tracking</h1>
            <p className="text-muted">Track and manage your business expenses</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Approved</h3>
              <p className="text-2xl font-bold text-green-600">${approvedExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">${pendingExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <Card className="border-gray-200 mb-8">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Record a new business expense</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="What was this expense for?"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense}>Add Expense</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your expense history and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Receipt className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        <span>{expense.category}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{expense.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{expense.receipt}</p>
                    </div>
                    {getStatusBadge(expense.status)}
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
