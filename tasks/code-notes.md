---
title: "Code Notes"
purpose: "Capture implementation facts, local conventions, and codebase observations that help future changes."
status: "active"
updated: "2026-06-20"
entry_policy: "Write observations from the actual codebase only. Avoid speculative architecture notes."
---

# Code Notes

## Architecture Notes

- App Router 구조. 진입점은 `src/app/page.tsx`, 공통 레이아웃은 `src/app/layout.tsx`.
- `src/app/page.tsx`는 `DdakApp` 클라이언트 컴포넌트를 렌더링하고, 실제 홈/로딩/태스크/완료 플로우는 `src/components/`에 분리되어 있다.
- AI 호출은 서버 Route Handler(`src/app/api/analyze/route.ts`)로만 수행하고 키를 클라이언트에 노출하지 않는다.

## File Notes

- `src/app/layout.tsx`: Geist 폰트 변수 주입, `metadata`와 `lang`은 딱(Ddak)/한국어 기준.
- `src/app/globals.css`: Tailwind 4를 `@import "tailwindcss"`로 로드, `@theme inline` 토큰과 배경/전경 색만 정의.
- `next.config.ts`: 기본 설정만 있음(커스텀 옵션 없음).
- `eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript 사용.

## Conventions

- TypeScript strict. 감정 태그/태스크 상태는 union type으로 제한하고 `any` 지양.
- 경로 별칭 `@/*` → `src/*`.
- 들여쓰기 2칸, 더블 쿼트, 함수형 컴포넌트(스타터 코드 기준 관찰).
- 3D/애니메이션 등 클라이언트 전용 로직은 클라이언트 컴포넌트로 명시 분리.

## Current Gaps

- 테스트 도구는 아직 미구성이다. 현재 검증은 `npm run lint`와 `npm run build` 기준.
- `/api/analyze`는 `OPENAI_API_KEY`가 있어야 실제 AI 분석 요청을 완료한다.
