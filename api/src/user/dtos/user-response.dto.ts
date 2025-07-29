import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { User } from '../entities/user.entity';

/**
 * Base User Response DTO
 * Maps User entity fields for API responses
 */
export class UserResDto extends PickType(PartialType(User), [
  'uuid',
  'name',
  'email',
  'is_verified',
  'verified_at',
]) {}

/**
 * Google Auth Response DTO
 */
export class GoogleAuthResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty({ type: UserResDto })
  @Type(() => UserResDto)
  @Expose()
  user: UserResDto;

  @ApiProperty()
  @Expose()
  access_token: string;
}

/**
 * Refresh Token Response DTO
 */
export class RefreshTokenResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  accessToken: string;
}

/**
 * Sign In Response DTO
 */
export class SignInResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty({ type: UserResDto })
  @Type(() => UserResDto)
  @Expose()
  user: UserResDto;

  @ApiProperty()
  @Expose()
  access_token: string;
}

/**
 * Email Registration Response DTO
 */
export class EmailRegistrationResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Get Registration Info Response DTO
 */
export class GetRegistrationInfoResDto {
  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Complete Registration Response DTO
 */
export class CompleteRegistrationResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty({ type: UserResDto })
  @Type(() => UserResDto)
  @Expose()
  user: UserResDto;

  @ApiProperty()
  @Expose()
  access_token: string;
}

/**
 * Logout Response DTO
 */
export class LogoutResDto {
  @ApiProperty()
  @Expose()
  message: string;
}

/**
 * Verify Email Response DTO
 */
export class VerifyEmailResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Resend Verification Response DTO
 */
export class ResendVerificationResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Reset Password Response DTO
 */
export class ResetPasswordResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Verify Reset Token Response DTO
 */
export class VerifyResetTokenResDto {
  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}

/**
 * Confirm Reset Password Response DTO
 */
export class ConfirmResetPasswordResDto {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  success: boolean;
}
