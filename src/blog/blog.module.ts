import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  // imports:[UserModule,AuthModule],
  controllers: [BlogController],
  providers: [BlogService]
})
export class BlogModule {}
