import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OauthProviderEnum {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

@Entity()
@Unique(['user_id', 'provider_id', 'provider'])
export class Oauth extends BaseEntity {
  @Column({ nullable: false })
  @Index()
  @ApiProperty()
  @IsNumber()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  user: User;

  @Column({ nullable: false, type: 'enum', enum: OauthProviderEnum })
  provider: OauthProviderEnum;

  @Column({ nullable: false })
  @ApiProperty()
  @IsString()
  provider_id: string;

  @Column({ nullable: false, type: 'jsonb' })
  @ApiProperty()
  @IsString()
  origin_response: string;
}
