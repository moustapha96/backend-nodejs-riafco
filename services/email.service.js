const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", result.messageId)
      return result
    } catch (error) {
      console.error("Failed to send email:", error)
      throw error
    }
  }

  async sendWelcomeEmail(user) {
    const subject = "Welcome to RIAFCO!"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to RIAFCO, ${user.firstName}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now access the RIAFCO backoffice system with your credentials.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>The RIAFCO Team</p>
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Welcome to RIAFCO, ${user.firstName}! Your account has been successfully created.`,
    })
  }

  async sendInvitationEmail(user, tempPassword) {
    const subject = "RIAFCO Account Invitation"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join RIAFCO!</h2>
        <p>Hello ${user.firstName},</p>
        <p>An account has been created for you on the RIAFCO backoffice system.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
        <p>If you have any questions, please contact our support team.</p>
        <br>
        <p>Best regards,<br>The RIAFCO Team</p>
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `You've been invited to join RIAFCO! Email: ${user.email}, Temporary Password: ${tempPassword}`,
    })
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const subject = "Password Reset Request"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset for your RIAFCO account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The RIAFCO Team</p>
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Password reset requested. Visit: ${resetUrl}`,
    })
  }

  async sendPasswordResetNotification(user, newPassword) {
    const subject = "Your Password Has Been Reset"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Notification</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your password has been reset by an administrator.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>New Temporary Password:</strong> ${newPassword}</p>
        </div>
        <p><strong>Important:</strong> Please change this password after your next login for security reasons.</p>
        <br>
        <p>Best regards,<br>The RIAFCO Team</p>
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Your password has been reset. New temporary password: ${newPassword}`,
    })
  }

  async sendNewsletterEmail(subscribers, newsletter) {
    const promises = subscribers.map((subscriber) => {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${newsletter.subject}</h2>
          ${newsletter.htmlContent || newsletter.content}
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because you subscribed to RIAFCO newsletter.
            <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${subscriber.email}">Unsubscribe</a>
          </p>
        </div>
      `

      return this.sendEmail({
        to: subscriber.email,
        subject: newsletter.subject,
        html,
        text: newsletter.content,
      })
    })

    return Promise.allSettled(promises)
  }
}

module.exports = new EmailService()
