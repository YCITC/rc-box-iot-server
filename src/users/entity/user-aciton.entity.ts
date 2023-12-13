/* eslint-disable import/no-cycle */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import User from './user.entity';

@Entity({
  name: 'users_action',
  engine: 'MyISAM',
})
export default class UserAction {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  // loginTimes (including update Token)
  @ApiProperty({ example: 5 })
  @Column({ default: false })
  loginTimes: number;

  // last session id,
  @ApiProperty({ example: 'we6KJBaj0bDGlN-9GTXa9cDKMsSicWrU' })
  @Column({ unique: true, type: 'varchar', length: 32, nullable: false })
  sessionId: string;

  // Timestamp of the last user session
  @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  lastSessionTime?: Date;

  @OneToOne(() => User, (user: User) => user.userAction, { nullable: false })
  @JoinColumn()
  user: User;

  constructor(
    loginTimes: number,
    sessionId: string,
    lastSessionTime?: Date,
    id?: number,
  );
  constructor(
    loginTimes: number,
    sessionId: string,
    lastSessionTime?: Date,
    id?: number,
  ) {
    this.loginTimes = loginTimes;
    this.sessionId = sessionId;
    if (id) this.id = id;
    if (lastSessionTime) this.lastSessionTime = lastSessionTime;
  }
}
