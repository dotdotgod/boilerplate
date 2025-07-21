import { OmitType, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(
  OmitType(User, ['created_at', 'deleted_at', 'updated_at', 'oauths', 'id']),
) {}
