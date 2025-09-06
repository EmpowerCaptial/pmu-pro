// Email notification service for deposit payments
// Sends deposit payment links to clients

import { DepositPayment } from "./deposit-payment-service";
import { EmailService } from "./email-service";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class DepositEmailService {
  /**
   * Generate deposit payment email template
   */
  static generateDepositEmailTemplate(
    depositPayment: DepositPayment,
    clientName: string,
    artistName: string,
    businessName: string,
    depositLink: string
  ): EmailTemplate {
    const depositAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: depositPayment.currency
    }).format(depositPayment.amount);

    const totalAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: depositPayment.currency
    }).format(depositPayment.totalAmount);

    const remainingAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: depositPayment.currency
    }).format(depositPayment.remainingAmount);

    const expirationDate = new Date(depositPayment.depositLinkExpiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = `Deposit Payment Required - ${businessName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deposit Payment Required</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .payment-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Deposit Payment Required</h1>
            <p>Secure your appointment with ${businessName}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${clientName},</h2>
            
            <p>Thank you for booking your appointment with ${artistName} at ${businessName}. To secure your appointment time, a deposit payment is required.</p>
            
            <div class="payment-card">
              <h3>Payment Details</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Deposit Amount:</span>
                <span class="amount">${depositAmount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Total Procedure Cost:</span>
                <span>${totalAmount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold;">
                <span>Due on Procedure Day:</span>
                <span>${remainingAmount}</span>
              </div>
            </div>
            
            <div class="info-box">
              <strong>Important Information:</strong>
              <ul>
                <li>Your deposit secures your appointment time</li>
                <li>The remaining balance is due on the day of your procedure</li>
                <li>All payments are processed securely through Stripe</li>
                <li>You will receive a receipt via email after payment</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${depositLink}" class="button">Pay Deposit Now</a>
            </div>
            
            <div class="warning-box">
              <strong>Payment Link Expires:</strong> ${expirationDate}
              <br>
              Please complete your payment before this date to secure your appointment.
            </div>
            
            <p>If you have any questions or need to reschedule, please contact ${artistName} directly.</p>
            
            <p>Thank you for choosing ${businessName}!</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PMU Pro on behalf of ${businessName}</p>
            <p>Powered by PMU Pro • Secure payment processing by Stripe</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Deposit Payment Required - ${businessName}
      
      Hello ${clientName},
      
      Thank you for booking your appointment with ${artistName} at ${businessName}. To secure your appointment time, a deposit payment is required.
      
      Payment Details:
      - Deposit Amount: ${depositAmount}
      - Total Procedure Cost: ${totalAmount}
      - Due on Procedure Day: ${remainingAmount}
      
      Important Information:
      - Your deposit secures your appointment time
      - The remaining balance is due on the day of your procedure
      - All payments are processed securely through Stripe
      - You will receive a receipt via email after payment
      
      Payment Link: ${depositLink}
      
      Payment Link Expires: ${expirationDate}
      Please complete your payment before this date to secure your appointment.
      
      If you have any questions or need to reschedule, please contact ${artistName} directly.
      
      Thank you for choosing ${businessName}!
      
      This email was sent by PMU Pro on behalf of ${businessName}
      Powered by PMU Pro • Secure payment processing by Stripe
    `;

    return { subject, html, text };
  }

  /**
   * Send deposit payment email
   */
  static async sendDepositEmail(
    to: string,
    depositPayment: DepositPayment,
    clientName: string,
    artistName: string,
    businessName: string,
    depositLink: string
  ): Promise<boolean> {
    try {
      const template = this.generateDepositEmailTemplate(
        depositPayment,
        clientName,
        artistName,
        businessName,
        depositLink
      );

      // Use existing EmailService
      await EmailService.sendEmail({
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      return true;
    } catch (error) {
      console.error('Failed to send deposit email:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmationEmail(
    to: string,
    depositPayment: DepositPayment,
    clientName: string,
    artistName: string,
    businessName: string
  ): Promise<boolean> {
    try {
      const depositAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: depositPayment.currency
      }).format(depositPayment.amount);

      const remainingAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: depositPayment.currency
      }).format(depositPayment.remainingAmount);

      const subject = `Payment Confirmed - ${businessName}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
            .success-card { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; }
            .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed!</h1>
              <p>Your deposit has been successfully processed</p>
            </div>
            
            <div class="content">
              <h2>Hello ${clientName},</h2>
              
              <div class="success-card">
                <h3>✅ Payment Successful</h3>
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                  <span>Deposit Paid:</span>
                  <span class="amount">${depositAmount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                  <span>Remaining Balance:</span>
                  <span>${remainingAmount}</span>
                </div>
              </div>
              
              <p>Your appointment is now confirmed and secured! We look forward to seeing you for your procedure.</p>
              
              <div class="info-box">
                <strong>Next Steps:</strong>
                <ul>
                  <li>You will receive appointment reminders before your scheduled date</li>
                  <li>The remaining balance (${remainingAmount}) is due on the day of your procedure</li>
                  <li>Please arrive 15 minutes early for your appointment</li>
                  <li>Contact ${artistName} if you have any questions</li>
                </ul>
              </div>
              
              <p>Thank you for choosing ${businessName}!</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by PMU Pro on behalf of ${businessName}</p>
              <p>Powered by PMU Pro • Secure payment processing by Stripe</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
        Payment Confirmed - ${businessName}
        
        Hello ${clientName},
        
        ✅ Payment Successful
        
        Deposit Paid: ${depositAmount}
        Remaining Balance: ${remainingAmount}
        
        Your appointment is now confirmed and secured! We look forward to seeing you for your procedure.
        
        Next Steps:
        - You will receive appointment reminders before your scheduled date
        - The remaining balance (${remainingAmount}) is due on the day of your procedure
        - Please arrive 15 minutes early for your appointment
        - Contact ${artistName} if you have any questions
        
        Thank you for choosing ${businessName}!
        
        This email was sent by PMU Pro on behalf of ${businessName}
        Powered by PMU Pro • Secure payment processing by Stripe
      `;

      // Use existing EmailService
      await EmailService.sendEmail({
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
        subject,
        html,
        text
      });

      return true;
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
      return false;
    }
  }
}
