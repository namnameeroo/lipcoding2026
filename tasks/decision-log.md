---
title: "Decision Log"
purpose: "Record decisions that affect product direction, architecture, design, workflow, or scope."
status: "active"
updated: "2026-06-20"
entry_format: "YYYY-MM-DD: Decision title"
---

# Decision Log

<!--
## YYYY-MM-DD: Decision Title

Status: proposed | accepted | superseded

Context:

Decision:

Reasoning:

Consequences:
-->

## 2026-06-20: 앱 이름 딱(Ddak) 확정

Status: accepted

Context: 시작 마찰을 줄이는 앱 컨셉에 맞는 이름이 필요.

Decision: 제품 이름을 "딱(Ddak)"으로 확정.

Reasoning: "딱 2분", "딱 이것만", "딱 시작" 등 핵심 컨셉과 자연스럽게 연결되고 한국 타겟에 임팩트가 큼.

Consequences: UI 문구, 메타데이터, LocalStorage 키 네임스페이스(`ddak.*`)를 이 이름 기준으로 통일.

## 2026-06-20: 감정 태그는 세션당 단일 태그

Status: accepted

Context: 브레인스토밍 예시에 혼합 태그(부담+복잡) 표현이 있어 원칙 재확인 필요.

Decision: AI는 태스크 세션당 가장 지배적인 감정 태그 하나만 분류한다.

Reasoning: 오브젝트 결정 로직을 단순화하고 MVP 일정 안에서 6종 표현을 일관되게 구현하기 위함.

Consequences: 다중 태그 혼합 오브젝트는 범위에서 제외. 오브젝트 프로필은 6개 태그에 1:1 매핑.

## 2026-06-20: 완료 후 기분 이모지는 MVP에서 기록만

Status: accepted

Context: 브레인스토밍은 이모지를 "다음 태스크 톤 조정"에 쓴다고 했으나, 태스크는 1회 분석으로 모두 생성되고 태그도 단일이라 즉시 톤 조정이 불가.

Decision: MVP는 이모지를 태스크 결과에 저장만 하고, 이미 생성된 다음 태스크 문구를 재작성하지 않는다.

Reasoning: 추가 AI 호출 없이 일정과 비용을 보호하고, 가짜 동작을 만들지 않기 위함.

Consequences: 이모지 기반 톤 조정은 후속 범위. 이모지 분류(happy/frustrated/tired/neutral/proud)는 저장 스키마로만 우선 확정.

## 2026-06-20: 기준 프레임워크는 Next.js 16 (브레인스토밍의 14 표기 보정)

Status: accepted

Context: 브레인스토밍은 Next.js 14로 적었으나 실제 설치는 16.2.9.

Decision: 구현은 설치된 Next.js 16.2.9 / React 19 기준으로 진행한다.

Reasoning: 실제 의존성과 문서를 일치시켜 Route Handler·클라이언트 컴포넌트·dynamic import 패턴 오류를 방지.

Consequences: 코드 작성 전 `node_modules/next/dist/docs/`의 해당 버전 가이드를 확인한다.

## 2026-06-20: 3D 오브젝트는 primitive 변형 레시피로 구현

Status: accepted

Context: `blob`, `spike`, `flatBlob`, `seed`는 Three.js/drei 기본 컴포넌트가 아님.

Decision: 6종 감정 오브젝트는 공통 primitive(sphere/icosahedron/dodecahedron 등)와 distortion/scale로 표현하고, 2D CSS 폴백을 동등 경로로 제공한다.

Reasoning: 1주 MVP에서 정교한 절차적 모델링은 위험. 차별점은 유지하되 구현 가능성을 확보.

Consequences: Phase 5에서 태그별 recipe를 정의. 저성능·저모션·모바일·WebGL 미지원 시 2D 폴백 우선.

## 2026-06-20: AI 모델과 응답 검증 방식 확정

Status: accepted

