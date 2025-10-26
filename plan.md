# Event Organizer Frontend Plan

## Purpose & Scope
- Deliver a unified web front-end for event organizers covering attendee check-in, stage/hotel coordination, and operational dashboards.
- Start from the `design/pwa-scanner` prototype and grow into a modular production-ready Next.js application with installable PWA capabilities.
- Support both mobile field agents (scanner first) and desktop staff (management and reporting).

## Guiding Principles
- **Mobile-first responsiveness:** optimize scanner and quick actions for touch devices while scaling layouts for tablets/desktop.
- **Offline resilience:** ensure field operations function without connectivity via cached shell, queuing, and background sync.
- **Accessibility & clarity:** follow WCAG AA+ contrast, large tap targets, and bilingual-ready copy.
- **Shared design tokens:** source color, spacing, and typography directly from design artifacts to keep UI consistent.
- **Incremental delivery:** ship value in phases while keeping production code shippable and tested.

## Architecture Overview
- **Framework:** Next.js (App Router) with TypeScript for SSR/ISR support, file-based routing, and easy API proxying.
- **State management:** TanStack Query for server data, Zustand for ephemeral UI/offline queue, both typed with zod schemas.
- **PWA layer:** Workbox-managed service worker for precaching, background sync of check-ins, and runtime caching.
- **Camera & scanning:** React components wrapping `navigator.mediaDevices.getUserMedia`, barcode decoding via ZXing WASM inside a Web Worker, flash/torch toggles when hardware allows.
- **Storage:** IndexedDB (using `idb` helper) for tickets, offline check-in queue, device settings.
- **API integration:** Generated clients from backend OpenAPI spec (openapi-typescript + Ky) with centralized error handling and auth interceptors.
- **UI system:** Tailwind CSS + Radix UI primitives, federated design tokens exported as CSS variables and TypeScript constants.
- **Testing:** Vitest + Testing Library for units, Playwright for E2E device flows, Storybook (Chromatic) for visual regression.

## Feature Modules
- `features/scanner`: stage selection, camera workflows, offline queue status, manual entry.
- `features/events`: event list, stage assignments, hotel coordination, ticket management.
- `features/reports`: attendance dashboards, export tooling, audit history.
- `features/admin`: role management, settings, localization toggles.
- `ui/` design system: buttons, badges, banners, cards, modals, toasts aligned with design tokens.
- `services/`: API clients, storage adapters, analytics, logging hooks.

## Workstreams & Milestones
1. **Foundation (Week 0-2)**
   - Scaffold Next.js app with TypeScript, Tailwind, linting/formatting, Husky + lint-staged.
   - Port design tokens and core components from `prototype/`.
   - Configure Workbox SW, app manifest, and install prompt UX.
2. **Scanner MVP (Week 2-5)**
   - Implement stage selector, camera view, ZXing worker integration, flash toggle, error/offline states.
   - Build offline queue backed by IndexedDB with Background Sync + reconciliation API.
   - Add manual entry flow and hotel variant UI, including thermal print styles.
   - Ship Playwright flows for happy path + offline retry.
3. **Management Dashboards (Week 5-8)**
   - Event/stage management pages with TanStack Query hooks.
   - Real-time updates via WebSockets (Socket.IO/Supabase) for revoked tickets and status.
   - Reporting charts and exports (CSV/PDF).
4. **Hardening & Launch (Week 8-10)**
   - Accessibility audit, cross-device QA (Android/iOS browsers, desktop).
   - Performance tuning (bundle analysis, React Server Components where beneficial).
   - Observability integration (Sentry for errors, PostHog/Amplitude for usage telemetry).

## Tooling & Processes
- **Repo layout:** monorepo-style `apps/web` (Next.js) with `packages/ui`, `packages/config`, `packages/services` to encourage reuse.
- **CI/CD:** GitHub Actions running lint, type-check, tests, Playwright; deploy previews via Vercel.
- **Environments:** Dev (feature branches with mock/MSW), Staging (full backend integration), Production.
- **Coding standards:** Conventional Commits, PR templates, automated code owners for key modules.
- **Documentation:** keep architectural decisions in `docs/adr/`, Storybook for component usage, and checklist-based release notes.

## Risks & Mitigations
- **Camera compatibility:** test on target devices early; include fallbacks (manual entry, external scanners) and guard for browser torch support.
- **Offline sync conflicts:** design deterministic merging rules and backend reconciliation endpoints; surface conflict resolution in UI.
- **Scaling complexity:** enforce module boundaries with lint rules and shared types; regularly review bundle size and lazy-load heavy features.
- **Resource constraints:** prioritize scanner workstream, use feature flags to hide incomplete dashboards, and maintain a backlog with MoSCoW priorities.

## Open Questions
- Confirm backend API timelines and contract format (OpenAPI vs. GraphQL).
- Define authentication mechanism (OAuth device login, magic links, hardware tokens?).
- Clarify printing requirements (thermal printer models, network vs. Bluetooth).
- Establish localization roadmap (languages beyond Bahasa Indonesia, translation tooling).

