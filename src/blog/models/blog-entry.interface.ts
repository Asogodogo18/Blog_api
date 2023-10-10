import { User } from 'src/user/models/user.interface';

export interface BlogEntryInterface {
  title?: string;
  slug?: string;
  decription?: string;

  body?: string;

  createAt?: Date;

  updateAt?: Date;

  like?: number;
  headerImage?: string;

  publisheDate?: Date;

  isPublisheDate?: boolean;
  author: User;
}
