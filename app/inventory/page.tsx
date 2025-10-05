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
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Download,
  Upload
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface InventoryItem {
  id: string
  name: string
  category: string
  brand: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  description?: string
  location?: string
  supplier?: string
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Microblading Blades - 0.25mm',
    category: 'Tools',
    brand: 'Precision PMU',
    sku: 'MB-025-100',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unitCost: 12.50,
    totalValue: 562.50,
    lastUpdated: '2024-01-15',
    status: 'in_stock',
    description: 'High-quality microblading blades for fine hair strokes',
    location: 'Storage Room A',
    supplier: 'PMU Supplies Co.'
  },
  {
    id: '2',
    name: 'Permanent Makeup Pigment - Dark Brown',
    category: 'Pigments',
    brand: 'Eternal Ink',
    sku: 'EI-DB-50ML',
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    unitCost: 45.00,
    totalValue: 360.00,
    lastUpdated: '2024-01-14',
    status: 'low_stock',
    description: 'Professional-grade permanent makeup pigment',
    location: 'Pigment Cabinet',
    supplier: 'Eternal Ink Distributors'
  },
  {
    id: '3',
    name: 'Disposable Needles - 1RL',
    category: 'Consumables',
    brand: 'Sterile PMU',
    sku: 'SP-1RL-500',
    currentStock: 0,
    minStock: 100,
    maxStock: 1000,
    unitCost: 0.25,
    totalValue: 0,
    lastUpdated: '2024-01-13',
    status: 'out_of_stock',
    description: 'Sterile disposable needles for permanent makeup',
    location: 'Needle Storage',
    supplier: 'Sterile Supplies Inc.'
  },
  {
    id: '4',
    name: 'Numbing Cream - 5% Lidocaine',
    category: 'Anesthetics',
    brand: 'Numbskin Pro',
    sku: 'NS-L5-30G',
    currentStock: 12,
    minStock: 5,
    maxStock: 30,
    unitCost: 28.75,
    totalValue: 345.00,
    lastUpdated: '2024-01-12',
    status: 'in_stock',
    description: 'Professional numbing cream for client comfort',
    location: 'Refrigerated Storage',
    supplier: 'Medical Supplies Direct'
  }
]

