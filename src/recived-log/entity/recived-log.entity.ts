import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'received_log',
  engine: 'MyISAM',
  database: 'rc-box',
})
export class ReceivedLog {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  time: Date;

  @Column({
    type: 'varchar',
    length: 16,
  })
  deviceId: string;

  constructor(deviceId: string);
  constructor(deviceId?: string);
  constructor(deviceId?: string) {
    const now = new Date();
    this.time = new Date(now.toLocaleDateString());
    this.deviceId = deviceId || '';
  }
}
