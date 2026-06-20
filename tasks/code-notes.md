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

## 2026-06-20 Review / Handoff Notes

- Console fix: `AnalyzeLoading`에서 Framer Motion이 SVG `d`, `cx`, `cy` 속성을 키프레임으로 직접 애니메이션하면 중간 렌더에서 `undefined`가 DOM에 쓰이며 브라우저 콘솔 오류가 발생할 수 있다. SVG 속성은 정적인 유효값으로 두고, 움직임은 `motion.g`의 transform(`scale`, `rotate`, `x`, `y`)으로 처리하는 방식이 안전하다.
- Verified after console fix: `npm run lint`, `npm run build`, 브라우저에서 `http://localhost:3000` 제출 흐름으로 `AnalyzeLoading` 표시 확인. 기존 `motion-dom`의 `Expected moveto path command`, `cx undefined`, `cy undefined` 오류는 재현되지 않았다.
- Informational console noise observed: React DevTools 안내, HMR 로그, Chrome content script 로그, font preload 경고는 앱 코드 오류로 보지 않았다. `THREE.Clock` deprecation 경고는 `@react-three/fiber`/`three` 조합의 의존성 경고로 보이며 SVG 콘솔 오류와는 별개다.
- Repository review finding: `/api/analyze`는 기본 설정에서 `TRUST_CLIENT_IP_HEADERS`가 `true`가 아니면 per-client rate limit이 꺼지고 전체 사용자 공유 글로벌 제한(`api:analyze:global`, 60/min)만 적용된다. 한 사용자가 글로벌 버킷을 소진하면 다른 사용자도 429를 받을 수 있다.
- Repository review finding: `taskSessionStore`의 `localStorage.getItem/setItem/removeItem`은 예외를 던질 수 있다. Safari private mode, storage disabled, quota exceeded 상황에서 세션 생성/복구 흐름이 깨지고 클라이언트에서는 네트워크 실패처럼 보일 수 있다.
- Repository review finding: `EmotionVisual`의 WebGL 감지는 `canvas.getContext("webgl2") || canvas.getContext("webgl")`로 컨텍스트를 만든 뒤 명시적으로 해제하지 않는다. 빈번한 실행은 아니지만 감지 후 `WEBGL_lose_context` 해제 또는 렌더 실패 시 fallback 전환을 검토할 수 있다.
- Review verification baseline: repo clean 상태에서 `npm run lint`와 `npm run build` 모두 통과.
- Follow-up implementation: `/api/analyze` rate limit은 기본적으로 HttpOnly `ddak.client-id` 세션 쿠키를 사용하고, `TRUST_CLIENT_IP_HEADERS=true`일 때만 `x-real-ip`/`x-forwarded-for`를 신뢰한다. 글로벌 버킷은 300/min coarse safeguard로 남겨 두었다.
- Follow-up implementation: `taskSessionStore`는 LocalStorage read/write/remove 예외를 `console.warn`으로 남기고, 앱 흐름은 인메모리 상태로 계속 진행하며 `storageError` 배너로 사용자에게 저장소 문제를 분리 표시한다.
- Follow-up implementation: `EmotionVisual` WebGL 감지는 `WEBGL_lose_context`로 감지용 컨텍스트를 해제하고, 3D scene 렌더 오류는 error boundary에서 2D fallback으로 전환한다.
- Azure implementation: `infra/app-service.bicep`는 App Service와 함께 workspace-based Application Insights/Log Analytics를 만들고 연결 문자열을 App Settings에 주입한다. `.github/workflows/azure-app-service.yml`는 OIDC 로그인, lint/build, App Service deploy, `/api/health` smoke test를 수행한다.
