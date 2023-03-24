import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'received_log',
  engine: 'MyISAM',
})
export class ReceivedLog {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @ApiProperty({ example: '2023-03-21 08:46:11' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  time: Date;

  @ApiProperty({ example: 'rc-box-v1-a12301' })
  @Column({
    type: 'varchar',
    length: 16,
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
