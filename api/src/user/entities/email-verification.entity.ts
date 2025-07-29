import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['email', 'token'])
export class EmailVerification extends BaseEntity {
  @Column({ nullable: true })
  @Index()
  @ApiProperty()
  @Expose()
  user_id?: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  user?: User;

  @Column({ nullable: false })
  @Index()
  @ApiProperty()
  @IsEmail()
  @Expose()
  email: string;

  @Column({ nullable: false, unique: true })
  @Index()
  @ApiProperty()
  @IsString()
  @Exclude() // 민감한 정보: 인증 토큰
  token: string;

  @Column({ nullable: false, type: 'timestamp' })
  @Index()
  @ApiProperty()
  @IsDate()
  @Expose()
  expires_at: Date;

  @Column({ nullable: false, default: false })
  @ApiProperty()
  @IsBoolean()
  @Expose()
  is_used: boolean;
}
