
# Gemini-CLI 메타데이터

이 문서는 Gemini-CLI가 프로젝트의 구조와 스크립트, 핵심 개발 원칙을 이해하는 데 도움을 주기 위해 작성되었습니다.

## 🎯 프로젝트 목표

NestJS 백엔드와 React 프론트엔드를 갖춘 풀스택 애플리케이션 보일러플레이트입니다. Docker 기반으로 개발 환경을 제공하며, 인증 및 기본적인 CRUD 기능을 포함합니다.

## 🗂️ 프로젝트 구조

- **`/` (루트)**: Docker 설정, 전체 README 등 프로젝트 전반에 관한 파일이 위치합니다.
- **`/api`**: NestJS로 구현된 백엔드 API 서버입니다. **(자세한 내용은 `api/GEMINI.md` 참고)**
- **`/front`**: React(Vite)로 구현된 프론트엔드 애플리케이션입니다. **(자세한 내용은 `front/GEMINI.md` 참고)**
- **`/proxy`**: Nginx 리버스 프록시 설정이 있습니다.

## 💡 핵심 개발 원칙

1.  **관심사 분리 (Separation of Concerns)**: `api`와 `front`는 완전히 독립적으로 개발되고 실행될 수 있어야 합니다. 각 파트는 명확히 정의된 인터페이스(REST API)를 통해서만 통신합니다.

2.  **엄격한 타입 시스템 (Strict Typing)**: 프로젝트 전체에서 TypeScript의 `strict` 모드를 사용하여 코드의 안정성과 예측 가능성을 높입니다. `any` 타입 사용은 지양합니다.

3.  **코드 품질 유지 (Code Quality)**: 모든 코드는 `lint`와 `prettier` 규칙을 통과해야 합니다. 빌드 시 타입 에러는 허용되지 않습니다 (Zero Tolerance).

4.  **환경 변수를 통한 설정**: 모든 설정 값(DB 접속 정보, JWT 시크릿 등)은 `.env` 파일을 통해 주입됩니다. 소스 코드에 민감한 정보를 하드코딩하지 않습니다.

## 🐳 전체 프로젝트 실행 (Docker)

**실행:**
```bash
docker-compose up -d
```

**종료:**
```bash
docker-compose down
```

**로그 확인:**
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그 (api, front, db, proxy)
docker-compose logs -f api
```

## ✅ 주요 기술 스택

- **공통**: Docker, Nginx, pnpm, TypeScript
- **백엔드**: NestJS, TypeORM, PostgreSQL
- **프론트엔드**: React, Vite, TailwindCSS, Zustand

자세한 내용은 각 하위 디렉토리의 `GEMINI.md` 파일을 참고하세요.
