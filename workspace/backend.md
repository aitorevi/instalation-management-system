# Backend Implementation Plan - Push Notifications

## Overview

This document defines the backend architecture for push notifications in the IMS project. Based on user requirements, notifications will be triggered when an admin assigns an installer to an installation. The solution uses Astro API Routes (not Supabase Edge Functions), VAPID keys for Web Push, and PostgreSQL for storing subscriptions.

**Key Decisions:**

- **Backend**: Astro API Routes (`/api/push/*`)
- **Database**: PostgreSQL table `push_subscriptions` with RLS
- **Push Protocol**: Web Push API with VAPID authentication
- **Multi-device**: Supported (one user can have multiple subscriptions)
- **Triggering**: Automatic on installer assignment (create/update installation)
- **Error Handling**: Log errors only (don't auto-delete invalid subscriptions)

---

## 1. Database Schema

### 1.1. Create `push_subscriptions` Table

**File**: Execute in Supabase SQL Editor

**Task**: Create table for storing push notification subscriptions

**SQL**:

```sql
-- Table for storing push notification subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A user can have multiple devices (different endpoints)
    UNIQUE(user_id, endpoint)
);

-- Index for faster lookups by user
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE push_subscriptions IS 'Stores Web Push API subscriptions for each user device';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Public key for encryption (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Authentication secret (base64 encoded)';
```

**Acceptance Criteria**:

- [x] Table created successfully in Supabase
- [x] Unique constraint prevents duplicate subscriptions for same user/endpoint
- [x] Index created on `user_id` column
- [x] Cascade delete when user is deleted

**Time Estimate**: 30 minutes

---

### 1.2. Configure Row Level Security (RLS)

**File**: Execute in Supabase SQL Editor (after 1.1)

**Task**: Define RLS policies for push_subscriptions table

**SQL**:

```sql
-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can manage their own subscriptions
CREATE POLICY "users_manage_own_subscriptions"
ON push_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Allow server-side operations via service role
-- (No explicit policy needed - service role bypasses RLS)

COMMENT ON POLICY "users_manage_own_subscriptions" ON push_subscriptions
IS 'Users can insert, read, update, and delete their own push subscriptions';
```

**Acceptance Criteria**:

- [x] RLS enabled on `push_subscriptions`
- [x] Users can only access their own subscriptions
- [x] Server-side code (API routes) can access all subscriptions using service role
- [x] Test with different user contexts in SQL editor

**Time Estimate**: 20 minutes

---

### 1.3. Regenerate TypeScript Types

**File**: Terminal command

**Task**: Regenerate TypeScript types to include `push_subscriptions`

**Command**:

```bash
cd /Users/aitorevi/Dev/instalation-management-system
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
```

**Acceptance Criteria**:

- [x] `src/types/database.ts` updated
- [x] File includes `push_subscriptions` table definition
- [x] No TypeScript errors in project after regeneration
- [x] Type exports include `PushSubscription` row/insert/update types

**Time Estimate**: 10 minutes

---

### 1.4. Update Supabase Type Exports

**File**: `src/lib/supabase.ts`

**Task**: Add type exports for push_subscriptions

**Changes**:

```typescript
// Add after existing type exports
export type PushSubscription = Tables['push_subscriptions']['Row'];
export type PushSubscriptionInsert = Tables['push_subscriptions']['Insert'];
export type PushSubscriptionUpdate = Tables['push_subscriptions']['Update'];
```

**Acceptance Criteria**:

- [x] New types exported from `src/lib/supabase.ts`
- [x] Types can be imported in other files
- [x] TypeScript compilation succeeds

**Time Estimate**: 10 minutes

---

## 2. VAPID Keys Generation

### 2.1. Generate VAPID Keys

**File**: Terminal command + `.env` file

**Task**: Generate VAPID key pair for Web Push authentication

**Commands**:

```bash
cd /Users/aitorevi/Dev/instalation-management-system
npm install web-push --save-dev
npx web-push generate-vapid-keys
```

**Expected Output**:

```
=======================================
Public Key:
BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
=======================================
```

**Acceptance Criteria**:

- [ ] VAPID public and private keys generated
- [ ] Keys are base64-encoded strings
- [ ] Public key starts with "BN" (uncompressed point format)

**Time Estimate**: 10 minutes

---

### 2.2. Store VAPID Keys in Environment Variables

**File**: `.env`

**Task**: Add VAPID keys to environment variables

**Changes**:

```env
# Push Notifications (Web Push API)
PUBLIC_VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

**Notes**:

- `PUBLIC_VAPID_PUBLIC_KEY` must start with `PUBLIC_` (accessible in browser)
- `VAPID_PRIVATE_KEY` is server-side only (NO `PUBLIC_` prefix)
- `VAPID_SUBJECT` should be a valid `mailto:` or `https://` URL

**Acceptance Criteria**:

- [ ] All three environment variables added to `.env`
- [ ] `PUBLIC_VAPID_PUBLIC_KEY` accessible via `import.meta.env.PUBLIC_VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY` only accessible server-side
- [ ] Variables also added to `.env.example` (with placeholder values)

**Time Estimate**: 10 minutes

---

## 3. Server-Side Utilities

### 3.1. Add web-push Dependency

**File**: `package.json`

**Task**: Install web-push library

**Command**:

```bash
cd /Users/aitorevi/Dev/instalation-management-system
npm install web-push
npm install --save-dev @types/web-push
```

**Acceptance Criteria**:

- [ ] `web-push` added to dependencies
- [ ] `@types/web-push` added to devDependencies
- [ ] `package-lock.json` updated
- [ ] TypeScript recognizes web-push types

**Time Estimate**: 10 minutes

---

### 3.2. Add Service Role Key Environment Variable

**File**: `.env`

**Task**: Add Supabase service role key for server-side operations

**Changes**:

```env
# Supabase Service Role (server-side only, bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note**: Get this from Supabase Dashboard > Settings > API > `service_role` key (SECRET)

**Acceptance Criteria**:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to `.env`
- [ ] Variable NOT prefixed with `PUBLIC_` (server-side only)
- [ ] Also added to `.env.example` with placeholder

**Time Estimate**: 10 minutes

---

### 3.3. Create Push Notification Server Utility

**File**: `src/lib/push-server.ts`

**Task**: Create server-side utility for sending push notifications using web-push

**Acceptance Criteria**:

- [x] File created at `src/lib/push-server.ts`
- [x] Function `sendPushNotification` exports correctly
- [x] Uses Supabase service role to fetch subscriptions (bypasses RLS)
- [x] Sends to all devices for a given user
- [x] Logs errors but doesn't delete invalid subscriptions
- [x] Returns detailed result object with success/failure counts
- [x] TypeScript compiles without errors

**Time Estimate**: 1 hour

---

## 4. API Routes

### 4.1. Create Subscribe API Route

**File**: `src/pages/api/push/subscribe.ts`

**Task**: API endpoint to save push subscription to database

**Acceptance Criteria**:

- [x] File created at `src/pages/api/push/subscribe.ts`
- [x] Endpoint accessible at `/api/push/subscribe`
- [x] Requires authentication (checks `sb-access-token` cookie)
- [x] Validates subscription data structure
- [x] Uses authenticated Supabase client (respects RLS)
- [x] Upserts subscription (handles duplicates)
- [x] Returns proper HTTP status codes
- [x] Logs errors to console

**Time Estimate**: 1 hour

---

### 4.2. Create Unsubscribe API Route

**File**: `src/pages/api/push/unsubscribe.ts`

**Task**: API endpoint to remove push subscription from database

**Acceptance Criteria**:

- [x] File created at `src/pages/api/push/unsubscribe.ts`
- [x] Endpoint accessible at `/api/push/unsubscribe`
- [x] Requires authentication
- [x] Validates endpoint parameter
- [x] Uses authenticated Supabase client (respects RLS)
- [x] Deletes only the specified endpoint for current user
- [x] Returns proper HTTP status codes
- [x] Logs errors to console

**Time Estimate**: 45 minutes

---

## 5. Client-Side Utilities

### 5.1. Create Client Push Utility

**File**: `src/lib/push.ts`

**Task**: Client-side utilities for managing push notifications in browser

**Acceptance Criteria**:

- [x] File created at `src/lib/push.ts`
- [x] All functions export correctly
- [x] Browser API checks work correctly
- [x] VAPID key conversion function works
- [x] TypeScript types are correct
- [x] Functions handle errors gracefully
- [x] Console logging for debugging

**Time Estimate**: 1.5 hours

---

## 6. Integration with Installation Actions

### 6.1. Modify Installation Actions to Trigger Notifications

**File**: `src/lib/actions/installations.ts`

**Task**: Integrate push notifications when installer is assigned

**Acceptance Criteria**:

- [x] `sendPushNotification` imported correctly
- [x] `createInstallation` sends notification when `installer_id` is set
- [x] `updateInstallation` sends notification only when installer changes
- [x] Notifications don't block the request (errors are logged but ignored)
- [x] Notification contains installation name and deep link
- [x] TypeScript compiles without errors

**Time Estimate**: 1 hour

---

## 7. Testing

### 7.1. Unit Tests for push.ts

**File**: `src/lib/push.test.ts`

**Task**: Test client-side push utility functions

**Acceptance Criteria**:

- [ ] File created at `src/lib/push.test.ts`
- [ ] Tests for `isPushSupported` function
- [ ] Tests for `requestNotificationPermission` function
- [ ] Tests mock browser APIs correctly
- [ ] All tests pass with `npm test`
- [ ] Coverage report shows at least 80% coverage for push.ts

**Time Estimate**: 2 hours

---

### 7.2. Integration Tests for Subscribe/Unsubscribe API

**File**: `src/pages/api/push/subscribe.integration.test.ts`

**Task**: Integration tests for push subscription API routes

**Acceptance Criteria**:

- [ ] File created at `src/pages/api/push/subscribe.integration.test.ts`
- [ ] Tests for unauthenticated requests (401)
- [ ] Tests for valid subscription save (200)
- [ ] Tests for invalid data (400)
- [ ] Tests for duplicate subscriptions (upsert behavior)
- [ ] All integration tests pass with `npm run test:integration`
- [ ] Tests use real Supabase connection (local instance recommended)

**Time Estimate**: 2 hours

---

### 7.3. Integration Tests for push-server.ts

**File**: `src/lib/push-server.integration.test.ts`

**Task**: Integration tests for server-side push notification sending

**Acceptance Criteria**:

- [ ] File created at `src/lib/push-server.integration.test.ts`
- [ ] Tests for user with no subscriptions
- [ ] Tests for successful notification send
- [ ] Tests for failed notification (network error)
- [ ] Tests for multi-device support
- [ ] Mocks web-push to avoid real HTTP calls
- [ ] Uses real Supabase database (service role)
- [ ] All tests pass with `npm run test:integration`

**Time Estimate**: 2.5 hours

---

## 8. Documentation

### 8.1. Update .env.example

**File**: `.env.example`

**Task**: Add push notification environment variables to template

**Changes**:

```env
# Push Notifications (Web Push API)
PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Supabase Service Role (server-side only, bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Acceptance Criteria**:

- [x] All four environment variables added
- [x] Clear comments explaining each variable
- [x] Placeholder values provided

**Time Estimate**: 10 minutes

---

### 8.2. Update README with Push Notification Setup

**File**: `README.md`

**Task**: Document push notification setup steps

**Acceptance Criteria**:

- [x] README updated with push notification section
- [x] Setup steps are clear and complete
- [x] Security warnings included
- [x] Browser compatibility noted

**Time Estimate**: 30 minutes

---

## Checklist Summary

### Database (1.5 hours)

- [ ] 1.1. Create `push_subscriptions` table (30 min)
- [ ] 1.2. Configure RLS policies (20 min)
- [ ] 1.3. Regenerate TypeScript types (10 min)
- [ ] 1.4. Update Supabase type exports (10 min)

### VAPID Keys (20 minutes)

- [ ] 2.1. Generate VAPID keys (10 min)
- [ ] 2.2. Store in environment variables (10 min)

### Server-Side Utilities (1.5 hours)

- [ ] 3.1. Install web-push dependency (10 min)
- [ ] 3.2. Add service role key to .env (10 min)
- [ ] 3.3. Create `push-server.ts` (1 hour)

### API Routes (1.75 hours)

- [ ] 4.1. Create `/api/push/subscribe` endpoint (1 hour)
- [ ] 4.2. Create `/api/push/unsubscribe` endpoint (45 min)

### Client-Side Utilities (1.5 hours)

- [ ] 5.1. Create `push.ts` client library (1.5 hours)

### Integration (1 hour)

- [ ] 6.1. Modify installation actions to trigger notifications (1 hour)

### Testing (6.5 hours)

- [ ] 7.1. Unit tests for push.ts (2 hours)
- [ ] 7.2. Integration tests for API routes (2 hours)
- [ ] 7.3. Integration tests for push-server.ts (2.5 hours)

### Documentation (40 minutes)

- [ ] 8.1. Update .env.example (10 min)
- [ ] 8.2. Update README (30 min)

**Total Estimated Time: 14.5 hours**
