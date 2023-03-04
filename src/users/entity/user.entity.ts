import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'users',
  engine: 'MyISAM',
  database: 'rc-box',
})
export class User {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({ unique: true, type: 'text' })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'text',
  })
  fullName: string;

  @Column({
    type: 'text',
  })
  password: string;

  @Column({
    type: 'text',
  })
  phoneNumber: string;

  @Column({
    type: 'text',
  })
  address: string;

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
    if (id) this.id = id;

    const now = new Date();
    this.createdTime = new Date(now.toLocaleDateString());
  }
}
