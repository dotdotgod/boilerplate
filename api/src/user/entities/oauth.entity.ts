import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Exclude, Expose, Type } from 'class-transformer';
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
  @Expose()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  user: User;

  @Column({ nullable: false, type: 'enum', enum: OauthProviderEnum })
  @Expose()
  provider: OauthProviderEnum;

  @Column({ nullable: false })
  @ApiProperty()
  @IsString()
  @Expose()
  provider_id: string;

  @Column({ nullable: false, type: 'jsonb' })
  @ApiProperty()
  @IsString()
  @Exclude()  // 민감한 정보: OAuth 제공자의 원본 응답 데이터
  origin_response: string;
}
