import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller("cats")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Post("test")
  r2(@Req() req: Request, ): string {
    // console.log("request: ", req);
    console.log("headers: ", req.headers);
    console.log("body: ", req.body);
    console.log("query: ", req.query);
    return "This is test";
  }
}
