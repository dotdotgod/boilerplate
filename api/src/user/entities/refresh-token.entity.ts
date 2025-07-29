import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['user_id', 'token_hash'])
export class RefreshToken extends BaseEntity {
  @Column({ nullable: false })
  @Index()
  @ApiProperty()
  @Expose()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  user: User;

  @Column({ nullable: false, length: 64 })
  @Index()
  @ApiProperty()
  @IsString()
  @Exclude() // 민감한 정보: 토큰 해시
  token_hash: string;

  @Column({ nullable: false, type: 'timestamp' })
  @Index()
  @ApiProperty()
  @IsDate()
  @Expose()
  expires_at: Date;
}
