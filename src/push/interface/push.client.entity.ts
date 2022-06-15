import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'PushCliient',
  engine: 'MyISAM',
  database: 'zing-rc-box',
})
export class PushClient {
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
  })
  deviceId: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  browserName: string;

  @Column({
    type: 'varchar',
    length: 16,
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
}
