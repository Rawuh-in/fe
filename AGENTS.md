# AGENTS.md — Event Organizer

Guidelines for AI coding agents working on this project.

---

## Core Rules

1. **Ask before deciding.** Do not make architectural decisions without human input. If unclear, ask clarifying questions first.
2. **Atomic commits.** Never commit half-done work. Never commit code that doesn't compile/build. Commit when you have a complete, working feature.
3. **Terminal-first debugging.** Use `bun run dev`, `bun run lint`, `bun run typecheck` for debugging. Check terminal logs first.
4. **Keep docs updated.** When making changes, update `TECHNICAL_SPEC.md` or this file as needed.
5. **No orphan TODOs.** If you add a TODO comment, create a corresponding issue or note.
6. **Run lint before committing.** Execute `bun run lint` and `bun run typecheck` to ensure no errors.
7. **DO NOT USE BROWSER TO DEBUG.** Use terminal logs and `bun run dev` to debug.

---

## Project Overview

**Event Organizer** is a monorepo-based event management console for handling guest check-ins, event management, and user administration.

- **Frontend:** Next.js 15 + React 19 + TypeScript + TailwindCSS 4 + TanStack Query
- **Packages:** `@event-organizer/ui`, `@event-organizer/services`, `@event-organizer/config`
- **Runtime:** Bun (workspaces)
- **Docs:** `TECHNICAL_SPEC.md`

See `TECHNICAL_SPEC.md` for full architecture, patterns, and extension recipes.

---

## Architecture Philosophy

1. **Separation of Concerns**
   - UI primitives live in `packages/ui` — no business logic, only presentation
   - API layer lives in `packages/services` — all data fetching, schemas, hooks
   - App config lives in `packages/config` — static constants only
   - Pages in `apps/web/src/app/` — orchestration, not logic

2. **Interface-Driven Design**
   - Define Zod schemas before implementation
   - Types are derived from schemas: `type Event = z.infer<typeof eventSchema>`
   - Props interfaces extend HTML attributes: `ButtonHTMLAttributes<HTMLButtonElement>`

3. **Centralized Data Layer**
   - ALL API calls go through `@event-organizer/services`
   - Never use `fetch()` or `ky` directly in components
   - React Query hooks manage caching, invalidation, loading states

---

## Directory Structure

```
apps/web/src/
├── app/              → Next.js App Router pages (page.tsx, layout.tsx)
│   ├── admin/        → Admin routes (events/, guests/, users/)
│   ├── dashboard/    → Main dashboard
│   ├── landing/      → Public landing page
│   ├── providers/    → Client-side providers ("use client" wrappers)
│   └── hooks/        → App-specific hooks (useAuth.ts)
└── public/           → Static assets

packages/
├── ui/src/           → Shared UI components (button.tsx, badge.tsx)
│   ├── components/   → Component files (lowercase)
│   ├── tokens.ts     → Design token JS exports
│   └── tokens.css    → CSS custom properties (--eo-*)
├── services/src/     → API client, Zod schemas, React Query hooks
└── config/src/       → App configuration constants
```

---

## Coding Standards

### File Naming

| Location                      | Convention           | Example                   |
| ----------------------------- | -------------------- | ------------------------- |
| `packages/ui/src/components/` | lowercase.tsx        | `button.tsx`, `badge.tsx` |
| `apps/web/src/app/*/`         | page.tsx, layout.tsx | `page.tsx`                |
| `apps/web/src/hooks/`         | camelCase.ts         | `useAuth.ts`              |
| `apps/web/src/app/providers/` | kebab-case.tsx       | `query-provider.tsx`      |

### Import Order

```tsx
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. Shared packages (UI)
import { toast } from '@event-organizer/ui/components/toast';

// 3. Shared packages (services)
import { useEvents, type Event } from '@event-organizer/services';

// 4. Local imports
import { useAuth } from '../hooks/useAuth';
```

### Component Pattern

```tsx
'use client'; // Required for interactivity

import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

const baseStyles = '/* tailwind classes using var(--eo-*) */';
const variantStyles = { primary: '...', secondary: '...' } as const;

export type ComponentProps = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variantStyles;
};

export function Component({ className, variant = 'primary', ...props }: ComponentProps) {
  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)} {...props} />
  );
}
```

---

## Critical Invariants

> **DO NOT VIOLATE THESE RULES:**

- [ ] Pages with interactivity MUST have `'use client'` at top
- [ ] ALL API calls go through `@event-organizer/services` hooks
- [ ] CSS tokens use `--eo-` prefix (e.g., `--eo-primary`)
- [ ] Colors in Tailwind use `[color:var(--eo-*)]` — NOT `bg-[var(--eo-*)]`
- [ ] Auth token key is `authToken` in localStorage
- [ ] UI components in `packages/ui` contain NO business logic
- [ ] Zod schemas MUST use `.passthrough()` for backend flexibility
- [ ] Backend returns PascalCase fields (`EventName`, `ID`) — schemas accept both

---

## Common Tasks

### Add a New Page

1. Create `apps/web/src/app/{route}/page.tsx`
2. Add `'use client'` directive
3. Use `useAuth()` hook for auth guard
4. Use hooks from `@event-organizer/services` for data

### Add a New API Integration

1. Add Zod schema in `packages/services/src/index.ts`
2. Add API service object in same file
3. Add React Query hooks in `packages/services/src/hooks.ts`
4. Export new types

### Add a UI Component

1. Create `packages/ui/src/components/{name}.tsx`
2. Use `clsx` for class merging
3. Accept `className` prop, spread rest props
4. Export from `packages/ui/src/index.ts`
5. Add to `package.json` exports

---

## Commands

```bash
# Development
bun run dev         # Start Next.js dev server

# Validation
bun run lint        # Run ESLint
bun run typecheck   # Run TypeScript check

# Build
bun run build       # Production build

# Testing (in packages/services)
cd packages/services
bun run test        # Run vitest
```

---

## Anti-Patterns

| ❌ DON'T                        | ✅ DO                                 |
| ------------------------------- | ------------------------------------- |
| Use `fetch()` directly          | Use `@event-organizer/services` hooks |
| Use inline styles               | Use Tailwind with CSS variables       |
| Store auth in React state       | Use `localStorage` + `useAuth` hook   |
| Use hardcoded colors            | Use `--eo-*` tokens                   |
| Create components in `apps/web` | Add reusable ones to `packages/ui`    |
| Use default exports (non-pages) | Use named exports                     |
