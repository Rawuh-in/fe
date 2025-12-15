# Event Organizer - Technical Specification for AI Coding Agents

## 2.1 SYSTEM OVERVIEW

Event Organizer is a monorepo-based event management console built for handling guest check-ins, event management, and user administration. The system provides a PWA-capable admin dashboard that communicates with a backend API via Bearer token authentication.

### Tech Stack (Exact Versions)

| Dependency           | Version   | Location                  |
| -------------------- | --------- | ------------------------- |
| Next.js              | 15.5.2    | `apps/web`                |
| React                | ^19.0.0   | `apps/web`                |
| TailwindCSS          | ^4        | `apps/web`                |
| TypeScript           | ^5        | `apps/web`                |
| TanStack React Query | ^5.90.6   | `apps/web`                |
| Zod                  | ^3.23.8   | `packages/services`       |
| ky (HTTP client)     | ^1.7.2    | `packages/services`       |
| clsx                 | ^2.1.1    | `packages/ui`             |
| sonner (toasts)      | ^2.0.7    | `packages/ui`, `apps/web` |
| vitest               | ^4.0.8    | `packages/services`       |
| Bun                  | (runtime) | monorepo root             |

### Architecture Pattern

**Monorepo with Feature-Based Organization** using Bun workspaces:

- App-level code in `apps/web` (Next.js App Router)
- Shared packages in `packages/*` (ui, services, config)
- Design tokens in `packages/ui/src/tokens.ts` and `tokens.css`

---

## 2.2 FILE STRUCTURE CONVENTIONS

```
/
├── apps/
│   └── web/                          → Next.js 15 application
│       ├── src/
│       │   ├── app/                  → App Router pages (page.tsx, layout.tsx)
│       │   │   ├── admin/            → Admin routes (events/, guests/, users/)
│       │   │   ├── dashboard/        → Main dashboard
│       │   │   ├── landing/          → Public landing page
│       │   │   ├── providers/        → Client-side providers (kebab-case .tsx)
│       │   │   ├── login/            → Auth pages
│       │   │   ├── checkin/          → Feature pages
│       │   │   └── api/              → API routes
│       │   └── hooks/                → App-specific hooks (camelCase: useAuth.ts)
│       ├── public/                   → Static assets
│       │   └── assets/               → Landing page assets
│       └── next.config.mjs           → Next.js configuration
│
├── packages/
│   ├── ui/                           → Shared UI components
│   │   └── src/
│   │       ├── components/           → Component files (lowercase: button.tsx)
│   │       ├── tokens.ts             → JS design token exports
│   │       ├── tokens.css            → CSS custom properties
│   │       └── index.ts              → Barrel export
│   │
│   ├── services/                     → API layer & React Query hooks
│   │   └── src/
│   │       ├── index.ts              → API client, schemas, services (single file)
│   │       └── hooks.ts              → TanStack Query hooks
│   │
│   └── config/                       → Shared configuration
│       └── src/
│           └── index.ts              → App config constants
│
└── tsconfig.base.json               → Shared TypeScript config
```

### Directory Rules

| Directory                     | Belongs Here                                        | Does NOT Belong Here              |
| ----------------------------- | --------------------------------------------------- | --------------------------------- |
| `apps/web/src/app/`           | Page components (`page.tsx`), layouts, route groups | Non-route components, utilities   |
| `apps/web/src/hooks/`         | App-specific hooks (e.g., `useAuth.ts`)             | Shared hooks (→ services package) |
| `apps/web/src/app/providers/` | Client providers (`"use client"` wrappers)          | Server components                 |
| `packages/ui/src/components/` | Reusable UI primitives (Button, Badge)              | Business logic, API calls         |
| `packages/services/src/`      | API clients, Zod schemas, React Query hooks         | UI components, styles             |
| `packages/config/src/`        | Static configuration (app name, locales)            | Runtime logic                     |

---

