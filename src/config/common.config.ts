import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  // # Email Verif
  VERIFY_SUCCESS_URL: 'https://www.yesseecity.net',
  VERIFY_FAILED_URL: 'https://www.google.com',

  // # DocumentBuilder
  DOCUMENT_ENABLE: true,

  // Version information
  VERSION: '0.2.0',
}));
