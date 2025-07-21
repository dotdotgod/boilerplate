import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Oauth } from './oauth.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false })
  @ApiProperty()
  @IsString()
  first_name: string;

  @Column({ nullable: false })
  @ApiProperty()
  @IsString()
  last_name: string;

  @Column({ unique: true, nullable: false })
  @ApiProperty()
  @IsString()
  email: string;

  @Column({ select: false, nullable: true })
  @Exclude()
  @IsString()
  password: string;

  @Exclude()
  @OneToMany(() => Oauth, (oauth) => oauth.user, { cascade: true })
  oauths: Oauth[];
}