## 2.3 COMPONENT PATTERNS

### UI Component Template (`packages/ui/src/components/`)

```tsx
// 1. External imports first
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

// 2. Base styles (CSS variable references)
const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[var(--eo-radius-md)] px-5 py-3';

// 3. Variant styles as const object
const variantStyles = {
  primary:
    'bg-[color:var(--eo-primary)] text-[color:var(--eo-primary-contrast)] shadow-[var(--eo-shadow-sm)] hover:bg-[color-mix(in_srgb,var(--eo-primary)_90%,#000)]',
  secondary: 'border border-[color:var(--eo-muted)] bg-[color:var(--eo-bg-elevated)]',
  // ...
} as const;

// 4. Size styles
const sizeStyles = {
  md: 'text-base min-h-[44px]',
  lg: 'text-lg min-h-[56px] px-6',
} as const;

// 5. Type exports derived from const objects
export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

// 6. Props interface extending HTML attributes
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// 7. forwardRef component with default props
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  )
);

// 8. Display name for DevTools
Button.displayName = 'Button';
```

### Page Component Template (`apps/web/src/app/*/page.tsx`)

```tsx
'use client'; // Required for client-side interactivity

import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@event-organizer/ui/components/toast';
import { useEvents, useCreateEvent, type Event } from '@event-organizer/services';
import { useAuth } from '../hooks/useAuth'; // Relative for app-local hooks

export default function EventsPage() {
  // 1. Auth check
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 2. Data fetching via React Query hooks
  const { data, isLoading, error } = useEvents({ sort: 'created_at', dir: 'desc' });
  const createEvent = useCreateEvent();

  // 3. Local state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ EventName: '', Description: '' });

  // 4. Loading/auth guards
  if (authLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return null; // useAuth redirects to /login
  }

  // 5. Event handlers
  const handleCreate = async () => {
    try {
      await createEvent.mutateAsync({ eventName: formData.EventName });
      toast.success('Event created successfully');
    } catch (err) {
      toast.error('Failed to create event');
    }
  };

  // 6. Render
  return <div className="min-h-screen bg-gray-50">{/* Nav + Content */}</div>;
}
```

### Props Conventions

| Pattern          | Convention                              | Example                                   |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| Props typing     | Separate type/interface above component | `export type ButtonProps = {...}`         |
| Interface naming | `{ComponentName}Props`                  | `ButtonProps`, `BadgeProps`               |
| Callback props   | `on{Action}` (standard HTML convention) | `onClick`, `onChange`                     |
| Optional props   | Default in destructuring                | `variant = "primary"`                     |
| Children         | Via `ReactNode` from `HTMLAttributes`   | Inherited from `ButtonHTMLAttributes`     |
| className        | Always accept, merge with `clsx()`      | `className={clsx(baseStyles, className)}` |

### State Management

**Local State:**

- `useState` for form state, UI toggles
- Pattern: `const [value, setValue] = useState(initialValue)`

**Server State (React Query):**

- All API data uses `@tanstack/react-query` via `packages/services`
- Queries: `useEvents()`, `useGuests(eventId)`, `useUsers()`
- Mutations: `useCreateEvent()`, `useUpdateGuest()`, `useDeleteUser()`
- Cache invalidation on mutation success via `queryClient.invalidateQueries()`

**Global State:**

- Auth token in `localStorage` (no state management library)
- No Redux/Zustand/Jotai in current codebase

### Styling

| Aspect          | Convention                                                        |
| --------------- | ----------------------------------------------------------------- |
| System          | TailwindCSS 4 with CSS custom properties                          |
| Token format    | `--eo-{category}-{name}` (e.g., `--eo-primary`, `--eo-radius-md`) |
| Token reference | `var(--eo-{token})` in Tailwind arbitrary values                  |
| Color usage     | `bg-[color:var(--eo-primary)]`, `text-[color:var(--eo-fg)]`       |
| Class merging   | `clsx()` from `clsx` package                                      |
| Dark mode       | Via `[data-theme="dark"]` selector (tokens.css)                   |
| Responsive      | Standard Tailwind breakpoints (`sm:`, `md:`, `lg:`)               |

