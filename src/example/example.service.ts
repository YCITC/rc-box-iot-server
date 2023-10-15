import { Injectable } from '@nestjs/common';

@Injectable()
export default class ExampleAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
