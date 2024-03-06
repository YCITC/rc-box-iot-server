/* eslint-disable import/no-cycle */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import UserAction from './user-action.entity';

export const typeFunctionOrTarget = () => UserAction;
export const inverseSide = (userAction: UserAction) => userAction.user;

@Entity({
  name: 'users',
  engine: 'MyISAM',
})
export default class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('increment', {
    unsigned: true,
    type: 'integer',
  })
  id: number;

  @ApiProperty({ example: '123@456.789' })
  @Column({ unique: true, type: 'text' })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: 'Tid' })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    comment: 'AKA display Name',
  })
  username: string;

  @ApiProperty({ example: 'Tid Huang' })
  @Column({
    type: 'text',
  })
  fullName: string;

  @Column({
    type: 'text',
  })
  password: string;

  @ApiProperty({ example: '0900123456' })
  @Column({
    type: 'text',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'No. 7, Section 5, Xinyi Road, Xinyi District, Taiepi, Taiwan',
  })
  @Column({
    type: 'text',
  })
  address: string;

  @ApiProperty({ example: '110' })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  zipCode: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdTime: Date;

  @OneToOne(typeFunctionOrTarget, inverseSide, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  userAction: UserAction;

  constructor(
    email: string,
    username: string,
    fullName: string,
    password: string,
    phoneNumber: string,
    address: string,
    zipCode: string,
    id?: number,
    userAction?: UserAction,
  );
  constructor(
    email: string,
    username: string,
    fullName: string,
    password: string,
    phoneNumber: string,
    address: string,
    zipCode: string,
    id?: number,
    userAction?: UserAction,
  ) {
    this.email = email;
    this.username = username;
    this.fullName = fullName;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.address = address;
    this.zipCode = zipCode;
    this.isEmailVerified = false;
    if (id) this.id = id;
    if (userAction) this.userAction = userAction;

    this.createdTime = new Date();
  }
}
