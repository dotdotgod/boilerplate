# Backend API Development Conventions & Specifications

## 프로젝트 구조 및 기술 스택

### 기본 스택

- **Framework**: NestJS 11 + TypeScript
- **Database**: PostgreSQL + TypeORM 0.3.25
- **Authentication**: JWT (access/refresh token), Passport.js, Google OAuth 2.0
- **Email**: NodeMailer with SMTP
- **Security**: Argon2 for password hashing, Helmet for security headers
- **Validation**: class-validator, class-transformer, Joi
- **Package Manager**: pnpm

### 폴더 구조

```
api/
├── src/
│   ├── app.controller.ts      # 기본 앱 컨트롤러
│   ├── app.module.ts          # 루트 애플리케이션 모듈
│   ├── main.ts                # 애플리케이션 엔트리 포인트
│   ├── common/                # 공통 모듈
│   │   ├── common.service.ts  # 공통 서비스
│   │   └── entities/          # 기본 엔티티
│   │       └── base.entity.ts # 베이스 엔티티 (id, createdAt, updatedAt)
│   ├── mail/                  # 이메일 모듈
│   │   ├── mail.module.ts     # 메일 모듈
│   │   └── mail.service.ts    # 메일 발송 서비스
│   └── user/                  # 사용자 모듈
│       ├── dtos/              # 데이터 전송 객체
│       ├── entities/          # 데이터베이스 엔티티
│       ├── guards/            # 인증 가드
│       ├── strategies/        # Passport 전략
│       ├── user.controller.ts # 사용자 컨트롤러
│       ├── user.module.ts     # 사용자 모듈
│       └── user.service.ts    # 사용자 서비스
├── migrator/                  # 데이터베이스 마이그레이션
│   ├── migrations/            # 마이그레이션 파일들
│   └── scripts/               # 마이그레이션 스크립트
├── test/                      # E2E 테스트
└── dist/                      # 빌드 결과물
```

## 코딩 컨벤션

### 파일명 규칙

- **Controllers**: `{domain}.controller.ts` (`user.controller.ts`)
- **Services**: `{domain}.service.ts` (`user.service.ts`)
- **Modules**: `{domain}.module.ts` (`user.module.ts`)
- **DTOs**: `kebab-case.dto.ts` (`create-user.dto.ts`)
- **Entities**: `kebab-case.entity.ts` (`email-verification.entity.ts`)
- **Guards**: `kebab-case.guard.ts` (`access-jwt-auth.guard.ts`)
- **Strategies**: `kebab-case.strategy.ts` (`access-jwt.strategy.ts`)

### Import/Export 규칙

```typescript
// NestJS 데코레이터 import
import { Controller, Post, Body, UseGuards } from '@nestjs/common';

// 타입 import는 별도로
import type { User } from './entities/user.entity';

// 로컬 import는 상대 경로 사용
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';

// 클래스는 default export
@Controller('user')
export class UserController {}
```

### TypeScript 규칙

- **Interface 네이밍**: Request/Response 접미사 (`CreateUserRequest`)
- **DTO 클래스**: `class-validator` 데코레이터 사용
- **Entity 클래스**: TypeORM 데코레이터 사용
- **Enum**: PascalCase (`UserStatus`)

### DTO 설계 원칙

#### 1. DTO 독립성 규칙

- 모든 Request DTO와 Response DTO는 서로 독립적이어야 함
- DTO는 Entity 클래스로부터만 상속 관계를 가질 수 있음
- DTO 간 상속은 금지 (Cross-DTO inheritance 방지)

#### 2. NestJS 유틸리티 타입 활용

- Entity 필드를 재사용할 때는 유틸리티 타입 사용 권장
- `PickType`: Entity에서 특정 필드만 선택
- `PartialType`: 모든 필드를 optional로 변경
- `OmitType`: 특정 필드 제외

```typescript
// ✅ 좋은 예: 유틸리티 타입 사용
export class UserResDto extends PickType(User, [
  'uuid',
  'name',
  'email',
  'is_verified',
  'verified_at',
] as const) {}

export class EmailRegistrationDto extends PickType(User, ['email'] as const) {}

// ❌ 나쁜 예: 필드 중복 정의
export class UserResDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;
  // ... 중복된 필드 정의
}
```

#### 3. Serialization 전략

- `ClassSerializerInterceptor`를 전역적으로 사용
- Controller에서는 `@SerializeOptions` 데코레이터만 사용
- `plainToClass` 수동 호출 금지

```typescript
// Controller 예시
@Controller('v1/user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  @Post('sign-in')
  @SerializeOptions({ type: SignInResDto })
  async signIn(@Body() dto: SignInReqDto): Promise<SignInResDto> {
    // plainToClass 사용하지 않고 직접 객체 반환
    return {
      message: 'Sign in successful',
      user,
      access_token,
    };
  }
}
```

#### 4. DTO 필드 노출 규칙

