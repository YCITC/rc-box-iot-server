import { Controller, Get, Post, Req, Res, Body, Param, HttpStatus} from '@nestjs/common';
import { Request, Response } from 'express';
import { ReceivedLog } from './recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogDto } from './dto/recived-log.dto'
// import { ReceivedLogInterface } from './interfaces/recived_log.interface'


@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get()
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.findAll();
  }

  @Post('add')
  create(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    return this.receiveService.create(receivedLogDto);
  }

  // @Get(':deviceId')
  // findByDevice(@Param('deviceId') deviceId: string): Promise<ReceivedLog> {
  //   return this.receiveService.findByDevice(deviceId);
  // }

  // byDeviceId(@Req() req: Request, @Res() res: Response) {
  //   let returnObj = {};
  //   let list : ReceivedLogInterface[];
  //   let deviceId: string;
  //   if (req.body.deviceId !== undefined) {
  //     deviceId = req.body.deviceId;
  //     list = this.receiveService.findByDeviceId(deviceId);
  //     console.log(list)
  //     returnObj = {
  //       success: true,
  //       logs: list
  //     };
  //   } else {
  //     returnObj = {
  //       success: false,
  //       message: 'Lost "deviceId" in request body, type string.'
  //     };
  //   }

  //   return res.status(HttpStatus.OK).json(returnObj); ;
    
  // }

  // @Post('add')
  // add(@Req() req: Request): boolean {
  //   // console.log('request: ', req);
  //   console.log('headers: ', req.headers);
  //   console.log('body: ', req.body);
  //   console.log('query: ', req.query);
  //   if (req.body.id != undefined) {
  //     this.receiveService.add(req.body);
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
}
