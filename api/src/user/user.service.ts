import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Oauth, OauthProviderEnum } from './entities/oauth.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GoogleUserInfo, JwtTokenDto, OAuthUser } from './dtos/sign.dto';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Oauth)
    private readonly oauthRepository: Repository<Oauth>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async findByUuid(user_uuid: string) {
    return this.userRepository.findOne({
      where: { uuid: user_uuid },
    });
  }

  async findByPassword(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'uuid',
        'email',
        'name',
        'password',
        'is_verified',
        'verified_at',
      ],
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!user.is_verified) {
      throw new BadRequestException(
        'Please verify your email address before signing in',
      );
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByOauth(provider: OauthProviderEnum, providerId: string) {
    return this.userRepository.findOne({
      where: { oauths: { provider: provider, provider_id: providerId } },
      relations: {
        oauths: true,
      },
    });
  }

  async createUser(
    name: string,
    email: string,
    options: {
      password?: string;
      provider?: OauthProviderEnum;
      providerId?: string;
      originResponse?: any;
    },
  ) {
    const user = await this.userRepository.save({
      name,
      email,
    });

    if (options?.password) {
      user.password = await argon2.hash(options.password);
      await this.userRepository.save(user);
    }

    if (options?.provider && options?.providerId) {
      await this.oauthRepository.save({
        user_id: user.id,
        provider: options.provider,
        provider_id: options.providerId,
        origin_response: options.originResponse || {},
      });
    }

    return user;
  }
  async fetchGoogleUserInfo(
    accessToken: string,
  ): Promise<GoogleUserInfo | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
      );

      if (!response.ok) {
        console.error('Failed to fetch Google user info:', response.statusText);
        return null;
      }

      const userInfo = await response.json();
      return userInfo as GoogleUserInfo;
    } catch (error) {
      console.error('Google user info fetch failed:', error);
      return null;
    }
  }

  async authenticateWithGoogleToken(token: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const googleUserInfo = await this.fetchGoogleUserInfo(token);
    if (!googleUserInfo) {
      return null;
    }

    const oauthUser: OAuthUser = {
      provider_id: googleUserInfo.id,
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      picture: googleUserInfo.picture,
      access_token: token,
    };

    const user = await this.validateOAuthUser(
      oauthUser,
      OauthProviderEnum.GOOGLE,
      googleUserInfo,
    );

    const tokens = await this.generateTokens(user);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtTokenDto = { user_uuid: user.uuid };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
    });

    // 리프레시 토큰을 화이트리스트에 저장
    await this.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(
    user: User,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // 리프레시 토큰이 화이트리스트에 있는지 확인
      const isTokenValid = await this.isRefreshTokenValid(
        user.id,
        refreshToken,
      );
      if (!isTokenValid) {
        throw new BadRequestException('Invalid or expired refresh token');
      }

      // 기존 리프레시 토큰 제거
      await this.removeRefreshToken(user.id, refreshToken);

      // 새로운 토큰 생성
      return this.generateTokens(user);
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      throw new BadRequestException('Refresh token verification failed');
    }
  }

  async validateOAuthUser(
    oauthUser: OAuthUser,
    provider: OauthProviderEnum,
    originResponse: any,
  ): Promise<User> {
    let user = await this.findByOauth(provider, oauthUser.provider_id);

    if (!user) {
      user = await this.findByEmail(oauthUser.email);
    }

    // Create new user if not found
    if (!user) {
      user = await this.createUser(oauthUser.name, oauthUser.email, {
        provider,
        providerId: oauthUser.provider_id,
        originResponse,
      });
    }

    return user;
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<JwtTokenDto | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtTokenDto>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );
      return payload;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  private createTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = this.createTokenHash(refreshToken);
    const expiresIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRES_IN',
    ) as string; // 7d
    const expiresInDays = parseInt(expiresIn);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays); // 7일 후 만료

    await this.refreshTokenRepository.save({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
  }

  async isRefreshTokenValid(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const tokenHash = this.createTokenHash(refreshToken);

    const token = await this.refreshTokenRepository.findOne({
      where: {
        user_id: userId,
        token_hash: tokenHash,
      },
    });

    if (!token) {
      return false;
    }

    // 만료 시간 확인
    if (token.expires_at < new Date()) {
      // 만료된 토큰 삭제
      await this.refreshTokenRepository.delete(token.id);
      return false;
    }

    return true;
  }

  async removeRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const tokenHash = this.createTokenHash(refreshToken);

    await this.refreshTokenRepository.delete({
      user_id: userId,
      token_hash: tokenHash,
    });
  }

  async removeAllRefreshTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({
      user_id: userId,
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  async generateVerificationToken(userId: number): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 후 만료

    // 만료된 미사용 토큰들 또는 해당 사용자의 미사용 토큰들을 정리
    await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where(
        '(is_used = :isUsed AND expires_at < :now) OR (is_used = :isUsed AND user_id = :userId)',
        {
          isUsed: false,
          now: new Date(),
          userId,
        },
      )
      .execute();

    await this.emailVerificationRepository.save({
      user_id: userId,
      token,
      expires_at: expiresAt,
      is_used: false,
    });

    return token;
  }

  async generateRegistrationToken(email: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30분 후 만료

    // 기존 미사용 토큰들을 먼저 정리
    await this.emailVerificationRepository.delete({
      email,
      is_used: false,
    });

    await this.emailVerificationRepository.save({
      email,
      token,
      expires_at: expiresAt,
      is_used: false,
    });

    return token;
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token, is_used: false },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // 토큰을 사용 처리
    verification.is_used = true;
    await this.emailVerificationRepository.save(verification);

    // 사용자를 인증 완료 처리
    const user = await this.userRepository.findOne({
      where: { id: verification.user_id },
    });

    if (user) {
      user.is_verified = true;
      user.verified_at = new Date();
      await this.userRepository.save(user);
    }

    return true;
  }

  async sendVerificationEmail(
    userId: number,
    email: string,
    name: string,
  ): Promise<boolean> {
    const token = await this.generateVerificationToken(userId);
    return this.mailService.sendVerificationEmail(email, name, token);
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      throw new BadRequestException('Email is already verified');
    }

    return this.sendVerificationEmail(user.id, user.email, user.name);
  }

  async cleanupExpiredVerifications(): Promise<void> {
    await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  async sendRegistrationEmail(email: string): Promise<boolean> {
    const token = await this.generateRegistrationToken(email);
    return this.mailService.sendRegistrationEmail(email, token);
  }

  async getRegistrationInfo(token: string): Promise<string> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token, is_used: false },
    });

    if (!verification) {
      throw new BadRequestException('Invalid registration token');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Registration token has expired');
    }

    return verification.email;
  }

  async completeRegistration(
    token: string,
    name: string,
    password: string,
  ): Promise<User> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token, is_used: false },
    });

    if (!verification) {
      throw new BadRequestException('Invalid registration token');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Registration token has expired');
    }

    // Check if user already exists
    const existingUser = await this.findByEmail(verification.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create the user
    const user = await this.createUser(name, verification.email, {
      password,
    });

    // Mark user as verified immediately
    user.is_verified = true;
    user.verified_at = new Date();
    await this.userRepository.save(user);

    // Mark token as used
    verification.is_used = true;
    verification.user_id = user.id;
    await this.emailVerificationRepository.save(verification);

    return user;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return true;
    }

    // Generate a password reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Clean up old tokens for this user
    await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId AND is_used = :isUsed', {
        userId: user.id,
        isUsed: false,
      })
      .execute();

    // Save the new token
    await this.emailVerificationRepository.save({
      user_id: user.id,
      email: user.email,
      token,
      expires_at: expiresAt,
      is_used: false,
    });

    // Send the reset email
    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return true;
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token, is_used: false },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    return verification.email;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token, is_used: false },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: verification.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Mark the token as used
    verification.is_used = true;
    await this.emailVerificationRepository.save(verification);
  }
}
