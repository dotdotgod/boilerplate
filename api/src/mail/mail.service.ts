import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from:
          options.from ||
          `"No Reply" <${this.configService.get<string>('SMTP_USER')}>`,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      await this.mailerService.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to Our Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Platform!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get<string>('BASE_URL')}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `;

    return this.sendMail({ to, subject, html });
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('BASE_URL')}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `;

    return this.sendMail({ to, subject, html });
  }

  async sendVerificationEmail(
    to: string,
    userName: string,
    verificationToken: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('BASE_URL')}/verify-email?token=${verificationToken}`;
    const subject = 'Please Verify Your Email Address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Email Verification Required</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with our platform. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `;

    return this.sendMail({ to, subject, html });
  }

  async sendRegistrationEmail(
    to: string,
    registrationToken: string,
  ): Promise<boolean> {
    const registrationUrl = `${this.configService.get<string>('BASE_URL')}/complete-registration?token=${registrationToken}`;
    const subject = 'Complete Your Registration';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Complete Your Registration</h2>
        <p>Hello,</p>
        <p>Thank you for starting your registration with our platform. To complete your account setup, please click the button below and provide your name and password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${registrationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Complete Registration
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${registrationUrl}</p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `;

    return this.sendMail({ to, subject, html });
  }

  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    message: string,
    isHtml = false,
  ): Promise<boolean> {
    const content = isHtml
      ? message
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Notification</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      html: isHtml ? message : content,
      text: isHtml ? undefined : message,
    });
  }
}
