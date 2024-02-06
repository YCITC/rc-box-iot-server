/* eslint-disable import/no-cycle */
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import ReceivedLog from '../../recived-log/entity/recived-log.entity';
import User from '../../users/entity/user.entity';

export const typeFunctionOrTarget = () => ReceivedLog;
export const inverseSide = (receivedLog: ReceivedLog) => receivedLog.device;

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
  @Column({ unique: false, nullable: true, type: 'int' })
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

  @OneToMany(typeFunctionOrTarget, inverseSide)
  receivedLogs: ReceivedLog[];

  @ManyToOne(typeFunctionOrTarget, inverseSide, {
    nullable: true,
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'ownerUserId' })
  user: User;

  constructor(deviceId: string, ownerUserId: number, alias: string);
  constructor(deviceId: string, ownerUserId: number, alias: string) {
    this.deviceId = deviceId;
    this.ownerUserId = ownerUserId;
    this.alias = alias;

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
