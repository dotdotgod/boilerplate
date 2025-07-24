import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';
import { User } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class SignInReqDto {
  @IsString()
  @ApiProperty()
  email: string;
  @IsString()
  @ApiProperty()
  password: string;
}

export class SignInUserDto extends OmitType(User, [
  'created_at',
  'deleted_at',
  'id',
  'oauths',
  'password',
  'updated_at',
]) {}

export class SignInResDto {
  @Type(() => SignInUserDto)
  @ApiProperty()
  user: SignInUserDto;

  @ApiProperty()
  access_token: string;
}

export class SignUpReqDto {
  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
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

export class GoogleAuthDto {
  access_token: string;
}

export class RefreshTokenDto {
  refresh_token?: string;
}

export class VerifyEmailDto {
  @IsString()
  @ApiProperty()
  token: string;
}

export class ResendVerificationDto {
  @IsString()
  @ApiProperty()
  email: string;
}

// New DTOs for email-first registration flow
export class EmailRegistrationDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class CompleteRegistrationDto {
  @IsString()
  @ApiProperty()
  token: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class GetRegistrationInfoDto {
  @IsString()
  @ApiProperty()
  token: string;
}
