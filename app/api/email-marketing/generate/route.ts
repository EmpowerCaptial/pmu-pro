import { NextRequest, NextResponse } from 'next/server'

// Email templates for different campaign types
const emailTemplates = {
  'special-offer': {
    subject: 'Exclusive Special Offer Just for You!',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Special Offer Just for You!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">We're excited to offer you this exclusive deal as one of our valued clients. This special promotion is designed to help you achieve the perfect look you've been dreaming of.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Offer Details:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Professional consultation included</li>
              <li>Premium quality pigments and tools</li>
              <li>Comprehensive aftercare package</li>
              <li>Follow-up appointment included</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{bookingLink}}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Book Your Appointment</a>
          </div>
          {{#if deadline}}
          <p style="color: #dc2626; text-align: center; font-weight: bold; margin: 20px 0;">⏰ Limited time offer - expires {{deadline}}</p>
          {{/if}}
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">Thank you for being a valued client. We look forward to seeing you soon!</p>
        </div>
      </div>
    `
  },
  'holiday-promotion': {
    subject: '🎉 Holiday Special - Limited Time Offer!',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #ef4444, #ec4899); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Holiday Special! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">This holiday season, treat yourself to the gift of beautiful, long-lasting PMU. Our special holiday promotion makes it easier than ever to achieve your dream look.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">What's Included:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Complimentary consultation</li>
              <li>Premium holiday package</li>
              <li>Gift certificate option available</li>
              <li>Extended aftercare support</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{bookingLink}}" style="background: linear-gradient(135deg, #ef4444, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Book Holiday Special</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">Wishing you a beautiful holiday season! ✨</p>
        </div>
      </div>
    `
  },
  'referral-program': {
    subject: 'Refer a Friend, Get Rewarded! 💝',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Refer a Friend, Get Rewarded! 💝</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">You love your PMU results, and we know your friends will too! Our referral program rewards you for sharing the love.</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">How It Works:</h3>
            <ol style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Share your unique referral link with friends</li>
              <li>When they book and complete their first service</li>
              <li>You both receive amazing rewards!</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{referralLink}}" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Your Referral Link</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">Thank you for being an amazing client and ambassador! 🌟</p>
        </div>
      </div>
    `
  },
  'review-request': {
    subject: '⭐ Share Your Experience - Quick Review Request',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⭐ Share Your Experience ⭐</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">We hope you're loving your PMU results! Your feedback helps us improve and helps other clients make informed decisions.</p>
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Quick & Easy:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Takes less than 2 minutes</li>
              <li>Share on Google, Facebook, or Yelp</li>
              <li>Help others discover our services</li>
              <li>We appreciate every review!</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{reviewLink}}" style="background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Review</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">Thank you for choosing us for your PMU journey! 🙏</p>
        </div>
      </div>
    `
  },
  'newsletter': {
    subject: 'Studio Update - Latest News & Tips',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Studio Newsletter</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">Stay updated with the latest from our studio, including new services, tips, and special announcements.</p>
          <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">In This Issue:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Latest PMU trends and techniques</li>
              <li>New service offerings</li>
              <li>Client success stories</li>
              <li>Upcoming events and promotions</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{websiteLink}}" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Visit Our Website</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">Thank you for being part of our PMU community! 💜</p>
        </div>
      </div>
    `
  },
  'appointment-reminder': {
    subject: 'Reminder: Your PMU Appointment Tomorrow',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Appointment Reminder</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{description}}</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">{{offer}}</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">We're looking forward to seeing you for your PMU appointment. Here are some important reminders to help you prepare.</p>
          <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Appointment Details:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Date: {{appointmentDate}}</li>
              <li>Time: {{appointmentTime}}</li>
              <li>Service: {{serviceType}}</li>
              <li>Duration: {{duration}}</li>
            </ul>
          </div>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Pre-Appointment Tips:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Arrive 10 minutes early</li>
              <li>Bring a valid ID</li>
              <li>Avoid caffeine 24 hours before</li>
              <li>Come with clean, makeup-free skin</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{rescheduleLink}}" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reschedule if Needed</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">We can't wait to see you! If you have any questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    `
  }
}

// Simple template engine to replace placeholders
function renderTemplate(template: string, data: any): string {
  let rendered = template
  
  // Replace simple placeholders
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    rendered = rendered.replace(placeholder, data[key] || '')
  })
  
  // Handle conditional blocks
  rendered = rendered.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] ? content : ''
  })
  
  return rendered
}

// Generate personalized content based on campaign type and details
function generatePersonalizedContent(campaignType: string, details: any, clientName?: string) {
  const personalizations = {
    'special-offer': {
      greeting: clientName ? `Hi ${clientName},` : 'Hi there,',
      closing: clientName ? `We can't wait to help you achieve your perfect look, ${clientName}!` : "We can't wait to help you achieve your perfect look!"
    },
    'holiday-promotion': {
      greeting: clientName ? `Dear ${clientName},` : 'Dear Valued Client,',
      closing: clientName ? `Wishing you a beautiful holiday season, ${clientName}!` : "Wishing you a beautiful holiday season!"
    },
    'referral-program': {
      greeting: clientName ? `Hi ${clientName},` : 'Hi there,',
      closing: clientName ? `Thank you for being an amazing client, ${clientName}!` : "Thank you for being an amazing client!"
    },
    'review-request': {
      greeting: clientName ? `Hi ${clientName},` : 'Hi there,',
      closing: clientName ? `Thank you for choosing us, ${clientName}!` : "Thank you for choosing us!"
    },
    'newsletter': {
      greeting: clientName ? `Hello ${clientName},` : 'Hello,',
      closing: clientName ? `Thank you for being part of our community, ${clientName}!` : "Thank you for being part of our community!"
    },
    'appointment-reminder': {
      greeting: clientName ? `Hi ${clientName},` : 'Hi there,',
      closing: clientName ? `We look forward to seeing you soon, ${clientName}!` : "We look forward to seeing you soon!"
    }
  }
  
  return personalizations[campaignType as keyof typeof personalizations] || personalizations['special-offer']
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignType, details, clientName, personalization = true } = body

    if (!campaignType || !emailTemplates[campaignType as keyof typeof emailTemplates]) {
      return NextResponse.json(
        { error: 'Invalid campaign type' },
        { status: 400 }
      )
    }

    const template = emailTemplates[campaignType as keyof typeof emailTemplates]
    const personalized = generatePersonalizedContent(campaignType, details, personalization ? clientName : undefined)
    
    // Prepare template data
    const templateData = {
      description: details.description || '',
      offer: details.offer || '',
      deadline: details.deadline || '',
      greeting: personalized.greeting,
      closing: personalized.closing,
      bookingLink: 'https://your-studio.com/booking',
      referralLink: 'https://your-studio.com/referral',
      reviewLink: 'https://your-studio.com/review',
      websiteLink: 'https://your-studio.com',
      appointmentDate: details.appointmentDate || 'TBD',
      appointmentTime: details.appointmentTime || 'TBD',
      serviceType: details.serviceType || 'PMU Service',
      duration: details.duration || '2-3 hours'
    }

    // Render the email template
    const emailContent = renderTemplate(template.template, templateData)
    
    // Generate subject line
    let subject = template.subject
    if (personalization && clientName) {
      subject = subject.replace('You', clientName)
    }

    return NextResponse.json({
      success: true,
      email: {
        subject,
        content: emailContent,
        campaignType,
        personalization
      }
    })

  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
}
