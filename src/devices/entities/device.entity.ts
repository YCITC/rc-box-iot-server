import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
// import { JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
// import User from '../../users/entity/user.entity';

@Entity({
  name: 'devices',
  engine: 'MyISAM',
})
export default class Device {
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
  @CreateDateColumn({ type: 'timestamp' })
  createdTime: Date;

  // @ManyToOne(() => User, (user) => user.devices)
  // @JoinColumn({ name: 'ownerUserId' })
  // ownerUser: User;

  constructor(deviceId: string, ownerUserId: number, alias: string);
  constructor(deviceId: string, ownerUserId: number, alias: string) {
    this.deviceId = deviceId;
    this.ownerUserId = ownerUserId;
    this.alias = alias;

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
