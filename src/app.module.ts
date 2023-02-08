import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ExampleAppController } from './example/example.controller';
import { ExampleAppService } from './example/example.service';

import { ReceivedLogModule } from './recived-log/recived-log.module';
import { PushModule } from './push/push.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    // }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '34.80.129.4',
      port: 3306,
      username: 'root',
      password: '12345',
      database: 'rc-box',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ReceivedLogModule,
    PushModule,
    AuthModule,
    UsersModule,
  ],
  // 我們可以把單一個 Controller/Service 以下面方式放進來，或者用上面的方法把整個module import進來。
  controllers: [ExampleAppController],
  providers: [ExampleAppService],
})
export class AppModule {}
