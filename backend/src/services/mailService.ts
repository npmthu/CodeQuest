import nodemailer, { Transporter } from "nodemailer";
import Handlebars from "handlebars";

/**
 * Mail Service - Handles all transactional emails for CodeQuest
 * Supports SMTP configuration via environment variables
 * Uses Handlebars for dynamic email templates
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

interface TemplateData {
  [key: string]: any;
}

// Email template definitions
const templates = {
  interviewReminder: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎯 Interview Reminder</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
          This is a friendly reminder that your mock interview session is coming up {{timeUntil}}.
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 18px;">📋 Session Details</h2>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #6b7280; font-size: 14px;">Session Title:</td>
              <td style="color: #1f2937; font-size: 14px; font-weight: 600;">{{sessionTitle}}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px;">Topic:</td>
              <td style="color: #1f2937; font-size: 14px;">{{topic}}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px;">Date & Time:</td>
              <td style="color: #1f2937; font-size: 14px;">{{sessionDate}}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px;">Duration:</td>
              <td style="color: #1f2937; font-size: 14px;">{{duration}} minutes</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px;">{{roleLabel}}:</td>
              <td style="color: #1f2937; font-size: 14px;">{{otherPartyName}}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{sessionLink}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Join Session
          </a>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💡 Pro Tips:</strong><br>
            • Test your camera and microphone before the session<br>
            • Find a quiet place with good lighting<br>
            • Have your notes ready if needed
          </p>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0;">
          If you need to reschedule, please do so at least 2 hours before the session.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          © {{year}} CodeQuest. All rights reserved.<br>
          <a href="{{unsubscribeLink}}" style="color: #2563eb; text-decoration: none;">Manage notification preferences</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,

  courseCompletion: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Congratulations!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Dear <strong>{{userName}}</strong>,</p>
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
          We are thrilled to inform you that you have successfully completed the course:
        </p>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px;">{{courseName}}</h2>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Certificate Serial: {{certificateSerial}}</p>
        </div>

        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
          Your dedication and hard work have paid off! This certificate is a testament to your commitment to learning and growth.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{certificateLink}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Your Certificate
          </a>
        </div>

        <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #065f46; margin: 0 0 12px; font-size: 16px;">🚀 What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px;">
            <li style="margin-bottom: 8px;">Share your achievement on LinkedIn</li>
            <li style="margin-bottom: 8px;">Explore more courses to continue learning</li>
            <li style="margin-bottom: 8px;">Practice with mock interviews</li>
            <li>Help others in the community forum</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #374151; margin: 24px 0 0;">
          Keep up the great work! 💪
        </p>
        
        <p style="font-size: 16px; color: #374151; margin: 16px 0 0;">
          Best regards,<br>
          <strong>The CodeQuest Team</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          © {{year}} CodeQuest. All rights reserved.<br>
          <a href="{{dashboardLink}}" style="color: #2563eb; text-decoration: none;">Go to Dashboard</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,

  welcome: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CodeQuest!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to CodeQuest! 🚀</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
          Welcome aboard! We're excited to have you join our community of learners and developers.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{dashboardLink}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Start Learning
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0;">
          Happy coding!<br>
          <strong>The CodeQuest Team</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          © {{year}} CodeQuest. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,

  generic: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CodeQuest</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        {{{content}}}
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          © {{year}} CodeQuest. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
};

export class MailService {
  private transporter: Transporter;
  private fromAddress: string;
  private isConfigured: boolean = false;
  private compiledTemplates: Map<string, Handlebars.TemplateDelegate> =
    new Map();

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || "noreply@codequest.com";
    this.transporter = this.createTransporter();
    this.compileTemplates();
  }

  /**
   * Create the nodemailer transporter based on environment configuration
   */
  private createTransporter(): Transporter {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    // Check if SMTP is configured
    if (host && user && pass) {
      this.isConfigured = true;
      console.log("📧 Mail Service: Using SMTP configuration");

      return nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
    }

    // Fallback: Create Ethereal test account for development
    console.log(
      "📧 Mail Service: SMTP not configured, using Ethereal (emails will be logged, not sent)"
    );
    this.isConfigured = false;

    // Return a mock transporter that logs emails
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal_pass",
      },
    });
  }

  /**
   * Pre-compile all Handlebars templates
   */
  private compileTemplates(): void {
    for (const [name, template] of Object.entries(templates)) {
      this.compiledTemplates.set(name, Handlebars.compile(template));
    }
  }

  /**
   * Render a template with provided data
   */
  private renderTemplate(
    templateName: keyof typeof templates,
    data: TemplateData
  ): string {
    const template = this.compiledTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Add common data
    const enrichedData = {
      ...data,
      year: new Date().getFullYear(),
      dashboardLink:
        process.env.FRONTEND_URL || "http://localhost:5173/dashboard",
      unsubscribeLink: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/settings`,
    };

    return template(enrichedData);
  }

  /**
   * Send an email
   */
  async sendEmail(
    options: SendEmailOptions
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    try {
      const recipients = Array.isArray(options.to)
        ? options.to.join(", ")
        : options.to;

      // In development without SMTP, log the email instead
      if (!this.isConfigured) {
        console.log("📧 [DEV MODE] Email would be sent:");
        console.log(`   To: ${recipients}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   (HTML content omitted for brevity)`);
        return { success: true, messageId: "dev-mode-" + Date.now() };
      }

      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        attachments: options.attachments,
      });

      console.log(`📧 Email sent: ${info.messageId}`);

      // Get Ethereal preview URL if using test account
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Preview URL: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error) {
      console.error("📧 Failed to send email:", error);
      return { success: false };
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ==================== Specific Email Methods ====================

  /**
   * Send interview reminder email
   */
  async sendInterviewReminder(params: {
    to: string;
    userName: string;
    sessionTitle: string;
    topic: string;
    sessionDate: string;
    duration: number;
    sessionLink: string;
    timeUntil: string; // "in 24 hours" or "in 1 hour"
    roleLabel: string; // "Instructor" or "Learner"
    otherPartyName: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const html = this.renderTemplate("interviewReminder", params);

    return this.sendEmail({
      to: params.to,
      subject: `🎯 Interview Reminder: ${params.sessionTitle} - ${params.timeUntil}`,
      html,
    });
  }

  /**
   * Send course completion congratulation email
   */
  async sendCourseCompletionEmail(params: {
    to: string;
    userName: string;
    courseName: string;
    certificateSerial: string;
    certificateLink: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const html = this.renderTemplate("courseCompletion", params);

    return this.sendEmail({
      to: params.to,
      subject: `🎉 Congratulations! You've completed ${params.courseName}`,
      html,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(params: {
    to: string;
    userName: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const html = this.renderTemplate("welcome", params);

    return this.sendEmail({
      to: params.to,
      subject: "🚀 Welcome to CodeQuest!",
      html,
    });
  }

  /**
   * Send a generic email with custom content
   */
  async sendGenericEmail(params: {
    to: string;
    subject: string;
    content: string; // HTML content for the body
  }): Promise<{ success: boolean; messageId?: string }> {
    const html = this.renderTemplate("generic", {
      subject: params.subject,
      content: params.content,
    });

    return this.sendEmail({
      to: params.to,
      subject: params.subject,
      html,
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      console.log("📧 Mail Service: Skipping verification (not configured)");
      return true;
    }

    try {
      await this.transporter.verify();
      console.log("📧 Mail Service: SMTP connection verified");
      return true;
    } catch (error) {
      console.error("📧 Mail Service: SMTP connection failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const mailService = new MailService();
