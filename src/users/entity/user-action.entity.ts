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

export const typeFunctionOrTarget = () => User;
export const inverseSide = (user: User) => user.userAction;

@Entity({
  name: 'users_action',
  engine: 'MyISAM',
})
export default class UserAction {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('increment', {
    type: 'integer',
  })
  id: number;

  // loginTimes (including update Token)
  @ApiProperty({ example: 5 })
  @Column({ default: 0 })
  loginTimes: number;

  // last session id,
  @ApiProperty({ example: 'we6KJBaj0bDGlN-9GTXa9cDKMsSicWrU' })
  @Column({ type: 'varchar', length: 32, nullable: false })
  sessionId: string;

  // Timestamp of the last user session
  @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  lastSessionTime?: Date;

  @OneToOne(typeFunctionOrTarget, inverseSide, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(
    loginTimes: number,
    sessionId: string,
    lastSessionTime?: Date,
    id?: number,
    user?: User,
  );
  constructor(
    loginTimes: number,
    sessionId: string,
    lastSessionTime?: Date,
    id?: number,
    user?: User,
  ) {
    this.loginTimes = loginTimes;
    this.sessionId = sessionId;
    if (id) this.id = id;
    if (lastSessionTime) this.lastSessionTime = lastSessionTime;
    if (user) this.user = user;
  }
}
