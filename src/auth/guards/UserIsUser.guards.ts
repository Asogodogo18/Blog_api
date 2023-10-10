import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserIsUser implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService)) private userServices: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const user: User = request.user;
    // console.log('params', params);

    return this.userServices.findOne(user.id).pipe(
      map((user: User) => {
        let hasPermission = false;
        if (user.id === Number(params.id)) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}
