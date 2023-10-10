import { AuthGuard } from '@nestjs/passport';
import { Observable, tap } from 'rxjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './models/user.interface';
import { map, catchError, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/guards/roles-gards';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { UserIsUser,  } from 'src/auth/guards/UserIsUser.guards';
export const storage = {
  storage: diskStorage({
    destination: './upload/profileImage',
    filename: (req, file, cb) => {
      const fileName = file.originalname + uuidv4();
      const extension = file.originalname;
      cb(null, `${fileName}${extension}`);
    },
  }),
};
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  create(@Body() user: User): Observable<User | Object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) =>
        of({
          error: err.message,
        }),
      ),
    );
  }
  @Post('login')
  login(@Body() user: User): Observable<Object> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id) {
    return this.userService.findOne(id);
  }

  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') usermane: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    // console.log('username', usermane);
    if (usermane == null || usermane === undefined) {
      return this.userService.paginate({
        page: Number(page),
        limit: Number(limit),
        route: 'http://localhost:3000/user',
      });
    } else {
      return this.userService.paginateFilterByUsername(
        {
          page: Number(page),
          limit: Number(limit),
          route: 'http://localhost:3000/user',
        },
        { username: usermane },
      );
    }
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id): Observable<User> {
    return this.userService.deleteOne(+id);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard,UserIsUser)
  updateOne(
    @Param('id', ParseIntPipe) id,
    @Body() user: User,
  ): Observable<any> {
    return this.userService.updateOne(+id, user);
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(@Param('id') id, @Body() user: User): Observable<User> {
    return this.userService.updateRoleofUser(id, user);
  }
  @Post('upload')
  @UseGuards(JwtAuthGuard,UserIsUser)
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
    const user: User = req.user;
    console.log('user', user);
    return this.updateOne(user.id, { profileImage: file.filename }).pipe(
      tap((user: User) => console.log(user)),
      map((user: User) => ({ profileImage: user.profileImage })),
    );
  }
  @Get('profile-image/:imagename')
  findProfileImage(
    @Param('imagename') imagename,
    @Res() res,
  ): Observable<Object> {
    return of(
      res.sendFile(join(process.cwd(), 'upload/profileimage/' + imagename)),
    );
  }
}
