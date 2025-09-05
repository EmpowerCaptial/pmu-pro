// Consent Form Reminder Service
// Handles automatic reminders for unsigned consent forms

import { ConsentForm, ConsentNotification } from "@/types/consent-forms"

export class ConsentReminderService {
  private static instance: ConsentReminderService
  private reminderInterval: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): ConsentReminderService {
    if (!ConsentReminderService.instance) {
      ConsentReminderService.instance = new ConsentReminderService()
    }
    return ConsentReminderService.instance
  }

  startReminderService() {
    if (this.isRunning) return
    
    this.isRunning = true
    // Check every hour for forms that need reminders
    this.reminderInterval = setInterval(() => {
      this.checkForReminders()
    }, 60 * 60 * 1000) // 1 hour
    
    // Also check immediately on start
    this.checkForReminders()
    
    console.log("Consent reminder service started")
  }

  stopReminderService() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval)
      this.reminderInterval = null
    }
    this.isRunning = false
    console.log("Consent reminder service stopped")
  }

  private async checkForReminders() {
    try {
      const forms = this.getConsentForms()
      const now = new Date()
      
      forms.forEach(form => {
        if (this.shouldSendReminder(form, now)) {
          this.sendReminder(form)
        }
      })
    } catch (error) {
      console.error("Error checking for reminders:", error)
    }
  }

  private shouldSendReminder(form: ConsentForm, now: Date): boolean {
    // Only send reminders for sent forms that haven't expired
    if (form.status !== "sent") return false
    if (now > form.expiresAt) return false
    
    const sentTime = new Date(form.sentAt)
    const hoursSinceSent = (now.getTime() - sentTime.getTime()) / (1000 * 60 * 60)
    
    // Send reminder after 24 hours if not already sent
    return hoursSinceSent >= 24 && !form.reminderSent
  }

  private async sendReminder(form: ConsentForm) {
    try {
      // Create reminder notification
      const notification: ConsentNotification = {
        id: `reminder-${form.id}-${Date.now()}`,
        type: "reminder-needed",
        clientId: form.clientId,
        clientName: form.clientName,
        formType: form.formType,
        message: `Consent form sent 24+ hours ago. Consider sending a reminder.`,
        timestamp: new Date(),
        isRead: false,
        actionRequired: true,
        priority: "medium"
      }

      // Save notification
      this.saveNotification(notification)
      
      // Mark reminder as sent
      this.markReminderSent(form.id)
      
      // In production, this would also send actual email/SMS
      await this.sendActualReminder(form)
      
      console.log(`Reminder sent for form ${form.id}`)
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  private async sendActualReminder(form: ConsentForm) {
    try {
      console.log(`Sending ${form.sendMethod} reminder to ${form.contactInfo} for form ${form.id}`)
      
      // Send real email reminder
      if (form.sendMethod === "email") {
        try {
          const { EmailService } = await import("@/lib/email-service")
          const formLink = this.getFormLink(form)
          
          await EmailService.sendEmail({
            to: form.contactInfo,
            from: process.env.SENDGRID_FROM_EMAIL || "noreply@thepmuguide.com",
            subject: `Reminder: Complete Your ${form.formType} Consent Form - PMU Pro`,
            html: this.generateReminderEmailHTML(form.formType, formLink, form.clientName),
            text: this.generateReminderEmailText(form.formType, formLink, form.clientName)
          })
          
          console.log(`✅ Reminder email sent successfully to: ${form.contactInfo}`)
        } catch (emailError) {
          console.error("❌ Reminder email failed:", emailError)
        }
      }
      
      // SMS reminder (placeholder for future implementation)
      if (form.sendMethod === "sms") {
        console.log(`SMS reminder would be sent to: ${form.contactInfo}`)
        // TODO: Implement SMS service integration
      }
    } catch (error) {
      console.error("Error in sendActualReminder:", error)
    }
  }

  private getFormLink(form: ConsentForm): string {
    return `https://thepmuguide.com/forms/${form.clientId}/${form.token}`
  }

  private generateReminderEmailHTML(formType: string, formLink: string, clientName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder: Complete Consent Form - PMU Pro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Reminder</h1>
            <p>PMU Pro - Consent Form Pending</p>
          </div>
          
          <div class="content">
            <h2>Complete Your Consent Form</h2>
            <p>Hello ${clientName},</p>
            
            <div class="urgent">
              <strong>This is a friendly reminder that your ${formType} consent form is still pending completion.</strong>
            </div>
            
            <p>To ensure your PMU procedure can proceed as scheduled, please complete the consent form as soon as possible.</p>
            
            <div style="text-align: center;">
              <a href="${formLink}" class="button">Complete Consent Form Now</a>
            </div>
            
            <p><strong>Why this is important:</strong></p>
            <ul>
              <li>Required before your procedure</li>
              <li>Ensures your safety and informed consent</li>
              <li>Helps your artist prepare for your session</li>
              <li>Link expires in 7 days</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact your PMU artist immediately.</p>
            
            <p>Best regards,<br>The PMU Pro Team</p>
          </div>
          
          <div class="footer">
            <p>This reminder was sent from PMU Pro - Professional Permanent Makeup Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateReminderEmailText(formType: string, formLink: string, clientName: string): string {
    return `
Reminder: Complete Your Consent Form - PMU Pro

Hello ${clientName},

This is a friendly reminder that your ${formType} consent form is still pending completion.

To ensure your PMU procedure can proceed as scheduled, please complete the consent form as soon as possible.

Complete your consent form here: ${formLink}

Why this is important:
- Required before your procedure
- Ensures your safety and informed consent
- Helps your artist prepare for your session
- Link expires in 7 days

If you have any questions or need assistance, please contact your PMU artist immediately.

Best regards,
The PMU Pro Team

---
This reminder was sent from PMU Pro - Professional Permanent Makeup Platform
    `
  }

  private getConsentForms(): ConsentForm[] {
    try {
      const stored = localStorage.getItem("consent-forms")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading consent forms:", error)
      return []
    }
  }

  private saveNotification(notification: ConsentNotification) {
    try {
      const existing = JSON.parse(localStorage.getItem("consent-notifications") || "[]")
      existing.push(notification)
      localStorage.setItem("consent-notifications", JSON.stringify(existing))
    } catch (error) {
      console.error("Error saving notification:", error)
    }
  }

  private markReminderSent(formId: string) {
    try {
      const stored = localStorage.getItem("consent-forms")
      if (stored) {
        const forms: ConsentForm[] = JSON.parse(stored)
        const updatedForms = forms.map(form => 
          form.id === formId ? { ...form, reminderSent: true } : form
        )
        localStorage.setItem("consent-forms", JSON.stringify(updatedForms))
      }
    } catch (error) {
      console.error("Error marking reminder sent:", error)
    }
  }

  // Manual reminder sending (for testing or manual intervention)
  async sendManualReminder(formId: string) {
    const forms = this.getConsentForms()
    const form = forms.find(f => f.id === formId)
    
    if (form) {
      await this.sendReminder(form)
      return true
    }
    
    return false
  }

  // Get forms that need reminders
  getFormsNeedingReminders(): ConsentForm[] {
    const forms = this.getConsentForms()
    const now = new Date()
    
    return forms.filter(form => 
      form.status === "sent" && 
      now < form.expiresAt && 
      !form.reminderSent &&
      (new Date(form.sentAt).getTime() + 24 * 60 * 60 * 1000) <= now.getTime()
    )
  }

  // Get reminder statistics
  getReminderStats() {
    const forms = this.getConsentForms()
    const now = new Date()
    
    const totalSent = forms.filter(f => f.status === "sent").length
    const needsReminder = forms.filter(f => 
      f.status === "sent" && 
      now < f.expiresAt && 
      !f.reminderSent &&
      (new Date(f.sentAt).getTime() + 24 * 60 * 60 * 1000) <= now.getTime()
    ).length
    const remindersSent = forms.filter(f => f.reminderSent).length
    const expired = forms.filter(f => f.status === "expired").length
    
    return {
      totalSent,
      needsReminder,
      remindersSent,
      expired,
      responseRate: totalSent > 0 ? ((totalSent - needsReminder) / totalSent * 100).toFixed(1) : "0"
    }
  }
}

// Export singleton instance
export const consentReminderService = ConsentReminderService.getInstance()