Context: 요구사항 분석에서 모델과 런타임 검증 방식이 기본 가정으로만 남아 있어 구현 시 해석 여지가 있음.

Decision: MVP 기본 모델은 `gpt-4o-mini`로 고정하고, OpenAI 응답은 서버에서 `zod` 스키마로 검증한다.

Reasoning: 비용을 통제하면서도 AI 응답을 신뢰하지 않고 API 계약을 강제해야 한다.

Consequences: 핵심 의존성에 `zod`를 추가한다. JSON 파싱 실패, 스키마 불일치, 알 수 없는 필드, 태스크 개수 미달/초과는 성공 데이터로 대체하지 않고 오류로 처리한다.

## 2026-06-20: MVP rate limit은 인메모리로 구현

Status: accepted

Context: 현재 배포 환경이 확정되지 않았고 MVP는 단일 인스턴스 기준으로 먼저 동작해야 함.

Decision: `/api/analyze` rate limit은 IP당 분당 5회, 인메모리 저장소로 구현한다.

Reasoning: 1주 MVP에서 외부 Redis/KV 연결은 범위를 키운다.

Consequences: 서버리스 또는 다중 인스턴스 배포 시 제한이 인스턴스별로 적용될 수 있다. 배포 환경이 확정되면 외부 저장소로 교체한다.

## 2026-06-20: 이모지 체크는 선택 사항

Status: accepted

Context: 완료 후 기분 이모지는 후속 톤 조정에 쓸 수 있지만 MVP에서는 기록만 하기로 결정되어 있음.

Decision: 사용자는 완료 후 이모지를 선택하거나 건너뛸 수 있다. 건너뛰면 `mood`를 저장하지 않는다.

Reasoning: 감정 선택을 강제하면 "딱 하나만 시작"이라는 저마찰 UX와 충돌한다. 선택하지 않은 값을 `neutral`로 저장하면 데이터 의미가 왜곡된다.

Consequences: `MoodCheck`에는 스킵 액션이 필요하고, `mood`는 optional 필드로 유지한다.

## 2026-06-20: 3D 씬은 지연 로딩하고 2D 폴백은 즉시 제공

Status: accepted

Context: 3D 오브젝트는 핵심 차별점이지만 초기 화면과 모바일/저성능 환경을 막으면 안 됨.

Decision: 3D 씬은 클라이언트 전용 지연 로딩으로 분리하고, 3D 비활성 조건에서는 2D CSS 폴백을 우선 표시한다.

Reasoning: AI 입력과 태스크 진행은 3D 번들 로딩이나 WebGL 지원 여부와 독립적으로 동작해야 한다.

Consequences: `EmotionVisual` 같은 래퍼가 3D/2D 선택 규칙을 담당하고, `EmotionScene`은 브라우저 전용 컴포넌트로 분리한다.

## 2026-06-20: Azure 1차 배포 후보는 App Service Linux

Status: accepted

Context: 배포 환경을 Azure로 준비해야 하며, 현재 앱은 `/api/analyze` Route Handler에서 서버 전용 `OPENAI_API_KEY`로 OpenAI를 호출한다.

Decision: 1차 배포 대상을 Azure App Service Linux + Node.js 20+로 확정한다. Azure Static Web Apps는 `/api/analyze` 서버 런타임 요구사항 때문에 기본 배포 대상으로 두지 않고, Container Apps는 MVP 대비 운영 복잡도가 높아 후순위 대안으로 둔다.

Reasoning: App Service는 Node.js 서버 런타임, App Settings 기반 비밀 주입, Application Insights 연동, 배포 슬롯 전략을 MVP 운영 요구사항에 맞게 제공한다.

Consequences: IaC, CI/CD, App Settings, 관측성, 비용 알림 작업을 App Service 기준으로 먼저 정리한다. 다중 인스턴스 운영 전에는 인메모리 rate limit을 외부 공유 저장소로 교체해야 한다.
