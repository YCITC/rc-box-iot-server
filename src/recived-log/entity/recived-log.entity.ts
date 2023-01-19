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

  constructor(deviceId: string, time?: Date, id?: number);
  constructor(deviceId: string, time?: Date, id?: number) {
    if (time) {
      this.time = time;
    } else {
      const now = new Date();
      this.time = new Date(now.toLocaleDateString());
    }
    this.id = id;
    this.deviceId = deviceId;
  }
}