---

## 2.4 IMPORT/EXPORT CONVENTIONS

### Path Aliases

| Alias                         | Resolves To               | Source                   |
| ----------------------------- | ------------------------- | ------------------------ |
| `@event-organizer/ui/*`       | `packages/ui/src/*`       | `tsconfig.base.json`     |
| `@event-organizer/config/*`   | `packages/config/src/*`   | `tsconfig.base.json`     |
| `@event-organizer/services/*` | `packages/services/src/*` | `tsconfig.base.json`     |
| `@/*`                         | `apps/web/src/*`          | `apps/web/tsconfig.json` |

### Import Order Convention

```tsx
// 1. React/Next.js framework imports
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Shared package imports (UI components)
import { toast } from '@event-organizer/ui/components/toast';

// 3. Shared package imports (services/hooks)
import { useEvents, useCreateEvent, type Event } from '@event-organizer/services';

// 4. App-local imports
import { useAuth } from '../hooks/useAuth';
```

### Barrel File Usage

| Package                     | Pattern                                        |
| --------------------------- | ---------------------------------------------- |
| `@event-organizer/ui`       | Yes - `index.ts` exports components and tokens |
| `@event-organizer/services` | Yes - `index.ts` + re-exports `hooks.ts`       |
| `@event-organizer/config`   | Minimal - single `index.ts`                    |

**UI Package Exports (`packages/ui/package.json`):**

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./tokens": "./src/tokens.ts",
    "./tokens.css": "./src/tokens.css",
    "./components/button": "./src/components/button.tsx",
    "./components/badge": "./src/components/badge.tsx",
    "./components/toast": "./src/components/toast.tsx"
  }
}
```

**Import patterns:**

- For barrel: `import { Button, Badge } from '@event-organizer/ui'`
- For direct: `import { toast } from '@event-organizer/ui/components/toast'`

---

## 2.5 DATA FLOW PATTERNS

### API Layer Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ apps/web/src/app/**/page.tsx                                      │
│   └── Uses hooks: useEvents(), useGuests(), useMutation()        │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ packages/services/src/hooks.ts                                    │
│   └── TanStack Query wrappers: useQuery + useMutation            │
│   └── Query key management: queryKeys.events.list(params)        │
│   └── Cache invalidation: queryClient.invalidateQueries()        │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ packages/services/src/index.ts                                    │
│   └── API services: eventApi.list(), guestApi.create()           │
│   └── Zod schemas: guestSchema, eventSchema (with passthrough)   │
│   └── ky instance with auth interceptor                          │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend API (external)                                            │
│   └── Base URL: process.env.NEXT_PUBLIC_API_BASE_URL             │
│   └── Auth: Bearer token from localStorage                        │
└──────────────────────────────────────────────────────────────────┘
```

### Query Key Structure

```typescript
export const queryKeys = {
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (params?: ListQueryParams) => [...queryKeys.events.lists(), params] as const,
  },
  guests: {
    all: ['guests'] as const,
    lists: () => [...queryKeys.guests.all, 'list'] as const,
    list: (eventId?: number, params?: ListQueryParams) =>
      [...queryKeys.guests.lists(), eventId, params] as const,
  },
};
```

### Mutation Pattern

```typescript
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}
```

---

## 2.6 ERROR HANDLING PATTERNS

### Automatic 401 Unauthorized Handling

The `apiClient` in `packages/services/src/index.ts` automatically handles expired or invalid auth tokens:

- When any API call returns **401 Unauthorized**, the client:
  1. Clears the invalid token from `localStorage`
  2. Redirects the user to `/login`

This is implemented via ky's `afterResponse` hook and runs globally for all API calls.

