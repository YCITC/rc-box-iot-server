import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'active_session',
  engine: 'MyISAM',
})
export default class ActiveSession {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('increment', {
    type: 'integer',
  })
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'date', nullable: false, unique: true })
  day: Date;

  @ApiProperty({ example: 5 })
  @Column({ default: 0, nullable: false })
  count: number;

  constructor(count: number, day: Date, id?: number);
  constructor(count: number, day: Date, id?: number) {
    this.count = count;
    this.day = day;
    if (id) this.id = id;
  }
}
