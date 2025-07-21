import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  GoogleAuthDto,
  SignInReqDto,
  SignInResDto,
  SignUpReqDto,
} from './dtos/sign.dto';
import { Response, Request } from 'express';
import { Type } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('google')
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto, @Res() res: Response) {
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

    return res.json({
      message: 'Authentication successful',
      user,
      access_token: accessToken,
    });
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req: Request, @Res() res: Response) {
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

    return res.json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  }

  @Post('sign-in')
  @Type(() => SignInResDto)
  async signIn(@Body() signInReqDto: SignInReqDto, @Res() res: Response) {
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

    return res.json({
      message: 'Sign in successful',
      user,
      access_token: accessToken,
    });
  }

  @Post('sign-up')
  async signUp(@Body() signUpReqDto: SignUpReqDto, @Res() res: Response) {
    const { name, email, password } = signUpReqDto;
    const user = await this.userService.createUser(name, email, {
      password,
    });
    const { accessToken, refreshToken } =
      await this.userService.generateTokens(user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: 'Sign up successful',
      user,
      access_token: accessToken,
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token as string;

    if (refreshToken) {
      try {
        // JWT에서 사용자 정보 추출
        const payload =
          await this.userService.validateRefreshToken(refreshToken);
        if (payload) {
          const user = await this.userService.findByUuid(payload.user_uuid);
          if (user) {
            // 리프레시 토큰을 화이트리스트에서 제거
            await this.userService.removeRefreshToken(user.id, refreshToken);
          }
        }
      } catch (error) {
        // 토큰이 유효하지 않더라도 로그아웃은 성공으로 처리
        console.error('Error during logout:', error);
      }
    }

    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
