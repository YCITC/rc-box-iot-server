import { Test, TestingModule } from '@nestjs/testing';
import { ExampleAppController } from './example.controller';
import { ExampleAppService } from './example.service';

describe('ExampleController1', () => {
  let appController: ExampleAppController;
  // let exampleAppService: ExampleAppService;

  beforeEach(async () => {
    // 先包成module 再測試
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExampleAppController],
      providers: [ExampleAppService],
    }).compile();

    appController = app.get<ExampleAppController>(ExampleAppController);
    // exampleAppService = app.get<ExampleAppService>(ExampleAppService);
    // exampleAppService = await app.resolve(ExampleAppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

// 我們在 expect appController.getHello 的 controller可以直接用
// appService = new ExampleAppService();
// appController = new ExampleAppController(appService);
// 但 nest官網推薦用下面的 Test.createTestingModule 做法來模擬完整的 Nest runtime，
// 就像是main.ts 裡面的 NestFactory.create()
// const app: TestingModule = await Test.createTestingModule(~~~~).compile();
