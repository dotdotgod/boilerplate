import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';

/**
 * Reset Password Request DTO
 */
export class ResetPasswordDto extends PickType(User, ['email'] as const) {}

/**
 * Verify Reset Token Request DTO
 */
export class VerifyResetTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}

/**
 * Confirm Reset Password Request DTO
 */
export class ConfirmResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minimum: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
