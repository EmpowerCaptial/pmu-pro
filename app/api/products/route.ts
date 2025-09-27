import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/products - Fetch all products for a user
export async function GET(request: NextRequest) {
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

    // Fetch products
    const products = await (prisma as any).product.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ products })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const product = await (prisma as any).product.create({
      data: {
        userId: user.id,
        name,
        description,
        price,
        category,
        sku,
        stockQuantity: stockQuantity || 0,
        isDigital: isDigital || false,
        images: images || [],
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ product }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
