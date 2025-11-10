# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Event Organizer is a unified web front-end for event organizers covering attendee check-in, stage/hotel coordination, and operational dashboards. It's a PWA-enabled Next.js application designed for both mobile field agents (scanner-first) and desktop staff (management and reporting).

## Commands

### Development

**Note**: The root `package.json` scripts use `bun`, but you can use npm/npx alternatives directly:

#### Using npm (recommended if bun is not available):
```bash
# Development
cd apps/web && npm run dev          # Start Next.js dev server
cd apps/web && npm run build        # Production build
cd apps/web && npm run start        # Start production server

# Code Quality
cd apps/web && npm run lint         # Run ESLint
cd apps/web && npx tsc --noEmit     # Run TypeScript type checking
npm run format                      # Format all code with Prettier (root command)
```

#### Using root scripts (requires bun):
```bash
npm run dev              # Start Next.js dev server (uses bun internally)
npm run build            # Production build (uses bun internally)
npm run start            # Start production server (uses bun internally)
npm run lint             # Run ESLint (uses bun internally)
npm run typecheck        # Run TypeScript type checking (uses bun internally)
npm run format           # Format all code with Prettier
```

### Working with Workspaces
This is an npm workspaces monorepo. To run commands in specific workspaces:
```bash
# Using npm workspaces
npm run <script> --workspace apps/web
npm run <script> --workspace packages/ui
npm run <script> --workspace packages/services
npm run <script> --workspace packages/config

# Or navigate directly (recommended if bun not available)
cd apps/web && npm run <script>
cd packages/ui && npm run <script>
```

### Pre-commit Hooks
The project uses Husky + lint-staged. On commit, code is automatically:
- Linted with ESLint (with auto-fix)
- Formatted with Prettier

## Architecture

### Monorepo Structure
- `apps/web/` - Next.js application (App Router, TypeScript, React 19)
- `packages/ui/` - Shared UI components and design tokens
- `packages/services/` - API clients, storage adapters, utilities
- `packages/config/` - Shared configuration constants

### Path Aliases
TypeScript paths are configured in `tsconfig.base.json`:
- `@event-organizer/ui/*` → `packages/ui/src/*`
- `@event-organizer/config/*` → `packages/config/src/*`
- `@event-organizer/services/*` → `packages/services/src/*`

### Design System & Tokens
The UI system uses **CSS custom properties** for design tokens defined in `packages/ui/src/tokens.ts`. All color, spacing, shadows, radius, and typography values reference CSS variables prefixed with `--eo-*`:
- Colors: `--eo-primary`, `--eo-success`, `--eo-danger`, `--eo-bg`, `--eo-fg`, etc.
- Spacing: `--eo-space-1` through `--eo-space-7`
- Typography: `--eo-text-xs` through `--eo-text-xxl`
- Radius: `--eo-radius-sm/md/lg`
- Shadows: `--eo-shadow-xs/sm/md`

**When styling components**: Always use design tokens via the exported constants or CSS variables, never hardcode colors/spacing.

### PWA Configuration
- Manifest at `apps/web/public/manifest.webmanifest`
- Service worker at `apps/web/public/sw.js`
- PWA providers in `apps/web/src/app/providers/`:
  - `service-worker-provider.tsx` - Registers and manages service worker
  - `pwa-install-prompt.tsx` - Handles install prompt UX
  - `client-providers.tsx` - Wraps all client-side providers

### Technology Stack
- **Framework**: Next.js 15 with App Router, React 19
- **Styling**: Tailwind CSS v4
- **PWA**: Workbox (via workbox-window)
- **State Management**: Planned TanStack Query + Zustand
- **Camera/Scanning**: Planned navigator.mediaDevices + ZXing WASM in Web Worker
- **Storage**: Planned IndexedDB (idb helper) for offline queue
- **Testing**: Planned Vitest + Testing Library + Playwright

### Feature Module Organization
The plan defines these feature modules (to be implemented):
- `features/scanner` - Stage selection, camera workflows, offline queue, manual entry
- `features/events` - Event list, stage assignments, hotel coordination, ticket management
- `features/reports` - Attendance dashboards, export tooling, audit history
- `features/admin` - Role management, settings, localization toggles

## Development Principles

### Mobile-First & Offline Resilience
- Optimize scanner and quick actions for touch devices
- Ensure field operations function without connectivity via cached shell, queuing, and background sync
- Support desktop layouts for management features

### Accessibility
- Follow WCAG AA+ contrast requirements
- Use large tap targets for mobile
- Bilingual-ready copy (id-ID primary, en-US secondary)

### Next.js Configuration
The project uses:
- `reactStrictMode: true`
- `typedRoutes: true` for type-safe routing
- `transpilePackages` for all workspace packages

## Deployment & Environments
- **Dev**: Feature branches with mock/MSW (planned)
- **Staging**: Full backend integration
- **Production**: TBD
- CI/CD via GitHub Actions (planned)
- Deploy previews via Vercel (planned)

## Important Context from Planning Document

### Camera Compatibility
Test on target devices early; include fallbacks (manual entry, external scanners) and guard for browser torch support.

### Offline Sync Strategy
Design deterministic merging rules and backend reconciliation endpoints; surface conflict resolution in UI.

### Module Boundaries
Enforce with lint rules and shared types; regularly review bundle size and lazy-load heavy features.

## Open Questions (from plan.md)
- Backend API contract format (OpenAPI vs. GraphQL) - impacts code generation
- Authentication mechanism (OAuth device login, magic links, hardware tokens)
- Printing requirements (thermal printer models, network vs. Bluetooth)
- Localization tooling for languages beyond Bahasa Indonesia
