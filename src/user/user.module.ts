
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './models/user.entity';

import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
