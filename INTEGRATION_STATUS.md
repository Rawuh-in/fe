# Backend API Integration Status

**Last Updated:** 2025-11-05
**Backend:** https://be-service-0f01851c6cbd.herokuapp.com
**Auth Status:** ⚠️ PENDING (403 Access Denied - needs resolution)

---

## 📊 Overall Progress: 57% Complete (4/7 pages)

| Page | Status | Completion | Notes |
|------|--------|------------|-------|
| **Events** | ✅ DONE | 100% | Full CRUD, Hotels/Rooms in Options |
| **Users** | ✅ DONE | 100% | Staff accounts, UserType badges |
| **Guests** | ✅ DONE | 100% | Full CRUD, event selector, custom Options |
| **Dashboard** | ✅ DONE | 100% | Real stats, recent events list |
| **Check-in** | ⏳ TODO | 0% | Needs guest lookup + Options.CheckedInAt |
| **Assignments** | ⏳ TODO | 0% | View-only of Guest Options |
| **QR Management** | ⏳ TODO | 0% | Real QR generation with qrcode library |

---

## ✅ Completed Integrations (4/7)

### 1. Events Page (`/admin/events`)
**File:** `apps/web/src/app/admin/events/page.tsx`

**Features:**
- Full CRUD: Create, Read, Update, Delete
- Hotels and Rooms stored in `Event.Options` JSON field
- Loading/error states, pagination info
- Backend endpoints:
  - `GET /1/events/list` - List all events
  - `POST /1/events` - Create event
  - `PUT /1/events/:id` - Update event
  - `DELETE /1/events/:id` - Delete event

**Data Structure:**
```typescript
Event {
  ID: number
  EventName: string
  Description: string
  Options: string // JSON: {Hotels: string[], Rooms: string[]}
  CreatedAt: string
  UpdatedAt: string
}
```

---

### 2. Users Page (`/admin/users`)
**File:** `apps/web/src/app/admin/users/page.tsx`

**Features:**
- List all staff users (SYSTEM_ADMIN, PROJECT_USER)
- Create new staff accounts
- Color-coded UserType badges
- Backend endpoints:
  - `GET /users/list` - List all users
  - `POST /users` - Create user

**Data Structure:**
```typescript
User {
  ID: number
  Name: string
  Username: string
  Email: string
  UserType: "SYSTEM_ADMIN" | "PROJECT_USER"
  ProjectID: number
  CreatedAt: string
}
```

**Important:** Backend User = Staff account (NOT event guests!)

---

### 3. Guests Page (`/admin/participants`)
**File:** `apps/web/src/app/admin/participants/page.tsx`

**Features:**
- Event selector dropdown
- Full CRUD for event guests
- Custom data in Options JSON (dietary, VIP status, etc.)
- Backend endpoints:
  - `GET /1/events/:eventId/guests/list` - List guests
  - `POST /1/events/:eventId/guests` - Create guest
  - `PUT /1/events/:eventId/guests/:id` - Update guest
  - `DELETE /1/events/:eventId/guests/:id` - Delete guest

**Data Structure:**
```typescript
Guest {
  ID: number
  EventId: number
  Name: string
  Email: string
  Phone: string
  Address: string
  Options: string // JSON: {Hotel?, Room?, CheckedInAt?, ...custom}
  CreatedAt: string
}
```

---

### 4. Dashboard (`/`)
**File:** `apps/web/src/app/page.tsx`

**Features:**
- Real-time statistics (Events count, Users count)
- Recent events list (last 10)
- Quick action cards to all features
- Loading states

**Statistics:**
- Events: `eventsData.Pagination.TotalData`
- Staff Users: `usersData.Pagination.TotalData`
- Guests: Placeholder (needs aggregation)
- Assignments: Placeholder (in Guest Options)

---

## ⏳ Pending Integrations (3/7)

### 5. Check-in Station (`/checkin`)
**File:** `apps/web/src/app/checkin/page.tsx`
**Status:** Not started

**Requirements:**
1. Guest lookup by QR code (guestId)
2. Update `Guest.Options.CheckedInAt` on check-in
3. Real-time guest list with check-in status
4. Event filtering

**Implementation Plan:**
```typescript
// Check-in flow:
1. Scan QR → extract guestId
2. GET /1/events/:eventId/guests/:guestId
3. Parse Options, add: CheckedInAt: new Date().toISOString()
4. PUT /1/events/:eventId/guests/:guestId with updated Options
```

---

### 6. Assignments Page (`/admin/assignments`)
**File:** `apps/web/src/app/admin/assignments/page.tsx`
**Status:** Not started

**Requirements:**
- Display Guest Options as assignment view
- Show Hotel, Room, CheckInDate, CheckOutDate
- Status tracking via `CheckedInAt` field

**Data Mapping:**
```typescript
// Instead of separate Assignment entity:
Guest.Options = {
  Hotel: "Hotel A",
  Room: "101",
  CheckInDate: "2025-01-15",
  CheckOutDate: "2025-01-17",
  CheckedInAt: "2025-01-15T08:30:00Z" // If checked in
}
```

