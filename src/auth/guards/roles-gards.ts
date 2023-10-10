import { Observable, map } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/models/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => UserService))
    private userServices: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // console.log('request', request.user);

    const user: User = request.user;
    // console.log('user', user);

    return this.userServices.findOne(user.id).pipe(
      map((user: User) => {
        const hasRole = () => roles.indexOf(user.role) > -1;
        let hasPermission: boolean = false;
        console.log('hasRole', hasRole);

        if (hasRole()) {
          // console.log('has Role true');

          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}
