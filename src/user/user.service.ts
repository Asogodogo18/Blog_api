import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { Like, Repository } from 'typeorm';
import { User, UserRole } from './models/user.interface';
import { Observable, from, switchMap, map, throwError, catchError } from 'rxjs';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private authServices: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authServices.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.username = user.username;
        newUser.password = passwordHash;
        newUser.email = user.email;
        newUser.role = UserRole.USER;
        return from(this.userRepo.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(err)),
        );
      }),
    );
  }
  findAll(): Observable<User[]> {
    return from(this.userRepo.find()).pipe(
      map((users: User[]) => {
        users.forEach(function (v) {
          delete v.password;
        });
        return users;
      }),
    );
  }
  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } })).pipe(
      map((user: User) => {
        // console.log('User', user);
        const { password, ...result } = user;
        return result;
      }),
    );
  }

  paginate(option: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepo, option)).pipe(
      map((usersPageable: Pagination<User>) => {
        usersPageable.items.forEach(function (v) {
          delete v.password;
        });
        return usersPageable;
      }),
    );
  }

  paginateFilterByUsername(
    option: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    // console.log("option",option);

    return from(
      this.userRepo.findAndCount({
        skip: option.page * option.limit || 0,
        take: option.limit || 10,
        order: {
          id: 'ASC',
        },
        select: ['id', 'name', 'username', 'role', 'email'],
        where: [
          {
            username: Like(`%${user.username}%`),
          },
        ],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        // console.log("users",users);

        const usersPageable: Pagination<User> = {
          items: users,
          links: {
            first: option.route + `?limit=${option.limit}`,
            previous: option.route + ``,
            next:
              option.route + `?limit=${option.limit}&page=${option.page + 1}`,
            last:
              option.route +
              `?limit=${option.limit}&page=${Math.ceil(
                totalUsers / option.limit,
              )}`,
          },
          meta: {
            currentPage: option.page,
            itemCount: users.length,
            itemsPerPage: option.limit,
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / option.limit),
          },
        };
        return usersPageable;
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete({ id }));
  }
  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;
    return from(this.userRepo.update(id, user)).pipe(
      switchMap(()=>this.findOne(id))
    )
  }

  updateRoleofUser(id: number, user: User): Observable<any> {
    return from(this.userRepo.update(id, user));
  }
  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authServices
            .generateJWT(user)
            .pipe(map((jwt: string) => jwt));
        } else {
          return 'wrong Credentials';
        }
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return this.findByMail(email).pipe(
      switchMap((user: User) =>
        this.authServices.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }
  findByMail(email: string): Observable<User> {
    return from(this.userRepo.findOne({ where: { email } }));
  }
}
