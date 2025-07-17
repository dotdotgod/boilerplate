import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Oauth } from './oauth.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @OneToMany(() => Oauth, (oauth) => oauth.user, { cascade: true })
  oauths: Oauth[];
}
