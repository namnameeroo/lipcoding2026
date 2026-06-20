---
title: "Todo"
purpose: "Track real project tasks, priorities, ownership, and completion status."
status: "active"
updated: "2026-06-20"
entry_format: "- [ ] Task description - owner - date or milestone"
---

# Todo

> 출처: `requirements-analysis.md` 구현 단계(Phase 1~6). 상세 수용 기준은 요구사항 문서 참고.

## Active

### Judging Rubric / 심사 고득점화
- [ ] AI 태스크 검토/수정 화면 추가: 분석 결과를 세션으로 확정하기 전에 사용자가 태스크 수정·삭제·재생성을 선택할 수 있게 설계 - 프론트엔드/UX - rubric-p1
- [ ] Microsoft Foundry 원격 project/model deployment 연결: 실제 Foundry project endpoint, model deployment, eval suite를 구성하고 배포 전 local/remote invoke 검증 - AI/인프라 - rubric-p0

### Infrastructure / Azure 배포 준비
- [ ] Azure 구독, 리소스 그룹, 리전 확정 - 인프라 - pre-deploy
- [ ] 스테이징/프로덕션 환경 이름, URL, 배포 슬롯 전략 정리 - 인프라 - pre-deploy
- [ ] 다중 인스턴스 배포 전 rate limit 저장소 외부화(Redis/KV 등) 검토 - 백엔드/인프라 - production-readiness
- [ ] OpenAI 사용량 예산, Azure 비용 알림, App Service SKU 가드레일 설정 - 인프라 - production-readiness

### Phase 6. 마감 품질
- [ ] 검증 시나리오 수동 확인 - 미정

## Backlog

## Done

- [x] 브레인스토밍 기반 상세 요구사항 분석 문서화 (`requirements-analysis.md`) - 2026-06-20
- [x] 핵심 의존성 추가 (openai, zod, zustand, framer-motion, three, @react-three/fiber, @react-three/drei) - 2026-06-20
- [x] `src/types/tasks.ts` 공유 타입 정의 (EmotionTag, TaskStatus, MoodEmoji, MicroTask, TaskSession) - 2026-06-20
- [x] `src/lib/emotions.ts` 감정 태그·프로필·라벨 단일 소스 정의 - 2026-06-20
- [x] 플레이스홀더 대시보드(`src/app/page.tsx`)를 MVP 앱으로 교체 - 2026-06-20
- [x] 앱 이름/메타데이터 딱(Ddak) 기준 정리 (`layout.tsx`) - 2026-06-20
- [x] `src/app/api/analyze/route.ts` POST 핸들러 - 2026-06-20
- [x] `src/lib/ai/analyzeGoal.ts` `gpt-4o-mini` OpenAI 호출 + zod JSON 스키마 검증 - 2026-06-20
- [x] `src/lib/rate-limit.ts` IP당 분당 5회 제한 - 2026-06-20
- [x] 입력 오류(400)/제한(429)/서버 오류(500) 분기 - 2026-06-20
- [x] `src/store/taskSessionStore.ts` Zustand store - 2026-06-20
- [x] LocalStorage persistence (`ddak.task-session.v1`) - 2026-06-20
- [x] LocalStorage 파싱/스키마 실패 시 초기화 프롬프트 - 2026-06-20
- [x] 세션 생성/복구/폐기, 완료, 이모지 저장 액션 - 2026-06-20
- [x] GoalInput / AnalyzeLoading / CurrentTaskCard / TaskQueuePreview - 2026-06-20
- [x] MoodCheck(선택/건너뛰기) / ResumePrompt - 2026-06-20
- [x] 시작·완료·전체 완료 플로우 연결 - 2026-06-20
- [x] `EmotionVisual.tsx` 3D/2D 선택 래퍼 + 3D 지연 로딩 - 2026-06-20
- [x] `EmotionScene.tsx` 3D + 태그별 recipe/material/motion - 2026-06-20
- [x] 완료율 기반 부드러움 변화 - 2026-06-20
- [x] `EmotionFallback2D.tsx` + 3D/2D 선택 규칙 적용 - 2026-06-20
- [x] `ParticleBurst.tsx` 시작/완료 보상 효과 - 2026-06-20
- [x] 오류 문구·접근성·반응형 점검 - 2026-06-20
- [x] `npm run lint` / `npm run build` 통과 - 2026-06-20
- [x] `/api/analyze` rate limit 식별자 재설계: 기본 HttpOnly 세션 쿠키 + 선택적 신뢰 플랫폼 헤더 전략 적용 - 2026-06-20
- [x] `taskSessionStore` LocalStorage get/set/remove 예외 처리 및 사용자 메시지 분리 - 2026-06-20
- [x] `EmotionVisual` WebGL 감지 컨텍스트 해제 및 3D 렌더 실패 시 2D fallback 전환 - 2026-06-20
- [x] API 검증, rate limit, LocalStorage 실패 처리 회귀 테스트 도입 검토(테스트 도구 미구성, lint/build 기준 유지) - 2026-06-20
- [x] 배포 대상 확정: Azure App Service Linux(Node.js 20+) - 2026-06-20
- [x] `OPENAI_API_KEY` 비밀 관리 방식 확정: Bicep secure parameter → App Service App Settings - 2026-06-20
- [x] App Service Plan/Web App IaC 작성(Bicep + azd baseline) - 2026-06-20
- [x] GitHub Actions 기반 CI/CD 구성(`npm ci`, `npm run lint`, `npm run build`, App Service deploy) - 2026-06-20
- [x] Application Insights / Log Analytics 연결 Bicep 구성 - 2026-06-20
- [x] 배포 후 smoke test 경로 정의(`/api/health`) 및 GitHub Actions smoke test 구성 - 2026-06-20
- [x] Copilot SDK 또는 Microsoft Agent Framework 적용 방향 확정: `GoalCoachAgent` 단계형 workflow로 우선 추상화하고 Foundry 원격 연결은 후속 작업으로 분리 - 2026-06-20
- [x] `analyzeGoal`을 `GoalCoachAgent` 추상화로 분리: goal intake, safety review, task decomposition, structured output 책임 분리 및 zod 응답 계약 유지 - 2026-06-20
- [x] Azure OpenAI 모델 계층 전환 기반 추가: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT_NAME` 우선 사용 + OpenAI fallback 유지 - 2026-06-20
- [x] 로컬 평가 dataset 작성: `tasks/evaluation-dataset.jsonl`에 대표 목표 20개와 품질 기준 정의 - 2026-06-20
- [x] Responsible AI guardrail baseline 추가: 위험/불법 목표 차단, 고위험 목표 전문가 확인 지침, 안전 fallback 메시지 - 2026-06-20
- [x] App Insights custom telemetry 이벤트 스키마 구체화: request id, latency, 429/500, model error, token usage를 개인정보 없이 JSON 로그로 기록 - 2026-06-20
- [x] 심사용 README/데모 시나리오 작성: Agent workflow, Azure OpenAI 우선 모델 계층, evaluation dataset, 3개 데모 흐름 문서화 - 2026-06-20
- [x] Vitest 기반 최소 회귀 테스트 도입: rate limit, GoalCoachAgent safety/model config 테스트와 CI test 단계 추가 - 2026-06-20
