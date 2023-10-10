import { UserEntity } from 'src/user/models/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

@Entity()
export class BlogEntryEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  slug: string;
  @Column()
  decription: string;
  @Column()
  body: string;
  @Column({type:"timestamp"})
  createAt: Date;
  @Column({type:"timestamp"})

  updateAt: Date;

  @BeforeUpdate()
  updateToTimestamp() {
    this.updateAt = new Date();
  }
  @Column({default:0})
  like: number;
  @Column()
  headerImage: string;

  @Column()
  publisheDate: Date;
  @Column()
  isPublisheDate: boolean;
  @ManyToOne(() => UserEntity, (user) => user.blogEntries)
  author: UserEntity;
}
