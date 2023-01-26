import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'WebClient',
  engine: 'MyISAM',
  database: 'rc-box',
})
export class WebClient {
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
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  browserName: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  browserVersion: string;

  @Column({
    type: 'text',
  })
  vapidPublicKey: string;

  @Column({
    type: 'text',
  })
  vapidPrivateKey: string;

  @Column({
    type: 'text',
  })
  endpoint: string;

  @Column({
    type: 'text',
  })
  keysAuth: string;

  @Column({
    type: 'text',
  })
  keysP256dh: string;

  constructor(
    deviceId: string,
    browserName: string,
    browserVersion: string,
    vapidPublicKey: string,
    vapidPrivateKey: string,
    endpoint: string,
    keysAuth: string,
    keysP256dh: string,
  );
  constructor(
    deviceId: string,
    browserName?: string,
    browserVersion?: string,
    vapidPublicKey?: string,
    vapidPrivateKey?: string,
    endpoint?: string,
    keysAuth?: string,
    keysP256dh?: string,
  );
  constructor(
    deviceId: string,
    browserName?: string,
    browserVersion?: string,
    vapidPublicKey?: string,
    vapidPrivateKey?: string,
    endpoint?: string,
    keysAuth?: string,
    keysP256dh?: string,
  ) {
    this.subscribeTime = new Date();
    if (deviceId == undefined || deviceId == '')
      throw Error("Have no deviceId, it's length must > 0");
    this.deviceId = deviceId;

    if (browserName == undefined || browserName == '')
      throw Error("Have no browserName, it's length must > 0");
    this.browserName = browserName;

    if (browserVersion == undefined || browserVersion == '')
      throw Error("Have no browserVersion, it's length must > 0");
    this.browserVersion = browserVersion;

    if (vapidPublicKey == undefined || vapidPublicKey == '')
      throw Error("Have no vapidPublicKey, it's length must > 0");
    this.vapidPublicKey = vapidPublicKey;

    if (vapidPrivateKey == undefined || vapidPrivateKey == '')
      throw Error("Have no vapidPrivateKey, it's length must > 0");
    this.vapidPrivateKey = vapidPrivateKey;

    if (endpoint == undefined || endpoint == '')
      throw Error("Have no endpoint, it's length must > 0");
    this.endpoint = endpoint;

    if (keysAuth == undefined || keysAuth == '')
      throw Error("Have no keysAuth, it's length must > 0");
    this.keysAuth = keysAuth;

    if (keysP256dh == undefined || keysP256dh == '')
      throw Error("Have no keysP256dh, it's length must > 0");
    this.keysP256dh = keysP256dh;
  }
}
