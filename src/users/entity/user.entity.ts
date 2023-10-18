import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
// import Device from '../../devices/entities/device.entity';

@Entity({
  name: 'users',
  engine: 'MyISAM',
})
export default class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @ApiProperty({ example: '123@456.789' })
  @Column({ unique: true, type: 'text' })
  email: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: 'Tid' })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
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

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdTime: Date;

  // @OneToMany(() => Device, (device: Device) => device.ownerUserId)
  // devices: Device[];

  constructor(
    email: string,
    username: string,
    fullName: string,
    password: string,
    phoneNumber: string,
    address: string,
    zipCode: string,
    id?: number,
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

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
