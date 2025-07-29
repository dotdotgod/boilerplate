
# Gemini-CLI 메타데이터 (`/api`)

이 문서는 Gemini-CLI가 **API 서버**의 구조와 스크립트, 핵심 아키텍처 패턴을 이해하는 데 도움을 주기 위해 작성되었습니다.

##  역할

NestJS 기반의 백엔드 API 서버입니다. 사용자 인증, 데이터베이스 관리 등 핵심 비즈니스 로직을 처리하며, 프론트엔드 애플리케이션에 데이터를 제공합니다.

## ✅ 주요 기술 스택

- **프레임워크**: NestJS
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **ORM**: TypeORM
- **인증**: JWT (Access/Refresh Tokens), Google OAuth
- **패키지 매니저**: pnpm

## 📜 주요 명령어

- **의존성 설치**:
  ```bash
  pnpm install
  ```
- **개발 서버 실행 (Hot-reloading)**:
  ```bash
  pnpm run start:dev
  ```
- **프로덕션 빌드**:
  ```bash
  pnpm run build
  ```
- **E2E 테스트**:
  ```bash
  pnpm run test:e2e
  ```

## 🗄️ 데이터베이스 마이그레이션

- **마이그레이션 파일 생성 (스키마 변경 감지)**:
  ```bash
  pnpm run typeorm:migration:generate
  ```
- **마이그레이션 실행**:
  ```bash
  pnpm run typeorm:migration:run
  ```
- **마이그레이션 되돌리기**:
  ```bash
  pnpm run typeorm:migration:revert
  ```

## 🗂️ 디렉토리 구조

- **`src/`**: 핵심 소스 코드가 위치합니다.
  - **`main.ts`**: 애플리케이션 진입점.
  - **`app.module.ts`**: 루트 모듈.
  - **`user/`**: 사용자 관련 기능(인증, 프로필 등)을 담당하는 모듈.
    - **`guards/`**: `access-jwt-auth.guard.ts` 등 인증 가드.
    - **`strategies/`**: JWT 검증 전략.
  - **`common/`**: 여러 모듈에서 공통으로 사용하는 서비스나 엔티티.
- **`migrator/`**: TypeORM 마이그레이션 관련 파일 및 스크립트.
- **`test/`**: E2E 테스트 코드.

## 💡 핵심 아키텍처 및 패턴

### 1. 인증 및 권한 부여

- **JWT 기반 인증**: 인증이 필요한 모든 API 엔드포인트는 `Authorization: Bearer <accessToken>` 헤더를 검증합니다. 이는 `access-jwt-auth.guard.ts`를 통해 처리됩니다.
- **토큰 갱신 엔드포인트**: 프론트엔드에서 Access Token 만료(401 Unauthorized) 시, Refresh Token을 이용해 새로운 토큰을 발급받을 수 있는 `/user/refresh` 엔드포인트를 제공합니다. 이 경로는 `refresh-jwt-auth.guard.ts`로 보호됩니다.

### 2. 요청 처리 및 유효성 검사

- **DTO 사용**: 모든 API 요청의 `body`, `query`, `params`는 DTO(Data Transfer Object)를 통해 명시적으로 타입을 정의하고, `class-validator`를 통해 유효성을 검사해야 합니다.
- **일관된 응답 형식**: 성공적인 요청에 대해서는 일관된 데이터 구조를 반환하고, 실패 시에는 NestJS의 기본 예외 필터를 통해 표준화된 에러 객체(`{ statusCode, message, error }`)를 반환합니다. 이는 프론트엔드의 에러 처리를 용이하게 합니다.

### 3. 데이터베이스 상호작용

- **TypeORM Repository**: 데이터베이스 접근은 TypeORM의 `Repository` 패턴을 사용합니다.
- **트랜잭션 관리**: 여러 데이터를 수정하는 복잡한 비즈니스 로직은 `typeorm-transactional` 라이브러리의 `@Transactional()` 데코레이터를 사용하여 데이터의 원자성을 보장해야 합니다.

### 4. 응답 데이터 노출 제어 (DTO/Entity Security)

- **화이트리스트 전략 (Whitelist Strategy)**: API 응답으로 반환되는 데이터는 반드시 명시적으로 노출되어야 합니다. 이를 위해 `class-transformer`의 `@Exclude()`와 `@Expose()` 데코레이터를 사용합니다.
- **적용 방법**:
  1.  **전역 인터셉터 설정**: `main.ts`에 `ClassSerializerInterceptor`를 전역으로 적용하여 모든 응답이 직렬화 규칙을 따르도록 합니다.
  2.  **데코레이터 사용**: Entity 및 응답 DTO 클래스 상단에 `@Exclude()`를 붙여 모든 속성을 기본적으로 제외시킵니다.
  3.  **명시적 노출**: 클라이언트에 노출할 속성에만 `@Expose()` 데코레이터를 개별적으로 추가합니다.

- **예시 (`user.entity.ts`)**:
  ```typescript
  import { Exclude, Expose } from 'class-transformer';

  @Exclude()
  export class User {
    @Expose()
    id: number;

    @Expose()
    email: string;

    // password 필드는 @Expose()가 없으므로 절대 노출되지 않음
    password: string;
  }
  ```
- **보안**: 이 전략은 실수로라도 비밀번호 해시, 내부 관리용 필드 등 민감한 정보가 API 응답에 포함되는 것을 원천적으로 방지합니다.
