import { registerAs } from '@nestjs/config';

export default registerAs('EMAIL', () => ({
  transport: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'yesseecity.co@gmail.com',
      pass: 'gmailSMTPPassword',
    },
  },
  defaults: {
    from: '"RC-Box Service" <yesseecity.co@gmail.com>',
  },
}));
