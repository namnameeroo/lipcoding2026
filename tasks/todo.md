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

### Phase 1. 기반 정리
- [ ] 핵심 의존성 추가 (openai, zod, zustand, framer-motion, three, @react-three/fiber, @react-three/drei) - 미정
- [ ] `src/types/tasks.ts` 공유 타입 정의 (EmotionTag, TaskStatus, MoodEmoji, MicroTask, TaskSession) - 미정
- [ ] `src/lib/emotions.ts` 감정 태그·프로필·라벨 단일 소스 정의 - 미정
- [ ] 플레이스홀더 대시보드(`src/app/page.tsx`) 교체 계획 확정 - 미정
- [ ] 앱 이름/메타데이터 딱(Ddak) 기준 정리 (`layout.tsx`) - 미정

## Backlog

### Phase 2. AI 분석 API
- [ ] `src/app/api/analyze/route.ts` POST 핸들러 - 미정
- [ ] `src/lib/ai/analyzeGoal.ts` `gpt-4o-mini` OpenAI 호출 + zod JSON 스키마 검증 - 미정
- [ ] `src/lib/rate-limit.ts` IP당 분당 5회 제한 - 미정
- [ ] 입력 오류(400)/제한(429)/서버 오류(500) 분기 - 미정

### Phase 3. 상태와 저장소
- [ ] `src/store/taskSessionStore.ts` Zustand store - 미정
- [ ] LocalStorage persistence (`ddak.task-session.v1`) - 미정
- [ ] LocalStorage 파싱/스키마 실패 시 초기화 프롬프트 - 미정
- [ ] 세션 생성/복구/폐기, 완료, 이모지 저장 액션 - 미정

### Phase 4. 핵심 UX
- [ ] GoalInput / AnalyzeLoading / CurrentTaskCard / TaskQueuePreview - 미정
- [ ] MoodCheck(선택/건너뛰기) / ResumePrompt - 미정
- [ ] 시작·완료·전체 완료 플로우 연결 - 미정

### Phase 5. 감정 반응형 비주얼
- [ ] `EmotionVisual.tsx` 3D/2D 선택 래퍼 + 3D 지연 로딩 - 미정
- [ ] `EmotionScene.tsx` 3D + 태그별 recipe/material/motion - 미정
- [ ] 완료율 기반 부드러움 변화 - 미정
- [ ] `EmotionFallback2D.tsx` + 3D/2D 선택 규칙 적용 - 미정
- [ ] `ParticleBurst.tsx` 시작/완료 보상 효과 - 미정

### Phase 6. 마감 품질
- [ ] 오류 문구·접근성·반응형 점검 - 미정
- [ ] `npm run lint` / `npm run build` 통과 - 미정
- [ ] 검증 시나리오 수동 확인 - 미정

## Done

- [x] 브레인스토밍 기반 상세 요구사항 분석 문서화 (`requirements-analysis.md`) - 2026-06-20
