import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'push_client_chrome',
  engine: 'MyISAM',
})
export class ChromeClient {
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
    browserVersion: string,
    vapidPublicKey: string,
    vapidPrivateKey: string,
    endpoint: string,
    keysAuth: string,
    keysP256dh: string,
  );
  constructor(
    deviceId: string,
    browserVersion?: string,
    vapidPublicKey?: string,
    vapidPrivateKey?: string,
    endpoint?: string,
    keysAuth?: string,
    keysP256dh?: string,
  );
  constructor(
    deviceId: string,
    browserVersion?: string,
    vapidPublicKey?: string,
    vapidPrivateKey?: string,
    endpoint?: string,
    keysAuth?: string,
    keysP256dh?: string,
  ) {
    this.subscribeTime = new Date();
    this.deviceId = deviceId;
    this.browserVersion = browserVersion;
    this.vapidPublicKey = vapidPublicKey;
    this.vapidPrivateKey = vapidPrivateKey;
    this.endpoint = endpoint;
    this.keysAuth = keysAuth;
    this.keysP256dh = keysP256dh;
  }
}