### API Error Handling

```typescript
// In page component
const handleCreate = async () => {
  try {
    await createEvent.mutateAsync({ eventName: formData.EventName });
    toast.success('Event created successfully');
    resetForm();
  } catch (err) {
    console.error('Create error:', err);
    toast.error('Failed to create event. Please try again.');
  }
};
```

### Query Error Display

```tsx
{
  error && (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load events. Check API configuration and auth token.
      <br />
      <small className="text-xs">Error: {error.message}</small>
    </div>
  );
}
```

### Form Validation

```typescript
// Simple inline validation (no validation library)
const handleSubmit = async () => {
  if (!formData.EventName.trim()) {
    toast.error('Event name is required');
    return;
  }
  // ...
};
```

### Toast Notifications (via sonner)

```typescript
import { toast } from '@event-organizer/ui/components/toast';

toast.success('Action completed');
toast.error('Something went wrong');
```

---

## 2.7 CRITICAL INVARIANTS & CONSTRAINTS

> **CAUTION:** Violating these rules will cause runtime errors or broken functionality.

- [ ] **NEVER import API functions directly from `packages/services/src/index.ts`** - Use the exported hooks from `@event-organizer/services` instead
- [ ] **ALL pages with interactivity MUST have `'use client'`** at the top
- [ ] **ALL API calls MUST go through `@event-organizer/services`** - Never use `fetch` or `ky` directly in components
- [ ] **CSS tokens MUST use `--eo-` prefix** - Defined in `packages/ui/src/tokens.css`
- [ ] **Color values in Tailwind MUST use `[color:var(--eo-*)]` syntax** - Not `bg-[var(--eo-*)]`
- [ ] **Auth token stored in localStorage key `authToken`** - Used by API interceptor
- [ ] **401 responses trigger automatic redirect to `/login`** - Token is cleared and user redirected
- [ ] **Landing page auth links check token first** - Navigate to `/dashboard` if logged in, `/login` if not
- [ ] **Components in `packages/ui` MUST NOT contain business logic** - Only presentation
- [ ] **Zod schemas use `.passthrough()`** - Backend may return additional fields

> **IMPORTANT:** The backend returns fields in PascalCase (`EventName`, `ID`) not camelCase. Schemas accept both conventions.

---

## 2.8 EXTENSION RECIPES

### Adding a New Page/Route

1. Create directory: `apps/web/src/app/{route-name}/`
2. Create file: `apps/web/src/app/{route-name}/page.tsx`

```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function NewPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🎉 Event Organizer
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{/* Content */}</main>
    </div>
  );
}
```

---

### Adding a New API Endpoint Integration

1. **Add schema and types** in `packages/services/src/index.ts`:

```typescript
export const newEntitySchema = z
  .object({
    ID: z.number().optional(),
    Name: z.string().optional(),
  })
  .passthrough();

export type NewEntity = z.infer<typeof newEntitySchema>;

export interface CreateNewEntityRequest {
  name: string;
}
```

2. **Add API service** in `packages/services/src/index.ts`:

```typescript
export const newEntityApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<NewEntity>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return apiClient.get(`${PROJECT_ID}/new-entities?${searchParams}`).json();
  },
  create: async (data: CreateNewEntityRequest): Promise<ApiResponse<NewEntity>> => {
    return apiClient.post(`${PROJECT_ID}/new-entities`, { json: data }).json();
  },
};
```

3. **Add React Query hooks** in `packages/services/src/hooks.ts`:

```typescript
// Add query key
export const queryKeys = {
  // ... existing
  newEntities: {
    all: ['newEntities'] as const,
    lists: () => [...queryKeys.newEntities.all, 'list'] as const,
    list: (params?: ListQueryParams) =>
      [...queryKeys.newEntities.lists(), params] as const,
  },
};

// Add hooks
export function useNewEntities(params?: ListQueryParams) {
  return useQuery<ApiListResponse<NewEntity>>({
    queryKey: queryKeys.newEntities.list(params),
    queryFn: () => newEntityApi.list(params),
  });
}

export function useCreateNewEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNewEntityRequest) => newEntityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newEntities.lists() });
    },
  });
}
```

