# 딱(Ddak)

큰 목표를 2분짜리 마이크로 태스크로 쪼개 시작을 돕는 감정 반응형 웹 앱입니다. 사용자가 목표를 입력하면 서버 API가 OpenAI를 호출해 실행 가능한 작업 목록과 단일 감정 태그를 생성하고, 클라이언트는 3D 또는 2D 오브젝트로 진행 상태를 보여줍니다.

## Project Tracking

Working notes for progress, decisions, todos, and project context live in [`tasks/`](tasks/).

## Stack

- Next.js 16.2.9 App Router, React 19.2.4, TypeScript strict
- Tailwind CSS 4
- OpenAI, zod, Zustand, Framer Motion, Three.js, React Three Fiber, drei
- npm (`package-lock.json`)

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` and set the required server-only environment variable:

```bash
OPENAI_API_KEY=...
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

Useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Azure Deployment Baseline

1차 배포 후보는 **Azure App Service Linux + Node.js 20+** 입니다. 이 앱은 `/api/analyze` Route Handler에서 OpenAI를 호출하고 `OPENAI_API_KEY`를 서버 환경 변수로만 사용하므로, 정적 호스팅보다 서버 런타임이 있는 배포 대상을 기본 가정으로 둡니다.

초기 Azure 구성 요소:

- Resource Group
- App Service Plan (Linux)
- Web App for Node.js 20+
- App Settings: `OPENAI_API_KEY`, `NODE_ENV=production`, `APPLICATIONINSIGHTS_CONNECTION_STRING`
- Application Insights / Log Analytics for runtime errors, latency, and `/api/analyze` 429 monitoring
- Optional: Key Vault integration for secret management

`infra/`는 Azure App Service Linux, Application Insights, Log Analytics를 Bicep으로 정의하고, `azure.yaml`은 azd 배포 기준을 제공합니다. GitHub Actions 배포는 `.github/workflows/azure-app-service.yml`에 있으며 OIDC 기반 `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_WEBAPP_NAME` 시크릿이 필요합니다. 배포 후 smoke test는 `/api/health`를 호출합니다.

실제 Azure 구독, 스테이징/프로덕션 분리, 배포 슬롯 전략은 아직 확정 전이며 후속 인프라 작업은 [`tasks/todo.md`](tasks/todo.md)에 정리합니다.

## Runtime Notes

- OpenAI API key must never be exposed to the client bundle, browser storage, or logs.
- Current rate limiting uses an HttpOnly per-client session cookie by default and remains in-memory, so it is suitable only for a single runtime instance. Before multi-instance production deployment, move rate-limit state to an external store such as Redis or another shared cache.
- MVP stores user task session state in LocalStorage only; there is no server database yet.