export default function InventoryPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user has permission to access inventory
  const hasInventoryAccess = currentUser && 
    (currentUser.role === 'owner' || 
     currentUser.role === 'manager' || 
     currentUser.role === 'director') &&
    (currentUser as any)?.selectedPlan === 'studio'
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    brand: '',
    sku: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitCost: 0,
    description: '',
    location: '',
    supplier: ''
  })

  const categories = ['all', 'Tools', 'Pigments', 'Consumables', 'Anesthetics', 'Aftercare']

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventory(data.data || [])
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredInventory(filtered)
  }, [searchTerm, selectedCategory, inventory])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const calculateTotalValue = () => {
    return inventory.reduce((total, item) => total + item.totalValue, 0)
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.minStock)
  }

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert('Please fill in required fields')
      return
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      brand: newItem.brand,
      sku: newItem.sku,
      currentStock: newItem.currentStock,
      minStock: newItem.minStock,
      maxStock: newItem.maxStock,
      unitCost: newItem.unitCost,
      totalValue: newItem.currentStock * newItem.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: (newItem.currentStock === 0 ? 'out_of_stock' : 
              newItem.currentStock <= newItem.minStock ? 'low_stock' : 'in_stock') as InventoryItem['status'],
      description: newItem.description,
      location: newItem.location,
      supplier: newItem.supplier
    }

    setInventory([...inventory, item])
    setNewItem({
      name: '',
      category: '',
      brand: '',
      sku: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitCost: 0,
      description: '',
      location: '',
      supplier: ''
    })
    setShowAddDialog(false)
  }

  const handleUpdateStock = (id: string, newStock: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const updatedItem: InventoryItem = {
          ...item,
          currentStock: newStock,
          totalValue: newStock * item.unitCost,
          lastUpdated: new Date().toISOString().split('T')[0],
          status: (newStock === 0 ? 'out_of_stock' : 
                  newStock <= item.minStock ? 'low_stock' : 'in_stock') as InventoryItem['status']
        }
        return updatedItem
      }
      return item
    }))
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id))
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
        <NavBar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied for unauthorized users
  if (!hasInventoryAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
        <NavBar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Inventory management is only available to studio owners, managers, and directors.
              </p>
              <p className="text-sm text-gray-500">
                Your current role: <span className="font-medium">{currentUser?.role || 'Unknown'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10 pb-20 sm:pb-0">
      <NavBar currentPath="/inventory" user={currentUser || undefined} />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-16 sm:pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 lg:gap-0">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Inventory Management</h1>
            <p className="text-muted text-sm sm:text-base">Track and manage your PMU supplies and equipment</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 w-full lg:w-auto">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 text-xs sm:text-sm flex-1 md:flex-none">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Export
              </Button>
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 text-xs sm:text-sm flex-1 md:flex-none">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Import
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-lavender hover:bg-lavender-600 text-white text-xs sm:text-sm flex-1 md:flex-none">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Add New Inventory Item</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Add a new item to your inventory tracking system
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">Item Name *</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Microblading Blades"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="category" className="text-sm sm:text-base">Category *</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                      <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat !== 'all').map(category => (
                          <SelectItem key={category} value={category} className="text-sm sm:text-base">{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="brand" className="text-sm sm:text-base">Brand</Label>
                    <Input
                      id="brand"
                      value={newItem.brand}
                      onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      placeholder="Brand name"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="sku" className="text-sm sm:text-base">SKU</Label>
                    <Input
                      id="sku"
                      value={newItem.sku}
                      onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                      placeholder="Product SKU"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="currentStock" className="text-sm sm:text-base">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={newItem.currentStock}
                      onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })}
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="unitCost" className="text-sm sm:text-base">Unit Cost ($)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={newItem.unitCost}
                      onChange={(e) => setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })}
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="minStock" className="text-sm sm:text-base">Minimum Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })}
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="maxStock" className="text-sm sm:text-base">Maximum Stock</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({ ...newItem, maxStock: parseInt(e.target.value) || 0 })}
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2 col-span-1 sm:col-span-2">
                    <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Item description"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="location" className="text-sm sm:text-base">Storage Location</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      placeholder="Storage location"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="supplier" className="text-sm sm:text-base">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                      placeholder="Supplier name"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3 sm:pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="w-full sm:w-auto text-sm sm:text-base">
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} className="bg-lavender hover:bg-lavender-600 text-white w-full sm:w-auto text-sm sm:text-base">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Total Items</p>
                  <p className="text-lg sm:text-2xl font-bold">{inventory.length}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Total Value</p>
                  <p className="text-lg sm:text-2xl font-bold">${calculateTotalValue().toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Low Stock</p>
                  <p className="text-lg sm:text-2xl font-bold">{getLowStockItems().length}</p>
                </div>
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Out of Stock</p>
                  <p className="text-lg sm:text-2xl font-bold">{inventory.filter(item => item.status === 'out_of_stock').length}</p>
                </div>
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 h-9 sm:h-10 text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category} className="text-sm sm:text-base">
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Inventory Items ({filteredInventory.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-3">
              {filteredInventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 truncate">{item.brand} - {item.sku}</p>
                    </div>
                    <Badge className={`${getStatusColor(item.status)} text-xs`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <span>{item.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Category</p>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Unit Cost</p>
                      <p className="text-sm font-medium">${item.unitCost.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => handleUpdateStock(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-xs"
                      />
                      <span className="text-xs text-gray-600">/ {item.maxStock}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Value</p>
                      <p className="text-sm font-medium">${item.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Item</th>
                    <th className="text-left p-3 text-sm font-medium">Category</th>
                    <th className="text-left p-3 text-sm font-medium">Stock</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Unit Cost</th>
                    <th className="text-left p-3 text-sm font-medium">Total Value</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.brand} - {item.sku}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={item.currentStock}
                            onChange={(e) => handleUpdateStock(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-9 text-sm"
                          />
                          <span className="text-xs text-gray-600">/ {item.maxStock}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(item.status)} text-xs`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span>{item.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-sm">${item.totalValue.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(item.id)}
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
      </div>
      </div>
    </div>
  )
}
