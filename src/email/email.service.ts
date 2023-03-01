import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string) {
    return this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendVerificationEmail(to: string, verificationURL: string) {
    const subject = 'RC-Box Verification Mail';
    let content =
      'This is a verification email. Please click on the URL provided to verify your account.\n';
    content += verificationURL;
    return this.mailerService.sendMail({
      to,
      subject,
      text: content,
    });
  }
}
