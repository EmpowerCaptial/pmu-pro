import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientDataStr = formData.get("clientData") as string
    const idDocument = formData.get("idDocument") as File | null

    if (!clientDataStr) {
      return NextResponse.json({ error: "Missing client data" }, { status: 400 })
    }

    const clientData = JSON.parse(clientDataStr)

    // Generate unique client ID
    const clientId = crypto.randomUUID()

    // Insert client record
    await sql`
      INSERT INTO clients (
        client_id, full_name, date_of_birth, address, phone, email,
        emergency_contact, emergency_phone, occupation, medical_history,
        allergies, medications, photo_consent, procedure_consent, created_at
      ) VALUES (
        ${clientId}, ${clientData.fullName}, ${clientData.dateOfBirth},
        ${clientData.address}, ${clientData.phone}, ${clientData.email},
        ${clientData.emergencyContact}, ${clientData.emergencyPhone},
        ${clientData.occupation}, ${JSON.stringify(clientData.medicalHistory)},
        ${clientData.allergies}, ${clientData.medications},
        ${clientData.photoConsent}, ${clientData.procedureConsent}, NOW()
      )
    `

    // Handle ID document upload if provided
    if (idDocument) {
      // In a real implementation, you would upload to cloud storage (S3, etc.)
      // For now, we'll just store the filename
      const documentId = crypto.randomUUID()

      await sql`
        INSERT INTO documents (
          document_id, client_id, document_type, file_url, created_at
        ) VALUES (
          ${documentId}, ${clientId}, 'ID', ${idDocument.name}, NOW()
        )
      `
    }

    return NextResponse.json({
      success: true,
      clientId,
      message: "Client intake completed successfully",
    })
  } catch (error) {
    console.error("Client intake error:", error)
    return NextResponse.json({ error: "Failed to process client intake" }, { status: 500 })
  }
}
