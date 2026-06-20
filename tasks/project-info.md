---
title: "Project Info"
purpose: "Keep stable, factual project information that new contributors or future agents should know."
status: "active"
updated: "2026-06-20"
entry_policy: "Only add confirmed project facts. Do not use placeholder business, product, or architecture details."
---

# Project Info

## Identity

- 패키지 이름: `lipcoding2026`
- 제품 이름: 딱(Ddak)
- 한 줄 설명: 큰 목표를 2분짜리 마이크로 태스크로 쪼개 시작을 돕는 감정 반응형 웹 앱.

## Scope

- 핵심: AI 태스크 분해 + 단일 감정 태그 분류 + 감정 반응형 3D/2D 오브젝트.
- 사용자: 시작을 미루는 사람(일상 할 일 ~ 대형 프로젝트).
- 비목표(MVP): 계정/로그인, 서버 영구 저장, 히스토리, 소셜 공유, 스트릭, 완료 검증.

## Stack

- 런타임/프레임워크: Next.js 16.2.9 (App Router), React 19.2.4
- 언어: TypeScript (strict)
- 스타일: Tailwind CSS 4 (`globals.css` `@import "tailwindcss"`)
- 패키지 매니저: npm (`package-lock.json`)
- 린트: ESLint (`eslint-config-next`)
- 설치됨: openai, zod, zustand, framer-motion, three, @react-three/fiber, @react-three/drei
- 기본 AI 모델: `gpt-4o-mini`

## Commands

- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 프로덕션 실행: `npm run start`
- 린트: `npm run lint`
- 테스트: 미구성

## Environments

- 로컬: http://localhost:3000
- 스테이징/프로덕션: Azure 배포 예정, 구독/리전/URL 미정
- 1차 배포 후보: Azure App Service Linux + Node.js 20+
- 필요한 환경 변수: `OPENAI_API_KEY` (서버 전용, `/api/analyze`에서만 사용)

## Infrastructure Baseline

- 서버 런타임 필요: `/api/analyze` Route Handler가 OpenAI를 호출하므로 정적 호스팅만으로는 기본 요구사항을 충족하지 않는다.
- 비밀 관리: `OPENAI_API_KEY`는 Azure App Settings 또는 Key Vault 연동으로 주입하고 클라이언트 번들, LocalStorage, 로그에 노출하지 않는다.
- 관측성: Application Insights / Log Analytics로 서버 오류, 지연 시간, 429 rate limit 응답을 추적한다.
- 확장성 주의: 현재 rate limit은 인메모리이므로 App Service 다중 인스턴스 또는 슬롯 확장 전 외부 공유 저장소로 교체해야 한다.
- 데이터 저장: MVP는 서버 DB 없이 LocalStorage만 사용한다. 계정, 히스토리, 서버 영구 저장은 후속 범위다.

## Important Paths

- `src/app/`: App Router 진입점, 레이아웃, 페이지
- `src/app/globals.css`: Tailwind 4 + 테마 토큰
- `tasks/`: 프로젝트 추적 문서
- `tasks/requirements-analysis.md`: 구현용 MVP 요구사항
- `BRAINSTORM.md`: 원본 기획 기록
- 경로 별칭: `@/*` → `./src/*` (`tsconfig.json`)
