import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/products - Fetch all products for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    console.log('GET /api/products - userEmail:', userEmail)
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    console.log('GET /api/products - user found:', !!user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch products
    console.log('GET /api/products - fetching products for userId:', user.id)
    const products = await prisma.product.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('GET /api/products - products found:', products.length)
    
    // Parse images from JSON strings
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    }))
    
    return NextResponse.json({ products: productsWithParsedImages })

  } catch (error) {
    console.error('Error fetching products:', error)
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      category,
      sku,
      stockQuantity,
      isDigital,
      images,
      isActive
    } = body

    // Validate required fields
    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name,
        description,
        price,
        category,
        sku,
        stockQuantity: stockQuantity || 0,
        isDigital: isDigital || false,
        images: JSON.stringify(images || []),
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ product }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
