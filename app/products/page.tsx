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
import { NavBar } from '@/components/ui/navbar'
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
import { SubscriptionGate } from '@/components/auth/subscription-gate'

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

  // Load avatar from API first, then fallback to localStorage
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    const loadAvatar = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          // Try to load from API first
          const response = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.profile?.avatar) {
              setUserAvatar(data.profile.avatar)
              return
            }
          }
          
          // Fallback to localStorage
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        } catch (error) {
          console.error('Error loading avatar:', error)
          // Fallback to localStorage on error
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        }
      }
    }
    
    loadAvatar()
  }, [currentUser?.email])

  // Prepare user object for NavBar
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: userAvatar
  } : {
    name: "PMU Artist",
    email: "artist@pmupro.com",
    initials: "PA",
  }

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
    // Ensure images is an array
    const productImages = Array.isArray(product.images) ? product.images : []
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      sku: product.sku || '',
      stockQuantity: product.stockQuantity.toString(),
      isDigital: product.isDigital,
      images: productImages,
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

  const isBrokenImageUrl = (url: string) => {
    // Check for common broken URL patterns
    return url.includes('thepmuguide.com/m') || 
           url.includes('localhost:3000') || 
           url.startsWith('blob:') ||
           url.length < 10
  }

  const cleanBrokenImages = (images: string[] | string) => {
    // Handle both array and string formats
    const imageArray = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images || '[]') : [])
    return imageArray.filter((img: string) => !isBrokenImageUrl(img))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-1 py-2">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-white">
        <NavBar currentPath="/products" user={user} />
        <div className="container mx-auto px-1 py-2 pb-20 sm:pb-2">
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

              {/* Product Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2">
                      <Label>Image {index + 1}</Label>
                      <div className="relative">
                        {newProduct.images[index] ? (
                          <div className="relative">
                            <img
                              src={newProduct.images[index]}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error('Image failed to load:', newProduct.images[index])
                                // Replace broken image with placeholder
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTU2IDU2SDcyVjcySDU2VjU2WiIgZmlsbD0iI0YzRjRGNiIvPgo8L3N2Zz4K'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...newProduct.images]
                                newImages.splice(index, 1)
                                setNewProduct({...newProduct, images: newImages})
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = (e) => {
                                    const imageUrl = e.target?.result as string
                                    const newImages = [...newProduct.images]
                                    newImages[index] = imageUrl
                                    setNewProduct({...newProduct, images: newImages})
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }
                              input.click()
                            }}
                            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lavender hover:bg-lavender/5 transition-colors"
                          >
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Upload up to 3 images. First image will be the main product image.</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  {/* Product Image */}
                  {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                    <div className="relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Product image failed to load:', product.images[0])
                          // Replace broken image with placeholder
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTU2IDU2SDcyVjcySDU2VjU2WiIgZmlsbD0iI0YzRjRGNiIvPgo8L3N2Zz4K'
                        }}
                      />
                      {product.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          +{product.images.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
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
      </div>
    </SubscriptionGate>
  )
}
