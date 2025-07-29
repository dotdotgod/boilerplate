import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  GoogleAuthDto,
  SignInReqDto,
  VerifyEmailDto,
  ResendVerificationDto,
  EmailRegistrationDto,
  CompleteRegistrationDto,
  GetRegistrationInfoDto,
} from './dtos/sign.dto';
import {
  GoogleAuthResDto,
  RefreshTokenResDto,
  SignInResDto,
  EmailRegistrationResDto,
  GetRegistrationInfoResDto,
  CompleteRegistrationResDto,
  LogoutResDto,
  VerifyEmailResDto,
  ResendVerificationResDto,
  ResetPasswordResDto,
  VerifyResetTokenResDto,
  ConfirmResetPasswordResDto,
} from './dtos/user-response.dto';
import {
  ResetPasswordDto,
  VerifyResetTokenDto,
  ConfirmResetPasswordDto,
} from './dtos/password-reset.dto';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('google')
  @ApiOperation({ summary: 'Google OAuth authentication' })
  @SerializeOptions({ type: GoogleAuthResDto })
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleAuthResDto> {
    const { access_token } = googleAuthDto;

    if (!access_token) {
      throw new BadRequestException('Access Token is required');
    }

    const result =
      await this.userService.authenticateWithGoogleToken(access_token);

    if (!result) {
      throw new UnauthorizedException('Invalid Google Access Token');
    }

    const { user, accessToken, refreshToken } = result;

    // Set refresh token as httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Authentication successful',
      user,
      access_token: accessToken,
    };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh access token' })
  @SerializeOptions({ type: RefreshTokenResDto })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResDto> {
    const user = req.user as User;
    const refreshToken = req.cookies?.refresh_token as string;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.userService.refreshAccessToken(user, refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Token refreshed successfully',
      accessToken,
    };
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Email/password sign in' })
  @SerializeOptions({ type: SignInResDto })
  async signIn(
    @Body() signInReqDto: SignInReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResDto> {
    const { email, password } = signInReqDto;

    const user = await this.userService.findByPassword(email, password);
    const { accessToken, refreshToken } =
      await this.userService.generateTokens(user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Sign in successful',
      user,
      access_token: accessToken,
    };
  }

  @Post('register-email')
  @ApiOperation({ summary: 'Start email registration' })
  @SerializeOptions({ type: EmailRegistrationResDto })
  async registerEmail(
    @Body() emailRegistrationDto: EmailRegistrationDto,
  ): Promise<EmailRegistrationResDto> {
    const { email } = emailRegistrationDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Send registration email with token
    const success = await this.userService.sendRegistrationEmail(email);

    if (!success) {
      throw new BadRequestException('Failed to send registration email');
    }

    return {
      message:
        'Registration email sent. Please check your email to complete registration.',
      success: true,
    };
  }

  @Post('get-registration-info')
  @ApiOperation({ summary: 'Get registration info by token' })
  @SerializeOptions({ type: GetRegistrationInfoResDto })
  async getRegistrationInfo(
    @Body() getRegistrationInfoDto: GetRegistrationInfoDto,
  ): Promise<GetRegistrationInfoResDto> {
    const { token } = getRegistrationInfoDto;

    try {
      const email = await this.userService.getRegistrationInfo(token);
      return {
        email,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('complete-registration')
  @ApiOperation({ summary: 'Complete user registration' })
  @SerializeOptions({ type: CompleteRegistrationResDto })
  async completeRegistration(
    @Body() completeRegistrationDto: CompleteRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CompleteRegistrationResDto> {
    const { token, name, password } = completeRegistrationDto;

    try {
      const user = await this.userService.completeRegistration(
        token,
        name,
        password,
      );
      const { accessToken, refreshToken } =
        await this.userService.generateTokens(user);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        message: 'Registration completed successfully',
        user,
        access_token: accessToken,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @SerializeOptions({ type: LogoutResDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResDto> {
    const refreshToken = req.cookies?.refresh_token as string;

    if (refreshToken) {
      try {
        // Extract user info from JWT
        const payload =
          await this.userService.validateRefreshToken(refreshToken);
        if (payload) {
          const user = await this.userService.findByUuid(payload.user_uuid);
          if (user) {
            // Remove refresh token from whitelist
            await this.userService.removeRefreshToken(user.id, refreshToken);
          }
        }
      } catch (error) {
        // Even if token is invalid, logout is processed as success
        console.error('Error during logout:', error);
      }
    }

    res.clearCookie('refresh_token');
    return {
      message: 'Logged out successfully',
    };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @SerializeOptions({ type: VerifyEmailResDto })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResDto> {
    const { token } = verifyEmailDto;

    try {
      await this.userService.verifyEmailToken(token);
      return {
        message: 'Email verified successfully',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @SerializeOptions({ type: ResendVerificationResDto })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ): Promise<ResendVerificationResDto> {
    const { email } = resendVerificationDto;

    try {
      const success = await this.userService.resendVerificationEmail(email);
      if (success) {
        return {
          message: 'Verification email sent successfully',
          success: true,
        };
      } else {
        throw new BadRequestException('Failed to send verification email');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @SerializeOptions({ type: ResetPasswordResDto })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResDto> {
    const { email } = resetPasswordDto;

    try {
      const success = await this.userService.sendPasswordResetEmail(email);
      if (success) {
        return {
          message: 'Password reset email sent successfully',
          success: true,
        };
      } else {
        throw new BadRequestException('Failed to send password reset email');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-reset-token')
  @ApiOperation({ summary: 'Verify password reset token' })
  @SerializeOptions({ type: VerifyResetTokenResDto })
  async verifyResetToken(
    @Body() verifyResetTokenDto: VerifyResetTokenDto,
  ): Promise<VerifyResetTokenResDto> {
    const { token } = verifyResetTokenDto;

    try {
      const email = await this.userService.verifyPasswordResetToken(token);
      return {
        email,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('confirm-reset-password')
  @ApiOperation({ summary: 'Confirm password reset' })
  @SerializeOptions({ type: ConfirmResetPasswordResDto })
  async confirmResetPassword(
    @Body() confirmResetPasswordDto: ConfirmResetPasswordDto,
  ): Promise<ConfirmResetPasswordResDto> {
    const { token, password } = confirmResetPasswordDto;

    try {
      await this.userService.resetPassword(token, password);
      return {
        message: 'Password reset successfully',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
