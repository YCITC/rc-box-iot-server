import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mailTo = 'jane@example.com';
  const mailSubject = 'Test email';
  const mailText = 'This is a test email';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue({ messageId: 'abc123' }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailerService).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email with the correct data', async () => {
      const sendMailSpy = jest.spyOn(mailerService, 'sendMail');

      await service.sendEmail(mailTo, mailSubject, mailText);
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: mailTo,
        subject: mailSubject,
        text: mailText,
      });
    });

    it('should return a message ID when the email is sent', async () => {
      const result = await service.sendEmail(mailTo, mailSubject, mailText);
      expect(result.messageId).toBeDefined();
    });
  });
});
