import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/artist/[handle]/products - Fetch public products for an artist
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle

    // Try to find artist by checking if any email matches the handle
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    // Find the user whose email matches the handle
    const artist = users.find(user => {
      const emailHandle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      return emailHandle === handle
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Fetch active products for this artist
    const products = await (prisma as any).product.findMany({
      where: {
        userId: artist.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        isDigital: true,
        stockQuantity: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse images from JSON strings
    const productsWithParsedImages = products.map((product: any) => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    }))
    
    return NextResponse.json({ products: productsWithParsedImages })

  } catch (error) {
    console.error('Error fetching artist products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
