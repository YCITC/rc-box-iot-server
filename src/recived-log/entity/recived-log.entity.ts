import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'received_log',
  engine: 'MyISAM',
})
export default class ReceivedLog {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @ApiProperty({ example: '2023-03-21 08:46:11' })
  @CreateDateColumn({ type: 'timestamp' })
  time: Date;

  @ApiProperty({ example: 'rc-box-test-12301' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  deviceId: string;

  constructor(deviceId: string, time?: Date, id?: number);
  constructor(deviceId: string, time?: Date, id?: number) {
    if (time) {
      this.time = time;
    } else {
      const now = new Date();
      this.time = new Date(now.toLocaleDateString());
    }
    this.id = id;
    this.deviceId = deviceId;
  }
}
