import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user.interface';
import { BlogEntryEntity } from 'src/blog/models/blog-entry.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ unique: true })
  username: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Column({ nullable: true })
  profileImage: string;

  @BeforeInsert()
  emailToLowerCasse() {
    this.email = this.email.toLowerCase();
  }
  @OneToMany(() => BlogEntryEntity, (blogEntryEntity) => blogEntryEntity.author)
  blogEntries: BlogEntryEntity[];
}
