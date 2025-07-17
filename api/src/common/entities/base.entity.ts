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
  id: number;

  @Generated('uuid')
  @Column({ unique: true })
  @Index()
  uuid: string;

  @DeleteDateColumn({
    nullable: true,
    default: null,
    select: false,
    type: 'timestamp with time zone',
  })
  deleted_at: Date;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp with time zone',
  })
  created_at: Date;

  @UpdateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp with time zone',
  })
  updated_at: Date;
}
