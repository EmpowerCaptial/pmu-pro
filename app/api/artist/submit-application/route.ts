import { type NextRequest, NextResponse } from "next/server"
import { ArtistApplicationService } from "@/lib/artist-application-service"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Submit application using the new service
    const application = ArtistApplicationService.submitApplication({
      name: applicationData.name,
      email: applicationData.email,
      phone: applicationData.phone,
      businessName: applicationData.businessName,
      businessAddress: applicationData.businessAddress,
      licenseNumber: applicationData.licenseNumber,
      licenseState: applicationData.licenseState,
      experience: applicationData.experience,
      specialties: applicationData.specialties || [],
      portfolioUrl: applicationData.portfolioUrl,
      socialMedia: applicationData.socialMedia || []
    })

    console.log("Artist application submitted:", application)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully. You now have immediate access to your 30-day free trial.",
      applicationId: application.id,
      trialStarted: true
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ 
      error: "Failed to submit application",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
