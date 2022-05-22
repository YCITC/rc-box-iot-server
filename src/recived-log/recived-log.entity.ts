import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity('received_log')
@Entity({
  name: 'received_log',
  engine: 'MyISAM',
  database: 'zing-rc-box',
})
export class ReceivedLog {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: Number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  time: Date;

  @Column({
    type: 'varchar',
    length: 16,
  })
  deviceId: String;
}
