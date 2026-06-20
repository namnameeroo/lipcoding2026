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
- 현재 `page.tsx`는 스타터 대시보드 플레이스홀더(metrics/roadmap/activity 더미)다. MVP 홈/태스크 플로우로 교체 대상.
- AI 호출은 서버 Route Handler(`src/app/api/analyze/route.ts`, 신규 예정)로만 수행하고 키를 클라이언트에 노출하지 않는다.

## File Notes

- `src/app/layout.tsx`: Geist 폰트 변수 주입, `metadata`는 영문 스타터 문구라 딱(Ddak) 기준으로 갱신 필요.
- `src/app/globals.css`: Tailwind 4를 `@import "tailwindcss"`로 로드, `@theme inline` 토큰과 배경/전경 색만 정의.
- `next.config.ts`: 기본 설정만 있음(커스텀 옵션 없음).
- `eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript 사용.

## Conventions

- TypeScript strict. 감정 태그/태스크 상태는 union type으로 제한하고 `any` 지양.
- 경로 별칭 `@/*` → `src/*`.
- 들여쓰기 2칸, 더블 쿼트, 함수형 컴포넌트(스타터 코드 기준 관찰).
- 3D/애니메이션 등 클라이언트 전용 로직은 클라이언트 컴포넌트로 명시 분리.

## Open Questions

- 3D 씬을 dynamic import(ssr: false)로 지연 로딩할지, 초기 번들에 포함할지.
- rate limit을 인메모리로 둘지, 배포 환경에 맞춰 외부 스토어(KV)로 둘지.
- 테스트 도구 미구성 — MVP에 도입할지 여부.
