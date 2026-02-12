import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const locationId = searchParams.get('locationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }

    if (locationId) {
      where.locationId = locationId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          locationRef: true
        },
        orderBy: { lastUpdated: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.inventoryItem.count({ where })
    ])

    // Calculate inventory metrics
    const metrics = await prisma.inventoryItem.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const categoryMetrics = await prisma.inventoryItem.groupBy({
      by: ['category'],
      _count: { category: true }
    })

    // Calculate total value
    const totalValue = await prisma.inventoryItem.aggregate({
      _sum: { totalValue: true }
    })

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      metrics: {
        status: metrics.reduce((acc, metric) => {
          acc[metric.status] = metric._count.status
          return acc
        }, {} as Record<string, number>),
        category: categoryMetrics.reduce((acc, metric) => {
          acc[metric.category] = metric._count.category
          return acc
        }, {} as Record<string, number>),
        totalValue: totalValue._sum.totalValue || 0
      }
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// POST /api/inventory - Create a new inventory item
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      name, 
      category, 
      brand, 
      sku, 
      currentStock, 
      minStock, 
      maxStock, 
      unitCost, 
      description, 
      location, 
      locationId,
      supplier 
    } = await request.json()

    if (!name || !category || currentStock === undefined || !unitCost) {
      return NextResponse.json(
        { error: 'Name, category, current stock, and unit cost are required' },
        { status: 400 }
      )
    }

    const totalValue = currentStock * unitCost
    let status = 'in_stock'
    
    if (currentStock === 0) {
      status = 'out_of_stock'
    } else if (minStock && currentStock <= minStock) {
      status = 'low_stock'
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        brand: brand || null,
        sku: sku || null,
        currentStock: parseInt(currentStock),
        minStock: minStock ? parseInt(minStock) : null,
        maxStock: maxStock ? parseInt(maxStock) : null,
        unitCost: parseFloat(unitCost),
        totalValue,
        status,
        description: description || null,
        location: location || null, // Legacy field
        locationId: locationId || null,
        supplier: supplier || null,
        lastUpdated: new Date()
      },
      include: {
        locationRef: true
      }
    })

    return NextResponse.json({
      success: true,
      data: item
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory - Update inventory item
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { itemId, updates } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const allowedUpdates = [
      'name',
      'category',
      'brand',
      'sku',
      'currentStock',
      'minStock',
      'maxStock',
      'unitCost',
      'description',
      'location',
      'locationId',
      'supplier'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    // Recalculate total value and status
    if (filteredUpdates.currentStock !== undefined || filteredUpdates.unitCost !== undefined) {
      const currentItem = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
      const stock = filteredUpdates.currentStock ?? currentItem?.currentStock ?? 0
      const cost = filteredUpdates.unitCost ?? currentItem?.unitCost ?? 0
      
      filteredUpdates.totalValue = stock * cost
      
      // Update status based on stock levels
      const minStock = filteredUpdates.minStock ?? currentItem?.minStock
      if (stock === 0) {
        filteredUpdates.status = 'out_of_stock'
      } else if (minStock && stock <= minStock) {
        filteredUpdates.status = 'low_stock'
      } else {
        filteredUpdates.status = 'in_stock'
      }
    }

    filteredUpdates.lastUpdated = new Date()

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: filteredUpdates,
      include: {
        locationRef: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedItem
    })

  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory item' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory - Delete inventory item
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    await prisma.inventoryItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete inventory item' },
      { status: 500 }
    )
  }
}
