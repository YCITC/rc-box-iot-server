import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'devices',
  engine: 'MyISAM',
})
export class Device {
  @ApiProperty({ example: 0 })
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @ApiProperty({ example: 'rc-box-v1-a12301' })
  @Column({
    unique: true,
    type: 'varchar',
    length: 16,
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

  constructor(
    deviceId: string,
    ownerUserId: number,
    alias: string,
    id?: number,
  );
  constructor(
    deviceId: string,
    ownerUserId: number,
    alias: string,
    id?: number,
  ) {
    this.deviceId = deviceId;
    this.ownerUserId = ownerUserId;
    this.alias = alias;
    if (id) this.id = id;

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
