import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'devices',
  engine: 'MyISAM',
})
export class Device {
  @ApiProperty({ example: 'rc-box-test-12301' })
  @PrimaryColumn({
    unique: true,
    type: 'varchar',
    length: 20,
  })
  deviceId: string;

  @ApiProperty({ example: 1 })
  @Column({ unique: false, type: 'int' })
  ownerUserId: number;

  @ApiProperty({ example: 'my box' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  alias: string;

  @ApiProperty({ example: '2023-03-21 08:46:11' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdTime: Date;

  constructor(deviceId: string, ownerUserId: number, alias: string);
  constructor(deviceId: string, ownerUserId: number, alias: string) {
    this.deviceId = deviceId;
    this.ownerUserId = ownerUserId;
    this.alias = alias;

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
