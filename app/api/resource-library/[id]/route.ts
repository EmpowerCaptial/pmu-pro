import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const RESOURCE_PREFIX = 'resource-library'
const ALLOWED_DELETE_ROLES = ['owner', 'director', 'manager', 'hr']

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })

    if (!currentUser || !ALLOWED_DELETE_ROLES.includes(currentUser.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resource = await prisma.fileUpload.findUnique({
      where: { id: params.id }
    })

    if (!resource || !resource.fileType.startsWith(RESOURCE_PREFIX)) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    try {
      await del(resource.fileUrl)
    } catch (blobError) {
      console.warn('Failed to delete blob for resource', params.id, blobError)
    }

    await prisma.fileUpload.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resource library DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
