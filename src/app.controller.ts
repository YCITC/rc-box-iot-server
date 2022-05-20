import { Controller, Get, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller('myRouter')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test_req')
  r2(@Req() req: Request): string {
    // console.log('request: ', req);
    console.log('headers: ', req.headers);
    console.log('body: ', req.body);
    console.log('query: ', req.query);
    return 'This is test';
  }
  @Post('test_res')
  res(@Req() req: Request, @Res() res: Response) {
    let returnObj = {};
    // console.log('request: ', req);
    console.log('headers: ', req.headers);
    console.log('body: ', req.body);
    console.log('query: ', req.query);
    returnObj = {
      success: true,
    };
    return res.status(HttpStatus.OK).json(returnObj);
  }
}
