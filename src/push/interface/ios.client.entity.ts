import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'iOSCliient',
  engine: 'MyISAM',
  database: 'zing-rc-box',
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
  })
  deviceId: string;

  @Column({
    type: 'text',
  })
  appId: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  iPhoneToken: string;
}
