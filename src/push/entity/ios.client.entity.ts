import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'push_client_ios',
  engine: 'MyISAM',
})
export class iOSClient {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
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
