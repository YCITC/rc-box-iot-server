import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbInfo = {
          type: configService.get('DB_type'),
          host: configService.get('DB_host'),
          port: configService.get('DB_port'),
          username: configService.get('DB_username'),
          password: configService.get('DB_password'),
          database: configService.get('DB_database'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
        return dbInfo;
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: false,
      envFilePath: ['.development.env'],
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
