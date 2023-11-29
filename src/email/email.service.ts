import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export default class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string) {
    return this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  sendResetPasswordEmail(to: string, verificationURL: string) {
    const subject = 'RC-Box Reset Password';
    const html = `
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody>
          <tr>
            <td>
              You requested a password reset for your RC-Box account.<br>
              Please visit the following link to enter your new password:
            </td>
          </tr>
          <tr>
            <td>
              <a href="${verificationURL}" target="_blank" title="RC-Box Reset Password" >RC-Box Reset Password</a>
            </td>
          </tr>
        </tbody>
      </table>
    `;
    return this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }

  sendVerificationEmail(to: string, verificationURL: string) {
    const subject = 'RC-Box Verification Mail';
    const html = `
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody>
          <tr>
            <td>
              This is a verification email. Please click on the URL provided to verify your account.
            </td>
          </tr>
          <tr>
            <td>
              <a href="${verificationURL}" target="_blank" title="RC-Box Verification" >RC-Box Verification </a>
            </td>
          </tr>
        </tbody>
      </table>
    `;
    return this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }
}