---

### 7. QR Management Page (`/qr`)
**File:** `apps/web/src/app/qr/page.tsx`
**Status:** Not started (qrcode library installed)

**Requirements:**
- Generate real QR codes using `qrcode` npm package
- QR data format: `{guestId: number}`
- Bulk generation for all event guests
- Download as PNG/PDF

**Implementation:**
```typescript
import QRCode from 'qrcode';

const qrData = JSON.stringify({ guestId: guest.ID });
const qrImageUrl = await QRCode.toDataURL(qrData);
```

---

## 🚨 **CRITICAL: Auth Issue**

**Problem:** All API requests return `403 Access Denied`

**Tests Performed:**
```bash
# Login with Basic Auth
curl -u "sysadmin_sulthan:sulthanadmin" \
  https://be-service-0f01851c6cbd.herokuapp.com/login
→ 403 Access denied

# Events endpoint
curl https://be-service-0f01851c6cbd.herokuapp.com/1/events/list
→ 403 Access denied
```

**Possible Causes:**
1. IP whitelisting on Heroku backend
2. Proxy/firewall blocking requests
3. Backend configuration issue
4. Missing CORS headers

**Current Workaround:**
Frontend is configured to accept auth token via:
- `.env.local`: `VITE_AUTH_TOKEN=<token>`
- Or localStorage after successful login

---

## 🛠️ Configuration Files

### Environment Setup
**File:** `.env.local` (not in git)
```bash
VITE_API_BASE_URL=https://be-service-0f01851c6cbd.herokuapp.com
VITE_AUTH_TOKEN=  # Needs valid token after auth is fixed
```

### API Client
**File:** `packages/services/src/index.ts`
- All endpoints configured
- Auto-injects Bearer token
- Zod schemas for validation
- Helper functions for JSON Options parsing

### TanStack Query Hooks
**File:** `packages/services/src/hooks.ts`
- `useEvents`, `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent`
- `useGuests`, `useCreateGuest`, `useUpdateGuest`, `useDeleteGuest`
- `useUsers`, `useCreateUser`
- `useCurrentUser`, `useLogin`, `useLogout`

---

## 📝 Next Steps

### Immediate (Required for Testing)
1. **Resolve Authentication Issue**
   - Check Heroku backend logs
   - Verify IP whitelisting
   - Or provide valid Bearer token for testing

### Short-term (Complete Integration)
2. **Integrate Check-in Station**
   - Guest QR lookup
   - Update Options.CheckedInAt field

3. **Integrate Assignments Page**
   - Read-only view of Guest Options
   - Filter by Hotel/Room

4. **Integrate QR Management**
   - Real QR code generation
   - Bulk download feature

### Long-term (Production Ready)
5. **Add Full Authentication Flow**
   - Login page with form
   - Token refresh logic
   - Session management
   - Logout functionality

6. **Add Offline Queue**
   - IndexedDB for pending check-ins
   - Background Sync API
   - Conflict resolution

7. **Testing & Monitoring**
   - Unit tests (Vitest)
   - E2E tests (Playwright)
   - Error tracking (Sentry)

---

## 🎯 Testing Checklist (Once Auth Works)

### Events Page
- [ ] Load events list
- [ ] Create new event with hotels/rooms
- [ ] Edit event
- [ ] Delete event
- [ ] Verify Options JSON parsing

### Users Page
- [ ] Load users list
- [ ] Create SYSTEM_ADMIN user
- [ ] Create PROJECT_USER user
- [ ] Verify UserType badges

### Guests Page
- [ ] Switch between events
- [ ] Create guest with custom Options
- [ ] Edit guest
- [ ] Delete guest
- [ ] Verify Options JSON parsing

### Dashboard
- [ ] Verify event count matches
- [ ] Verify user count matches
- [ ] Recent events list displays
- [ ] Quick action links work

---

## 📁 File Structure

```
/home/user/fe/
├── .env.local (not in git)
├── .env.example
├── packages/
│   └── services/
│       └── src/
│           ├── index.ts (API client + types)
│           └── hooks.ts (TanStack Query hooks)
├── apps/
│   └── web/
│       └── src/
│           └── app/
│               ├── page.tsx (Dashboard ✅)
│               ├── admin/
│               │   ├── events/page.tsx (✅)
│               │   ├── users/page.tsx (✅)
│               │   ├── participants/page.tsx (✅)
│               │   └── assignments/page.tsx (⏳)
│               ├── checkin/page.tsx (⏳)
│               └── qr/page.tsx (⏳)
└── INTEGRATION_STATUS.md (this file)
```

---

## 🤝 Collaboration Notes

**For Backend Team:**
- Please verify Heroku backend accessibility
- Check if IP whitelisting is enabled
- Confirm login endpoint accepts Basic Auth
- Provide valid test credentials if different

**For Frontend Team:**
- Once auth works, test all 4 integrated pages
- Complete remaining 3 pages (Check-in, Assignments, QR)
- Add comprehensive error handling
- Implement loading skeletons

---

**Contact:** Ready to continue once authentication is resolved! 🚀
