# ADR-0004: Foundation Toolchain and Health Contract

Date: 2026-10-01. Status: adopted for issue #1 implementation under the user's implementation instruction. This records engineering choices, not a priority change.

## Context and decision

The first delivery needs reproducible React/Nest development, strict TypeScript contracts, runtime JSON validation and behavior-first integration tests. Prototype code remains exploration evidence.

- Pin Node 24.18.1 / npm 11.16.0 and exact dependencies in npm workspaces with a lockfile. React 19.3.0, Redux Toolkit 2.13.0, NestJS 12.1.2, Vite 8.3.2 and Vitest 5.0.3 were checked against registry engine requirements and actual builds/tests.
- Use ESM for Nest and the shared package. Nest 12's installed declarations required ESM during the first build probe. Compile contracts with TypeScript; a bundler and dual-format output proved unnecessary once actual consumers used ESM.
- Use OpenAPI 3.0.3 as the single HTTP source. Swagger Parser validates the spec; openapi-typescript generates transport types; the same health schema supplies Ajv runtime validation. A check compares regenerated output exactly, independently of Git staging.
- GET /health returns 200 with `{ "status": "ok", "service": "aeki-api" }`. Required properties, enum values and no additional properties are schema-enforced. This means API liveness; database readiness is issue #2.
- Vite proxies same-origin development requests to Nest. RTK Query owns the request/cache with a three-second timeout and no production mock fallback. A network failure and malformed successful response produce distinct UI states.
- Test parser behavior, actual Nest HTTP, and React with real store/providers/client plus MSW network interception. Verify the real browser/API outage and recovery manually. CI and an automated browser suite are separate scope.

## Alternatives and consequences

A Nest-generated Swagger document would introduce a second source beside the spec. Hand-written transport types can drift and do not validate JSON. Runtime validation adds browser bundle weight but enforces the external-data contract. Code generation alone does not prove its semantics; valid and invalid examples are required.

An initial CJS/ESM bundler was replaced with plain TypeScript ESM output. This removes unnecessary build dependencies; consumers must support ESM. npm workspaces suffice for three small packages; Nx/Turborepo is unnecessary orchestration now. Compiled Nest HTTP tests preserve decorator metadata without a special test transform.

Semantic CSS tokens and a typed message contract create narrow replacement seams without implementing theme/locale selectors. No artificial service class or repository abstraction is needed to return liveness.

## Verification and review

Require observed RED/GREEN at approved seams, contract drift checks, standalone application builds, complete checks and independent clean-candidate install. Revisit on breaking contracts, non-ESM consumers, catalog localization, SSR, database readiness or significantly slower/flaky checks.

References: [Nest testing](https://docs.nestjs.com/fundamentals/testing), [RTK Query fetchBaseQuery](https://redux.js.org/toolkit/rtk-query/api/fetchBaseQuery), [Ajv TypeScript validation](https://ajv.js.org/guide/typescript.html).
