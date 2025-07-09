import { supabase } from './supabase'

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  // Send email notification for complaint status updates
  static async sendComplaintStatusEmail(
    complaintId: string, 
    newStatus: string, 
    responseMessage: string,
    officerName: string
  ) {
    try {
      // Get complaint and student details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            users(name, email)
          ),
          departments(name, code)
        `)
        .eq('id', complaintId)
        .single()

      if (complaintError || !complaint) {
        throw new Error('Failed to fetch complaint details')
      }

      const studentEmail = complaint.students?.users?.email
      const studentName = complaint.students?.users?.name

      if (!studentEmail) {
        throw new Error('Student email not found')
      }

      // Create email content
      const emailData = this.createStatusUpdateEmail(
        complaint,
        newStatus,
        responseMessage,
        officerName,
        studentName,
        studentEmail
      )

      // Send email using Supabase Edge Function or external service
      const result = await this.sendEmail(emailData)
      
      return { success: true, result }
    } catch (error: any) {
      console.error('Error sending complaint status email:', error)
      return { success: false, error: error.message }
    }
  }

  // Create formatted email content for status updates
  private static createStatusUpdateEmail(
    complaint: any,
    newStatus: string,
    responseMessage: string,
    officerName: string,
    studentName: string,
    studentEmail: string
  ): EmailData {
    const statusText = newStatus === 'resolved' ? 'Resolved' : 'Rejected'
    const statusColor = newStatus === 'resolved' ? '#10B981' : '#EF4444'
    
    const subject = `Complaint ${statusText}: ${complaint.complaint_id}`
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complaint Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .complaint-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .response-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .footer a { color: #3b82f6; text-decoration: none; font-weight: bold; }
        .footer a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 NAHPI Complaint Management System</h1>
            <p>Complaint Status Update</p>
        </div>
        
        <div class="content">
            <h2>Dear ${studentName},</h2>
            
            <p>We are writing to inform you that your complaint has been <strong>${statusText.toLowerCase()}</strong> by our department officer.</p>
            
            <div class="complaint-details">
                <h3>📋 Complaint Details</h3>
                <p><strong>Complaint ID:</strong> ${complaint.complaint_id}</p>
                <p><strong>Title:</strong> ${complaint.title}</p>
                <p><strong>Department:</strong> ${complaint.departments?.name || 'Unknown'}</p>
                <p><strong>Course:</strong> ${complaint.course_code} - ${complaint.course_title}</p>
                <p><strong>Submitted:</strong> ${new Date(complaint.submitted_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge" style="background-color: ${statusColor};">${statusText.toUpperCase()}</span></p>
            </div>
            
            ${responseMessage ? `
            <div class="response-box">
                <h3>💬 Officer Response</h3>
                <p><strong>From:</strong> ${officerName}</p>
                <p><strong>Message:</strong></p>
                <p style="font-style: italic;">"${responseMessage}"</p>
            </div>
            ` : ''}
            
            <p>If you have any questions or concerns about this decision, please don't hesitate to contact our support team or visit your student portal for more information.</p>
            
            <p>Thank you for using the NAHPI Complaint Management System.</p>
            
            <p>Best regards,<br>
            <strong>NAHPI Academic Affairs</strong></p>
        </div>
        
        <div class="footer">
            <p>🌐 <strong>Checkout:</strong> <a href="https://ubastudent.online/" target="_blank">https://ubastudent.online/</a></p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                This is an automated message from the NAHPI Complaint Management System.<br>
                Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `

    const text = `
NAHPI Complaint Management System - Complaint Status Update

Dear ${studentName},

Your complaint has been ${statusText.toLowerCase()} by our department officer.

Complaint Details:
- Complaint ID: ${complaint.complaint_id}
- Title: ${complaint.title}
- Department: ${complaint.departments?.name || 'Unknown'}
- Course: ${complaint.course_code} - ${complaint.course_title}
- Status: ${statusText.toUpperCase()}

${responseMessage ? `Officer Response from ${officerName}: "${responseMessage}"` : ''}

If you have any questions, please contact our support team.

Checkout: https://ubastudent.online/

Best regards,
NAHPI Academic Affairs
    `

    return {
      to: studentEmail,
      subject,
      html,
      text
    }
  }

  // Send email using a service (placeholder for actual implementation)
  private static async sendEmail(emailData: EmailData) {
    try {
      // For now, we'll simulate email sending
      // In production, you would integrate with:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - Supabase Edge Functions
      
      console.log('📧 Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For demonstration, we'll log the email content
      console.log('📧 Email Content Preview:')
      console.log('Subject:', emailData.subject)
      console.log('To:', emailData.to)
      console.log('Text Content:', emailData.text?.substring(0, 200) + '...')

      // In production, replace this with actual email service call:
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
      
      return await response.json()
      */

      return { 
        success: true, 
        messageId: `sim_${Date.now()}`,
        message: 'Email sent successfully (simulated)'
      }
    } catch (error: any) {
      console.error('Error in sendEmail:', error)
      throw error
    }
  }

  // Send welcome email to new students
  static async sendWelcomeEmail(studentEmail: string, studentName: string, matricule: string) {
    try {
      const emailData: EmailData = {
        to: studentEmail,
        subject: 'Welcome to NAHPI Complaint Management System',
        html: `
          <h2>Welcome to NAHPI, ${studentName}!</h2>
          <p>Your account has been created successfully.</p>
          <p><strong>Matricule:</strong> ${matricule}</p>
          <p>You can now submit and track complaints through our system.</p>
          <p><strong>Checkout:</strong> <a href="https://ubastudent.online/">https://ubastudent.online/</a></p>
        `,
        text: `Welcome to NAHPI, ${studentName}! Your matricule is ${matricule}. Checkout: https://ubastudent.online/`
      }

      return await this.sendEmail(emailData)
    } catch (error: any) {
      console.error('Error sending welcome email:', error)
      return { success: false, error: error.message }
    }
  }
}
