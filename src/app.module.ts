import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';
import { UserEntity } from './user/models/user.entity';
import { BlogModule } from './blog/blog.module';
import { BlogEntryEntity } from './blog/models/blog-entry.entity';


@Module({
  imports: [


    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.APP_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [UserEntity,BlogEntryEntity],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UserModule,
    forwardRef(()=> BlogModule)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