---

### Adding a New Reusable UI Component

1. Create file: `packages/ui/src/components/{component-name}.tsx`

```tsx
import clsx from 'clsx';
import type { HTMLAttributes, JSX } from 'react';

const baseStyles = '/* base classes */';

const variantStyles = {
  default: '/* variant classes */',
  primary: '/* variant classes */',
} as const;

export type NewComponentVariant = keyof typeof variantStyles;

export type NewComponentProps = HTMLAttributes<HTMLDivElement> & {
  variant?: NewComponentVariant;
};

export function NewComponent({
  className,
  variant = 'default',
  ...props
}: NewComponentProps): JSX.Element {
  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)} {...props} />
  );
}
```

2. Add export to `packages/ui/src/index.ts`:

```typescript
export * from './components/new-component';
```

3. Add to `packages/ui/package.json` exports:

```json
{
  "exports": {
    "./components/new-component": "./src/components/new-component.tsx"
  }
}
```

---

## 2.9 TESTING PATTERNS

### Test File Location

| Package             | Test Location   | Naming                     |
| ------------------- | --------------- | -------------------------- |
| `packages/services` | `src/*.test.ts` | `*.test.ts` or `*.spec.ts` |

### Testing Framework & Config

- **Framework:** Vitest 4.x
- **Environment:** Node
- **Config:** `packages/services/vitest.config.ts`

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 15000,
  },
});
```

### Running Tests

```bash
cd packages/services
bun run test        # Single run
bun run test:watch  # Watch mode
bun run test:ui     # Vitest UI
```

---

## 2.10 DEPENDENCIES CONTEXT

### ky (HTTP Client)

- **Location:** `packages/services/src/index.ts`
- **Pattern:** Wrapped in `apiClient` with auth interceptor
- **Usage:** Never import `ky` directly in app code

```typescript
// CORRECT
import { eventApi } from '@event-organizer/services';
await eventApi.list();

// INCORRECT - Don't do this
import ky from 'ky';
await ky.get('/api/events').json();
```

### TanStack Query

- **Provider:** `apps/web/src/app/providers/query-provider.tsx`
- **Default staleTime:** 60 seconds
- **Default gcTime:** 5 minutes
- **Usage:** Always via exported hooks from `@event-organizer/services`

### Zod

- **Pattern:** Schemas use `.passthrough()` to accept extra fields
- **Both naming conventions:** Schemas accept `ID`/`id`, `EventName`/`eventName`
- **Usage:** Runtime validation happens in services layer

### sonner (Toast Library)

- **Provider:** Already in `ClientProviders`
- **Import:** `import { toast } from '@event-organizer/ui/components/toast'`
- **Methods:** `toast.success()`, `toast.error()`, `toast.info()`

---

## Anti-Patterns

> **WARNING:** Avoid these patterns that conflict with codebase conventions.

| DON'T                                        | DO                                      | Rationale                     |
| -------------------------------------------- | --------------------------------------- | ----------------------------- |
| Use inline styles                            | Use Tailwind classes with CSS variables | Consistent theming            |
| Create local API fetch calls                 | Use `@event-organizer/services` hooks   | Centralized cache management  |
| Use `fetch()` directly                       | Use API service functions               | Auth interceptor won't apply  |
| Store auth state in React                    | Use `localStorage` + `useAuth` hook     | SSR compatibility             |
| Use hardcoded colors                         | Use `--eo-*` tokens                     | Theme support                 |
| Add components to `apps/web/src/components/` | Add to `packages/ui` if reusable        | No such directory exists      |
| Use default export for non-pages             | Use named exports                       | Consistency with barrel files |
