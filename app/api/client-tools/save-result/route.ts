import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Get user email from headers for authentication
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { clientId, toolResult } = await request.json()

    if (!clientId || !toolResult) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    let savedResult

    // Handle different tool types and save to appropriate tables
    switch (toolResult.type) {
      case 'intake':
        // Save to Intake table
        savedResult = await prisma.intake.create({
          data: {
            clientId: clientId,
            conditions: toolResult.data.conditions || '',
            medications: toolResult.data.medications || '',
            notes: toolResult.data.notes || '',
            result: toolResult.data.result || 'safe',
            rationale: toolResult.data.rationale || '',
            flaggedItems: toolResult.data.flaggedItems || ''
          }
        })
        break

      case 'consent':
        // Save to Document table as consent form
        savedResult = await prisma.document.create({
          data: {
            clientId: clientId,
            type: 'CONSENT_FORM',
            fileUrl: toolResult.data.fileUrl || '',
            filename: toolResult.data.filename || 'Consent Form',
            fileSize: toolResult.data.fileSize || 0,
            mimeType: toolResult.data.mimeType || 'application/pdf',
            notes: toolResult.data.notes || `Consent form completed on ${new Date().toLocaleDateString()}`
          }
        })
        break

      case 'skin-analysis':
        // Save to Analysis table
        savedResult = await prisma.analysis.create({
          data: {
            clientId: clientId,
            photoId: toolResult.data.photoId || null,
            fitzpatrick: toolResult.data.fitzpatrick || null,
            undertone: toolResult.data.undertone || null,
            confidence: toolResult.data.confidence || null,
            recommendation: toolResult.data.recommendation || null,
            notes: toolResult.data.notes || `Skin analysis completed on ${new Date().toLocaleDateString()}`
          }
        })
        break

      case 'color-correction':
        // Save to Analysis table with color correction data
        savedResult = await prisma.analysis.create({
          data: {
            clientId: clientId,
            photoId: toolResult.data.photoId || null,
            notes: `Color correction analysis: ${JSON.stringify(toolResult.data, null, 2)}`,
            recommendation: {
              type: 'color-correction',
              originalColor: toolResult.data.originalColor,
              correctedColor: toolResult.data.correctedColor,
              recommendations: toolResult.data.recommendations,
              timestamp: new Date().toISOString()
            }
          }
        })
        break

      case 'procell-analysis':
        // Save to Analysis table with ProCell data
        savedResult = await prisma.analysis.create({
          data: {
            clientId: clientId,
            notes: `ProCell analysis: ${JSON.stringify(toolResult.data, null, 2)}`,
            recommendation: {
              type: 'procell-analysis',
              recommendedSessions: toolResult.data.recommendedSessions,
              healingSpeed: toolResult.data.healingSpeed,
              collagenResponse: toolResult.data.collagenResponse,
              downtimeEstimate: toolResult.data.downtimeEstimate,
              areaFocus: toolResult.data.areaFocus,
              expectedBenefits: toolResult.data.expectedBenefits,
              timestamp: new Date().toISOString()
            }
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Unsupported tool type' }, { status: 400 })
    }

    // Update client's updatedAt timestamp
    await prisma.client.update({
      where: { id: clientId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: `${toolResult.toolName} results saved to client file`,
      savedResult,
      clientId
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving tool result to client file:', error)
    }
    return NextResponse.json(
      { error: 'Failed to save tool result' },
      { status: 500 }
    )
  }
}
