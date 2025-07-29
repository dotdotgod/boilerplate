import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail } from 'class-validator';
import { User } from '../entities/user.entity';

/**
 * Sign In Request DTO
 */
export class SignInReqDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minimum: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

/**
 * Sign Up Request DTO (if needed for direct signup)
 */
export class SignUpReqDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minimum: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;
}

export class JwtTokenDto {
  user_uuid: string;
}

export interface OAuthUser {
  provider_id: string;
  email: string;
  name: string;
  picture?: string;
  access_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  locale?: string;
}

/**
 * Google Auth Request DTO
 */
export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  access_token: string;
}

/**
 * Refresh Token Request DTO
 */
export class RefreshTokenDto {
  @ApiProperty({ required: false })
  @IsString()
  refresh_token?: string;
}

export class VerifyEmailDto {
  @IsString()
  @ApiProperty()
  token: string;
}

export class ResendVerificationDto extends PickType(User, ['email'] as const) {}

/**
 * Email Registration Request DTO
 */
export class EmailRegistrationDto extends PickType(User, ['email'] as const) {}

/**
 * Complete Registration Request DTO
 */
export class CompleteRegistrationDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ minimum: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class GetRegistrationInfoDto {
  @IsString()
  @ApiProperty()
  token: string;
}
