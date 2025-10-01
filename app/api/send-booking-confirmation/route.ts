import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      clientEmail, 
      clientName, 
      service, 
      date, 
      time, 
      duration,
      price,
      artistName,
      artistEmail
    } = body

    // Validate required fields
    if (!clientEmail || !clientName || !service || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format the date
    const appointmentDate = new Date(date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Email content
    const emailSubject = `Appointment Confirmed - ${service}`
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #38bdf8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .detail-value { color: #111827; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #38bdf8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Appointment Confirmed!</h1>
      <p>Your booking has been successfully scheduled</p>
    </div>
    
    <div class="content">
      <p>Hi ${clientName},</p>
      
      <p>Great news! Your appointment has been confirmed. We're looking forward to seeing you!</p>
      
      <div class="appointment-card">
        <h2 style="color: #9333ea; margin-top: 0;">Appointment Details</h2>
        
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${service}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${time}</span>
        </div>
        
        ${duration ? `
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${duration} minutes</span>
        </div>
        ` : ''}
        
        ${price ? `
        <div class="detail-row">
          <span class="detail-label">Price:</span>
          <span class="detail-value">$${price}</span>
        </div>
        ` : ''}
      </div>
      
      <p><strong>Important Reminders:</strong></p>
      <ul>
        <li>Please arrive 10-15 minutes early to complete any necessary paperwork</li>
        <li>If you need to reschedule or cancel, please give us at least 24 hours notice</li>
        <li>Bring a valid ID and any relevant medical information</li>
      </ul>
      
      <p>If you have any questions or need to make changes to your appointment, please contact us.</p>
      
      <div class="footer">
        <p>Thank you for choosing our services!</p>
        ${artistName ? `<p><strong>${artistName}</strong></p>` : ''}
        ${artistEmail ? `<p>${artistEmail}</p>` : ''}
        <p style="margin-top: 20px; font-size: 12px;">This is an automated confirmation email.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `

    // In a real implementation, you would use a service like SendGrid, Mailgun, or AWS SES
    // For now, we'll log the email and return success
    console.log('📧 Sending booking confirmation email...')
    console.log('To:', clientEmail)
    console.log('Subject:', emailSubject)
    console.log('Appointment:', { service, date, time })

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: clientEmail,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: emailSubject,
    //   html: emailBody
    // })

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Error sending booking confirmation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send booking confirmation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

