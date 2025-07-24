import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['email', 'token'])
export class EmailVerification extends BaseEntity {
  @Column({ nullable: true })
  @Index()
  @ApiProperty()
  user_id?: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Type(() => User)
  user?: User;

  @Column({ nullable: false })
  @Index()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Column({ nullable: false, unique: true })
  @Index()
  @ApiProperty()
  @IsString()
  token: string;

  @Column({ nullable: false, type: 'timestamp' })
  @Index()
  @ApiProperty()
  @IsDate()
  expires_at: Date;

  @Column({ nullable: false, default: false })
  @ApiProperty()
  @IsBoolean()
  is_used: boolean;
}
