import { Controller, Get, Post, Req, Res, HttpStatus} from '@nestjs/common';
import { Request, Response } from 'express';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogInterface } from '../interfaces/recived_log.interface'

@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get('all')
  getHello(): ReceivedLogInterface[] {
    return this.receiveService.findAll();
    // return 'Log All';
  }

  @Get('device')
  byDeviceId(@Req() req: Request, @Res() res: Response) {
    let returnObj = {};
    let list : ReceivedLogInterface[];
    let deviceId: string;
    if (req.body.deviceId !== undefined) {
      deviceId = req.body.deviceId;
      list = this.receiveService.findByDeviceId(deviceId);
      returnObj = {
        success: true,
      };
    } else {
      returnObj = {
        success: false,
        message: 'Lost "deviceId" in request body, type string.'
      };
    }

    return res.status(HttpStatus.OK).json(returnObj); ;
    
  }

  @Post('add')
  add(@Req() req: Request): boolean {
    // console.log('request: ', req);
    console.log('headers: ', req.headers);
    console.log('body: ', req.body);
    console.log('query: ', req.query);
    if (req.body.id != undefined) {
      this.receiveService.add(req.body);
      return true;
    } else {
      return false;
    }
  }
}
