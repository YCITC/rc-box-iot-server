import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  // # Email Verif
  VERIFY_SUCCESS_URL: 'http://rc-box.yesseecity.com',
  VERIFY_FAILED_URL: 'http://rc-box.yesseecity.com',

  // # DocumentBuilder
  DOCUMENT_ENABLE: true,
}));