- **Response DTO**: 모든 필드에 `@Expose()` 데코레이터 필수
- **Request DTO**: `@Expose()` 불필요 (입력 검증용)
- **Entity 상속 시**: Entity의 `@Expose()`/`@Exclude()` 규칙 자동 상속

```typescript
// Response DTO 예시
export class UserResDto {
  @ApiProperty()
  @Expose()  // ✅ Response DTO 필드에는 필수
  uuid: string;

  @ApiProperty()
  @Expose()  // ✅ Response DTO 필드에는 필수
  email: string;
}

// Entity를 상속한 DTO
export class UserBasicDto extends PickType(User, ['email', 'name']) {
  // Entity의 @Expose() 설정이 자동으로 상속됨
}
```

**중요**: 전역 `ClassSerializerInterceptor` 설정에서 `excludeExtraneousValues: true`를 사용하므로, Response DTO의 모든 필드는 반드시 `@Expose()` 데코레이터가 있어야 응답에 포함됨

## 데이터베이스 설계

### Entity 구조

#### Entity 필드 노출 규칙

- **기본 규칙**: 모든 Entity 필드에 `@Expose()` 데코레이터 추가
- **예외**: 민감한 정보는 `@Exclude()` 사용
  - password, token, secret 등 보안 관련 필드
  - 내부 시스템 정보
  - 사용자에게 노출하면 안 되는 메타데이터

```typescript
// 베이스 엔티티 (모든 엔티티가 상속)
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column({ unique: true })
  @Expose() // ✅ 노출 가능한 필드
  uuid: string;

  @CreateDateColumn()
  @Expose() // ✅ 노출 가능한 필드
  created_at: Date;

  @UpdateDateColumn()
  @Exclude() // ❌ 내부 메타데이터
  updated_at: Date;
}

// 사용자 엔티티 예시
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Expose() // ✅ 노출 가능한 필드
  email: string;

  @Column({ nullable: true })
  @Exclude() // ❌ 민감한 정보
  password: string;

  @Column()
  @Expose() // ✅ 노출 가능한 필드
  name: string;

  @Column({ default: false })
  @Expose() // ✅ 노출 가능한 필드
  is_verified: boolean;
}
```

#### ClassSerializerInterceptor 설정

전역 설정에서 `excludeExtraneousValues: true`와 `strategy: 'excludeAll'`을 사용하므로, `@Expose()` 데코레이터가 없는 필드는 자동으로 제외됨

### 마이그레이션 패턴

```bash
# 마이그레이션 생성
pnpm run typeorm:migration:generate

# 마이그레이션 실행
pnpm run typeorm:migration:run

# 마이그레이션 되돌리기
pnpm run typeorm:migration:revert
```

## 인증 시스템

### JWT 토큰 전략

- **Access Token**: 15분 만료, 메모리 저장 (Authorization 헤더)
- **Refresh Token**: 7일 만료, HTTP-only 쿠키
- **토큰 자동 갱신**: axios interceptor 활용

### 인증 가드 사용

```typescript
// 필요한 가드 import
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

// Access Token 인증이 필요한 엔드포인트
@UseGuards(AccessJwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}

// Refresh Token 인증이 필요한 엔드포인트
@UseGuards(RefreshJwtAuthGuard)
@Post('refresh')
async refresh(@Request() req) {
  return this.userService.refreshToken(req.user);
}
```

### Google OAuth 플로우

```typescript
// Google OAuth 로그인 처리
@Post('google')
async googleSignIn(@Body() googleSignInDto: GoogleSignInDto) {
  const { access_token } = googleSignInDto;

  // Google에서 사용자 정보 가져오기
  const googleUser = await this.googleOAuth.getProfile(access_token);

  // 기존 사용자 확인 또는 새로운 사용자 생성
  const user = await this.userService.findOrCreateGoogleUser(googleUser);

  // JWT 토큰 생성 및 반환
  return this.userService.login(user);
}
```

## API 설계 원칙

### REST API 규칙

```typescript
// 컨트롤러 구조 예시
@Controller('v1/user')
export class UserController {
  // POST /v1/user/sign-in
  @Post('sign-in')
  async signIn(@Body() signInDto: EmailPasswordSignInDto) {}

  // POST /v1/user/register-email
  @Post('register-email')
  async registerEmail(@Body() registerEmailDto: RegisterEmailDto) {}

  // POST /v1/user/refresh
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {}
}
```

### DTO 검증 패턴

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class EmailPasswordSignInDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
```

#### 에러 메시지 언어

- 모든 사용자 대면 에러 메시지는 영어로 작성
- 개발자 주석은 한국어 가능
- API 응답 메시지는 영어로 통일

### 응답 형식 표준화

```typescript
// 성공 응답
interface ApiSuccessResponse<T = any> {
  message: string;
  data?: T;
  success: true;
}

// 에러 응답
interface ApiErrorResponse {
  message: string;
  error?: {
    code: string;
    details?: any;
  };
  success: false;
}

