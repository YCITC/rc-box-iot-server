import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entity/user.entity';
import UsersService from './users.service';
import UserAction from './entity/user-aciton.entity';
// import UsersController from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAction])],
  providers: [UsersService],
  // controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export default class UsersModule {}
