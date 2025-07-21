import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Oauth } from './entities/oauth.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/access-jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Oauth, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // Dynamic configuration handled in service
  ],
  controllers: [UserController],
  providers: [UserService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [UserService],
})
export class UserModule {}