// 인증 성공 응답
interface AuthSuccessResponse {
  message: string;
  user: User;
  access_token: string;
}
```

## 이메일 시스템

### 이메일 템플릿 구조

```typescript
@Injectable()
export class MailService {
  // 이메일 인증 메일 발송
  async sendEmailVerification(to: string, token: string) {
    const verificationUrl = `${process.env.BASE_URL}/complete-registration?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: '이메일 인증을 완료해주세요',
      html: this.generateVerificationEmailHtml(verificationUrl),
    });
  }

  // 패스워드 리셋 메일 발송
  async sendPasswordReset(to: string, token: string) {
    const resetUrl = `${process.env.BASE_URL}/reset-password/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: '비밀번호 재설정',
      html: this.generatePasswordResetEmailHtml(resetUrl),
    });
  }
}
```

## 보안 설정

### 환경 변수 관리

```typescript
// 필수 환경 변수
export const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_DATABASE',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'BASE_URL',
];
```

### 보안 헤더 설정

```typescript
// main.ts에서 보안 설정
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.BASE_URL,
    credentials: true,
  });

  // 보안 헤더
  app.use(helmet());

  // 압축
  app.use(compression());

  // 글로벌 파이프 (검증)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
```

## 테스트 및 빌드

### 개발 명령어

```bash
# 개발 서버 (watch 모드)
pnpm run start:dev

# 프로덕션 빌드
pnpm run build

# 프로덕션 실행
pnpm run start:prod

# 테스트 실행
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 린트 검사
pnpm run lint

# 코드 포맷팅
pnpm run format
```

### Docker 개발 환경

```bash
# 데이터베이스만 시작
docker-compose up -d db

# 전체 서비스 시작
docker-compose up -d

# API 서버 로그 확인
docker-compose logs -f api
```

## 데이터베이스 스키마

### 주요 테이블

1. **users**: 사용자 기본 정보
2. **refresh_tokens**: 리프레시 토큰 관리
3. **email_verifications**: 이메일 인증 토큰
4. **oauth_providers**: OAuth 연동 정보

### 관계 설정

```typescript
// User와 RefreshToken (1:N 관계)
@OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
refreshTokens: RefreshToken[];

// User와 OAuth (1:N 관계)
@OneToMany(() => OAuth, (oauth) => oauth.user)
oauthProviders: OAuth[];
```

## 에러 처리

### 글로벌 예외 필터

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        success: false,
        message: exception.message,
        error: {
          code: exception.getResponse(),
        },
      });
    }
  }
}
```

## 주요 패턴 요약

1. **모듈 구조**: 도메인별 모듈 분리 (user, mail, common, ai-agent)
2. **인증 전략**: JWT (access/refresh) + Google OAuth
   - Access Token: `AccessJwtAuthGuard` 사용
   - Refresh Token: `RefreshJwtAuthGuard` 사용
3. **데이터 검증**: class-validator 기반 DTO 검증
4. **데이터베이스**: TypeORM + PostgreSQL, 마이그레이션 기반 스키마 관리
5. **보안**: Argon2 해싱, 보안 헤더, CORS 설정, CSRF 보호
6. **이메일**: NodeMailer + SMTP, 템플릿 기반 발송
7. **환경 설정**: .env 기반 설정, 필수 변수 검증
8. **에러 처리**: 글로벌 예외 필터, 표준화된 응답 형식
9. **DTO 설계**: 독립적 DTO, 유틸리티 타입 활용, ClassSerializerInterceptor 사용, Response DTO에 @Expose() 필수
10. **API 응답**: 영어 메시지, 표준화된 형식

## 중요 개발 규칙

### 1. DTO 독립성

- Request DTO와 Response DTO는 완전히 독립적으로 설계
- Entity로부터만 상속 가능 (PickType, PartialType 등 사용)
- DTO 간 상속 금지

### 2. Serialization

- Controller에 `@UseInterceptors(ClassSerializerInterceptor)` 적용
- 각 메서드에 `@SerializeOptions({ type: ResDto })` 사용
- `plainToClass` 수동 호출 금지
- Response DTO의 모든 필드에 `@Expose()` 데코레이터 필수

### 3. 언어 규칙

- 모든 API 응답 메시지: 영어
- 에러 메시지: 영어
- 코드 주석: 한국어 가능

### 4. 패스워드 리셋 플로우

- `/reset-password`: 이메일로 리셋 링크 발송
- `/verify-reset-token`: 토큰 검증 및 이메일 반환
- `/confirm-reset-password`: 새 비밀번호 설정

### 5. Entity 필드 노출 규칙

- 모든 Entity 필드에 `@Expose()` 데코레이터 기본 추가
- 민감한 정보(password, token, secret)는 `@Exclude()` 사용
- ClassSerializerInterceptor가 전역으로 설정되어 있어 `@Expose()` 없는 필드는 자동 제외

이 스펙을 따라 개발하면 확장 가능하고 안전한 NestJS 백엔드 API를 구축할 수 있습니다.
