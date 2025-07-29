# 📁 Feature Documentation Directory

프로젝트의 주요 기능에 대한 PRD(Product Requirements Document)와 기술 문서를 관리하는 디렉토리입니다.

## 📂 디렉토리 구조

```
feature/
├── README.md                    # 이 파일 (가이드)
├── templates/                   # PRD 템플릿들
│   ├── prd-template.md         # 표준 PRD 템플릿
│   └── feature-checklist.md    # 기능 구현 체크리스트
├── authentication/             # 인증 기능 PRD
│   ├── PRD.md                 # 메인 PRD 문서
│   ├── user-flows.md          # 사용자 플로우
│   ├── api-specs.md           # API 명세서
│   ├── security-requirements.md # 보안 요구사항
│   ├── ui-components.md       # UI 컴포넌트 명세
│   └── implementation-guide.md # 구현 가이드
└── [future-features]/         # 향후 기능들
```

## 🎯 PRD 작성 가이드

### 1. PRD 구조
각 기능의 PRD는 다음과 같은 구조를 따릅니다:

- **개요**: 기능의 목적과 비즈니스 가치
- **사용자 스토리**: 사용자 관점에서의 요구사항
- **기술 명세**: 구현에 필요한 기술적 요구사항
- **보안 요구사항**: 보안 관련 고려사항
- **UI/UX 명세**: 인터페이스 디자인 가이드
- **구현 계획**: 단계별 구현 로드맵

### 2. 문서 작성 원칙

- **명확성**: 개발자가 바로 구현할 수 있을 정도로 구체적으로 작성
- **일관성**: 기존 코드베이스의 패턴과 컨벤션을 따름
- **추적성**: 각 요구사항이 코드의 어느 부분에 구현되는지 명시
- **완성도**: 기획부터 구현, 테스트까지의 전체 프로세스 포함

### 3. 코드 연결

PRD의 각 요구사항은 실제 구현 코드와 연결됩니다:

```markdown
## 요구사항: 사용자 로그인
**구현 위치**: `src/pages/sign-in/index.tsx`, `src/hooks/useSignIn.ts`
**API 엔드포인트**: `POST /v1/user/sign-in`
**상태 관리**: `src/store/auth.ts`
```

## 🔄 업데이트 프로세스

1. **기능 추가 시**: 새로운 기능 디렉토리 생성 후 PRD 작성
2. **기능 수정 시**: 해당 PRD 문서 업데이트
3. **구현 완료 시**: implementation-guide에 완료 상태 표시

## 📋 현재 기능 상태

| 기능 | PRD 상태 | 구현 상태 | 문서 위치 | 완성도 |
|------|----------|-----------|-----------|---------|
| 인증 (Authentication) | ✅ 완료 | 🔄 70% 완료 | `authentication/` | 기반구조 완성, TODO 3개 남음 |

## 🚀 다음 단계

1. **인증 기능 완료**: 미완성 TODO 항목들 구현
2. **패스워드 리셋**: 새로운 기능 추가
3. **대시보드**: 사용자 워크스페이스 기능 확장
4. **프로필 관리**: 사용자 정보 관리 기능

---

이 디렉토리는 프로젝트의 기능 명세서 역할을 하며, 개발팀의 구현 가이드라인을 제공합니다.