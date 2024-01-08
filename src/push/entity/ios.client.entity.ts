import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'push_client_ios',
  engine: 'MyISAM',
})
export default class IOSClient {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  subscribeTime: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  deviceId: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  appId: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  iPhoneToken: string;

  constructor(deviceId: string, appId: string, iPhoneToken: string);
  constructor(deviceId?: string, appId?: string, iPhoneToken?: string);
  constructor(deviceId?: string, appId?: string, iPhoneToken?: string) {
    const now = new Date();
    this.subscribeTime = new Date(now.toLocaleDateString());
    this.deviceId = deviceId;
    this.appId = appId;
    this.iPhoneToken = iPhoneToken;
  }
}
