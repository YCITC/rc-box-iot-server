import { Controller, Get, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ExampleAppService } from './example.service';
import { Request, Response } from 'express';

@Controller('myRouter')
export class ExampleAppController {
  constructor(private readonly appService: ExampleAppService) {}

  @Get()
  getHello(): string {
    // Controller 可以從 Service那邊拿資料
    return this.appService.getHello();
  }

  @Post('test_req')
  req_func(@Req() req: Request): string {
    console.log('request: ', req);
    if (req.header) console.log('headers: ', req.headers);
    if (req.query) console.log('query: ', req.query);
    if (req.body) console.log('body: ', req.body);
    return 'This is test';
  }

  @Post('test_res')
  res_func(@Req() req: Request, @Res() res: Response) {
    let returnObj = {};
    // console.log('request: ', req);
    if (req.header) console.log('headers: ', req.headers);
    if (req.query) console.log('query: ', req.query);
    if (req.body) console.log('body: ', req.body);
    returnObj = {
      success: true,
    };
    return res.status(HttpStatus.OK).json(returnObj);
  }
}
