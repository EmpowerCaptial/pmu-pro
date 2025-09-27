"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  DollarSign,
  Hash,
  Image as ImageIcon,
  Tag,
  AlertTriangle
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  sku?: string
  stockQuantity: number
  isDigital: boolean
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const PRODUCT_CATEGORIES = [
  'Aftercare Products',
  'Skincare',
  'Tools & Equipment',
  'Pigments',
  'Supplies',
  'Digital Guides',
  'Gift Cards',
  'Other'
]

export default function ProductsPage() {
  const { currentUser } = useDemoAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stockQuantity: '',
    isDigital: false,
    images: [] as string[],
    isActive: true
  })

  // Load products from API
  useEffect(() => {
    if (currentUser?.email) {
      loadProducts()
    }
  }, [currentUser])

  const loadProducts = async () => {
    if (!currentUser?.email) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/products', {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!currentUser?.email) return

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity) || 0
      }

      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          },
          body: JSON.stringify(productData)
        })

        if (response.ok) {
          await loadProducts()
          setEditingProduct(null)
          setShowAddModal(false)
          resetForm()
        }
      } else {
        // Add new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          },
          body: JSON.stringify(productData)
        })

        if (response.ok) {
          await loadProducts()
          setShowAddModal(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser?.email || !confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (response.ok) {
        await loadProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      sku: product.sku || '',
      stockQuantity: product.stockQuantity.toString(),
      isDigital: product.isDigital,
      images: product.images,
      isActive: product.isActive
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      sku: '',
      stockQuantity: '',
      isDigital: false,
      images: [],
      isActive: true
    })
  }

  const getStockStatus = (stockQuantity: number, isDigital: boolean) => {
    if (isDigital) return { status: 'unlimited', color: 'bg-blue-100 text-blue-800' }
    if (stockQuantity === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' }
    if (stockQuantity <= 5) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'in-stock', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your products and inventory</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-lavender hover:bg-lavender-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update your product information' : 'Add a new product to your store'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="e.g., Premium Aftercare Kit"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Describe your product..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      placeholder="e.g., AFT-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                      placeholder="0"
                      disabled={newProduct.isDigital}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDigital"
                        checked={newProduct.isDigital}
                        onChange={(e) => setNewProduct({...newProduct, isDigital: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isDigital" className="text-sm">
                        Digital Product (No physical inventory)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newProduct.isActive}
                    onChange={(e) => setNewProduct({...newProduct, isActive: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Active (Visible to customers)
                  </Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProduct}
                  disabled={!newProduct.name || !newProduct.price}
                  className="bg-lavender hover:bg-lavender-600 text-white"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first product to begin selling</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-lavender hover:bg-lavender-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stockQuantity, product.isDigital)
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {product.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-lg">${product.price}</span>
                    </div>
                    <Badge className={stockStatus.color}>
                      {stockStatus.status === 'unlimited' ? 'Unlimited' :
                       stockStatus.status === 'out-of-stock' ? 'Out of Stock' :
                       stockStatus.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                  
                  {!product.isDigital && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Hash className="h-4 w-4" />
                      <span>Stock: {product.stockQuantity}</span>
                    </div>
                  )}
                  
                  {product.sku && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>SKU: {product.sku}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
