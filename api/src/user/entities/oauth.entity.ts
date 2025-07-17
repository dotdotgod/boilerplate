import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

enum OauthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

@Entity()
export class Oauth extends BaseEntity {
  @Column({ nullable: false })
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false, type: 'enum', enum: OauthProvider })
  provider: OauthProvider;

  @Column({ nullable: false })
  provider_id: string;
}
