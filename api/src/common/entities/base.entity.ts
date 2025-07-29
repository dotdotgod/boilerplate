import { Exclude, Expose } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  Index,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Generated('uuid')
  @Column({ unique: true })
  @Index()
  @Expose()
  uuid: string;

  @DeleteDateColumn({
    nullable: true,
    default: null,
    select: false,
    type: 'timestamp with time zone',
  })
  @Exclude() // 내부 메타데이터
  deleted_at: Date;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp with time zone',
  })
  @Expose()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp with time zone',
  })
  updated_at: Date;
}
