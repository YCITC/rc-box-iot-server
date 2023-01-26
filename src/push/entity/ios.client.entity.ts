import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'iOSClient',
  engine: 'MyISAM',
  database: 'rc-box',
})
export class iOSClient {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  uid: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  subscribeTime: Date;

  @Column({
    type: 'varchar',
    length: 16,
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
    if (deviceId == undefined || deviceId == '')
      throw Error("Have no deviceId, it's length must > 0");
    this.deviceId = deviceId;

    if (appId == undefined || appId == '')
      throw Error("Have no appId, it's length must > 0");
    this.appId = appId;

    if (iPhoneToken == undefined || iPhoneToken == '')
      throw Error("Have no iPhoneToken, it's length must > 0");
    this.iPhoneToken = iPhoneToken;
  }
}
