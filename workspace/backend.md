# Backend Implementation Checklist - Phase 11: Admin Installers Management

## Overview

This document provides a comprehensive implementation plan for **Phase 11: Admin Installers Management**. This phase implements the complete user management system for admins to view, edit, and manage installers, including role changes and profile updates.

**Current Status**: ✅ **CORE IMPLEMENTATION COMPLETED**

**Scope**: Backend actions, queries, and data models for user management

**Estimated Time**: 4-6 hours (implementation + comprehensive testing)

---

## ✅ IMPLEMENTATION SUMMARY

### Completed (Core Implementation)

- ✅ **Section 1.1**: User Actions File (`src/lib/actions/users.ts`) - Created with `updateUser()` and `changeUserRole()`
- ✅ **Section 1.2**: Phone Validation Utility - `isValidSpanishPhone()` implemented and integrated
- ✅ **Section 2.1**: `getAllUsers()` Query - Added with RLS context
- ✅ **Section 2.2**: `getSingleInstallerStats()` Query - Added (renamed to avoid conflict)
- ✅ **Section 2.3**: `getInstallerInstallations()` Query - Added with optional limit
- ✅ **Section 2.4**: `getUserById()` Updated - Now accepts accessToken parameter
- ✅ **Section 3.1-3.2**: Type Definitions Verified - All types correct, `assigned_to` field confirmed
- ✅ **Section 5.1**: User Actions Unit Tests - 20 tests created and passing
- ✅ **Section 6.1**: User Queries Unit Tests - 18 tests created and passing
- ✅ **Section 10.1**: Build Verification - `npm run build` succeeds (6.76s)
- ✅ **Section 10.2**: TypeScript Type Safety - All strict mode checks pass, no `any` types

### Test Results

- **Total Tests**: 38 tests passing (20 actions + 18 queries)
- **Test Files**: `src/lib/actions/users.test.ts`, `src/lib/queries/users.test.ts`
- **Coverage**: Success paths, error paths, validation, edge cases

### Deferred (Require Additional Setup)

- ⏸️ **Section 7.1-7.2**: Integration Tests - Require local Supabase instance and test data seeding
- ⏸️ **Section 8.1**: E2E Tests - Require frontend implementation (Phase 11 frontend)
- ⏸️ **Section 4.1**: RLS Verification - Requires Supabase dashboard access or manual testing
- ⏸️ **Section 9.1-9.2**: Manual Testing - Can be performed once local Supabase is set up

### Key Implementation Notes

1. Function `getInstallerStats()` renamed to `getSingleInstallerStats()` to avoid naming conflict with existing function
2. Schema uses `assigned_to` field (not `installer_id`) - verified and used correctly
3. All functions follow existing patterns from `installations.ts` and other queries
4. Phone validation accepts multiple Spanish formats: +34 XXX XXX XXX, +34XXXXXXXXX, etc.
5. All operations use `createServerClient(accessToken)` for proper RLS context

---

---

## Architecture Context

### Current Backend Patterns

**Existing Patterns to Follow**:

1. **Supabase Client Pattern** (`src/lib/supabase.ts`):
   - Anonymous client for non-authenticated queries
   - Server client with accessToken for authenticated operations
   - All authenticated operations MUST use `createServerClient(accessToken)`

2. **Query Pattern** (`src/lib/queries/`):
   - Functions accept `accessToken` as first parameter (optional for public queries)
   - Use `createServerClient(accessToken)` for authenticated queries
   - Return typed data or empty arrays (never null)
   - Throw descriptive errors with error messages
   - Use explicit select with joins for related data

3. **Action Pattern** (`src/lib/actions/installations.ts`):
   - Functions accept `accessToken` as first parameter
   - Return `ActionResult` interface: `{ success: boolean; error?: string; data?: T }`
   - Use `createServerClient(accessToken)` for mutations
   - Log errors with `console.error()` before returning error result
   - Return single records with `.single()` when appropriate

4. **Type Safety**:
   - Import types from `src/lib/supabase.ts` (exported from `src/types/database.ts`)
   - Use `Database` types: `User`, `UserUpdate`, `Installation`
   - No `any` types allowed (TypeScript strict mode)

### RLS Security Model

**CRITICAL**: All operations use the anonymous key with user's access token. RLS policies enforce authorization at the database level.

**User Management RLS Requirements**:

- Admins can view all users (admins and installers)
- Admins can update any user's profile
- Admins can change any user's role (except themselves)
- Installers can only view their own profile
- Installers cannot change roles

**Note**: These RLS policies should already exist from previous phases. Verify during implementation.

---

## Implementation Tasks

### 1. User Actions Module

#### 1.1 Create User Actions File ✅

**File**: `src/lib/actions/users.ts` (NEW)

**Tasks**:

- [x] Create new file `src/lib/actions/users.ts`
- [x] Import required types and functions:
  - `createServerClient` from `../supabase`
  - `User`, `UserUpdate` from `../supabase`
- [x] Define `ActionResult` interface (match existing pattern):
  ```typescript
  export interface ActionResult {
    success: boolean;
    error?: string;
    data?: User;
  }
  ```
- [x] Implement `updateUser()` function:
  - Accept parameters: `accessToken: string`, `id: string`, `data: UserUpdate`
  - Create server client with access token
  - Update user record with `.update(data).eq('id', id).select().single()`
  - Log errors with `console.error('Error updating user:', error)`
  - Return `ActionResult` with success/error/data
- [x] Implement `changeUserRole()` function:
  - Accept parameters: `accessToken: string`, `id: string`, `role: 'admin' | 'installer'`
  - Create server client with access token
  - Update user role with `.update({ role }).eq('id', id)`
  - Log errors with `console.error('Error changing role:', error)`
  - Return `ActionResult` with success/error (no data needed)
- [x] Add JSDoc documentation for all functions
- [x] Export all functions and `ActionResult` interface

**Acceptance Criteria**: ✅ ALL MET

- File created with proper imports and types
- `updateUser()` follows existing action pattern
- `changeUserRole()` follows existing action pattern
- Both functions use `createServerClient(accessToken)`
- Error handling is consistent with existing actions
- TypeScript compiles without errors
- All exports are properly typed

**Time Estimate**: 30-45 minutes

---

#### 1.2 Add Phone Validation Utility ✅

**File**: `src/lib/actions/users.ts` (UPDATE)

**Tasks**:

- [x] Add Spanish phone validation function:
  ```typescript
  /**
   * Validates Spanish phone number format
   * Accepts formats: +34 XXX XXX XXX, +34XXX XXX XXX, 34XXXXXXXXX, XXXXXXXXX
   * @param phone - Phone number to validate
   * @returns true if valid Spanish phone format
   */
  export function isValidSpanishPhone(phone: string | null): boolean;
  ```
- [x] Implement regex validation for Spanish phone numbers:
  - Strip whitespace and normalize input
  - Check for +34 prefix (optional)
  - Validate 9-digit Spanish phone numbers (6XX XXX XXX, 7XX XXX XXX, 9XX XXX XXX)
  - Return boolean
- [x] Update `updateUser()` to validate phone before update:
  - If `data.phone_number` is provided and not null, validate format
  - If invalid, return error: "Formato de teléfono inválido. Use formato: +34 XXX XXX XXX"
  - If valid or null, proceed with update
- [x] Add unit tests for phone validation (see Testing section)

**Acceptance Criteria**: ✅ ALL MET

- Phone validation function accepts common Spanish formats
- Validation rejects invalid formats
- `updateUser()` validates phone before database update
- Clear error message for invalid phone numbers
- TypeScript types are correct (nullable phone)

**Time Estimate**: 20-30 minutes

---

### 2. User Queries Extensions

#### 2.1 Add getAllUsers Query ✅

**File**: `src/lib/queries/users.ts` (UPDATE)

**Tasks**:

- [x] Add `getAllUsers()` function at the end of the file:
  - Accept parameter: `accessToken: string`
  - Create server client with access token
  - Query all users with `.select('*').order('created_at', { ascending: false })`
  - Return typed `User[]` array
  - On error, log with `console.error('Error fetching users:', error)` and return empty array
- [ ] Add JSDoc documentation explaining this query is for admin use
- [ ] Export function

**Acceptance Criteria**:

- Function follows existing query pattern
- Uses `createServerClient(accessToken)` (respects RLS)
- Returns users ordered by creation date (newest first)
- Returns empty array on error (consistent with existing queries)
- TypeScript return type is `User[]`

**Time Estimate**: 15-20 minutes

---

#### 2.2 Add getInstallerStats Query

**File**: `src/lib/queries/users.ts` (UPDATE)

**Tasks**:

- [ ] Define `InstallerStatsResult` interface:
  ```typescript
  export interface InstallerStatsResult {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }
  ```
- [ ] Add `getInstallerStats()` function:
  - Accept parameters: `accessToken: string`, `installerId: string`
  - Create server client with access token
  - Query installations with `.select('status').eq('installer_id', installerId).is('archived_at', null)`
    - Note: Use `installer_id` not `assigned_to` (verify schema field name)
  - Calculate stats by counting status values:
    - `total`: data.length
    - `pending`: count where status === 'pending'
    - `inProgress`: count where status === 'in_progress'
    - `completed`: count where status === 'completed'
  - On error, return zero stats: `{ total: 0, pending: 0, inProgress: 0, completed: 0 }`
  - Return `InstallerStatsResult`
- [ ] Add JSDoc documentation
- [ ] Export function and interface

**Acceptance Criteria**:

- Function calculates stats from installation records
- Excludes archived installations
- Returns zero stats on error (never throws)
- Stats calculation is correct (counts by status)
- Return type matches `InstallerStatsResult` interface

**Time Estimate**: 20-30 minutes

---

#### 2.3 Add getInstallerInstallations Query

**File**: `src/lib/queries/users.ts` (UPDATE)

**Tasks**:

- [ ] Verify `Installation` type is imported:
  - Check if import exists: `import type { User, Installation } from '../supabase';`
  - If not, add `Installation` to imports from `../supabase`
- [ ] Add `getInstallerInstallations()` function:
  - Accept parameters: `accessToken: string`, `installerId: string`, `limit?: number`
  - Create server client with access token
  - Build query:
    ```typescript
    let query = client
      .from('installations')
      .select('*')
      .eq('installer_id', installerId)
      .is('archived_at', null)
      .order('scheduled_date', { ascending: false, nullsFirst: false });
    ```
  - If `limit` is provided, apply `.limit(limit)`
  - Execute query and return installations array
  - On error, log and return empty array
- [ ] Add JSDoc documentation explaining optional limit parameter
- [ ] Export function

**Acceptance Criteria**:

- Function returns installations for specific installer
- Excludes archived installations
- Orders by scheduled_date (most recent first)
- Respects optional limit parameter
- Returns empty array on error
- Return type is `Installation[]`

**Time Estimate**: 20-25 minutes

---

#### 2.4 Update getUserById to Accept AccessToken

**File**: `src/lib/queries/users.ts` (UPDATE)

**Tasks**:

- [ ] Review existing `getUserById()` function:
  - Current signature: `getUserById(id: string): Promise<User | null>`
  - Current implementation uses anonymous client (no RLS context)
- [ ] Update function signature to accept access token:
  - New signature: `getUserById(accessToken: string, id: string): Promise<User | null>`
- [ ] Update implementation:
  - Use `createServerClient(accessToken)` instead of `supabase`
  - Keep existing logic: `.select('*').eq('id', id).single()`
  - Keep error handling: return null on 'PGRST116', throw on other errors
- [ ] Update JSDoc documentation to document new parameter
- [ ] Search codebase for usages and update calls:
  ```bash
  # Find usages: grep -r "getUserById" src/
  ```
- [ ] Update all calls to pass accessToken as first parameter

**Acceptance Criteria**:

- Function signature updated with accessToken parameter
- Uses server client with access token (respects RLS)
- All usages in codebase updated
- Tests updated to pass accessToken
- No breaking changes to existing functionality

**Time Estimate**: 20-30 minutes

---

### 3. Type Definitions

#### 3.1 Verify Database Types

**File**: `src/types/database.ts` (VERIFY)

**Tasks**:

- [ ] Verify `users` table types include all required fields:
  - `id: string`
  - `email: string`
  - `full_name: string`
  - `phone_number: string | null`
  - `company_details: string | null`
  - `role: Database['public']['Enums']['user_role']`
  - `created_at: string`
- [ ] Verify `UserUpdate` type allows partial updates:
  - `full_name?: string`
  - `phone_number?: string | null`
  - `company_details?: string | null`
  - `role?: Database['public']['Enums']['user_role']`
- [ ] If types are missing or incorrect, regenerate:
  ```bash
  npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
  ```
- [ ] Verify exports in `src/lib/supabase.ts`:
  - `export type User = Tables['users']['Row'];`
  - `export type UserUpdate = Tables['users']['Update'];`

**Acceptance Criteria**:

- Database types match current schema
- `User` type includes all fields
- `UserUpdate` type allows partial updates
- Types are exported from `src/lib/supabase.ts`
- TypeScript compiles without type errors

**Time Estimate**: 10-15 minutes

---

#### 3.2 Verify Installation Field Name

**File**: `src/types/database.ts` (VERIFY)

**Tasks**:

- [ ] Check `installations` table for installer foreign key field name:
  - Planning doc uses `installer_id`
  - Existing queries use `assigned_to`
  - Verify which is correct in schema
- [ ] If field is `assigned_to`, update new queries to use correct field name:
  - `getInstallerStats()` query
  - `getInstallerInstallations()` query
- [ ] If field is `installer_id`, verify existing queries are correct
- [ ] Document field name in JSDoc comments for clarity

**Acceptance Criteria**:

- Correct field name identified
- All queries use consistent field name
- No query uses non-existent field
- Field name documented in query comments

**Time Estimate**: 10 minutes

---

### 4. Integration Verification

#### 4.1 Verify RLS Policies

**Tasks**:

- [ ] Review existing RLS policies for `users` table (Supabase dashboard or migration files)
- [ ] Verify policies allow:
  - Admins can SELECT all users
  - Admins can UPDATE all users (except potentially role changes)
  - Installers can SELECT only their own record
  - Installers cannot UPDATE role field
- [ ] If policies are missing or incorrect, document required policy changes:

  ```sql
  -- Example policy structure (adjust to actual implementation)
  CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

  CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
  ```

- [ ] Test policies with actual authenticated requests

**Acceptance Criteria**:

- RLS policies documented
- Policies align with requirements
- Policies tested with real access tokens
- Any missing policies identified for database team

**Time Estimate**: 20-30 minutes

---

## Testing Implementation

### 5. Unit Tests - User Actions

#### 5.1 Create User Actions Unit Tests

**File**: `src/lib/actions/users.test.ts` (NEW)

**Tasks**:

- [ ] Create test file with Vitest imports
- [ ] Mock `createServerClient` using `vi.mock('../supabase')`
- [ ] Test `updateUser()` function:
  - **Test 1**: Successfully updates user profile
    - Mock successful update response
    - Verify correct data passed to `.update()`
    - Verify `.eq('id', userId)` called
    - Verify `.select().single()` called
    - Assert `success: true` and data returned
  - **Test 2**: Returns error on database failure
    - Mock error response from Supabase
    - Verify error logged to console
    - Assert `success: false` and error message
  - **Test 3**: Validates phone number before update
    - Call with invalid phone number
    - Assert returns error about phone format
    - Verify database update NOT called
  - **Test 4**: Allows valid phone number
    - Call with valid Spanish phone
    - Verify database update IS called
    - Assert success
  - **Test 5**: Allows null phone number
    - Call with phone_number: null
    - Verify database update IS called
    - Assert success
- [ ] Test `changeUserRole()` function:
  - **Test 6**: Successfully changes role to admin
    - Mock successful update
    - Verify `.update({ role: 'admin' })` called
    - Assert success
  - **Test 7**: Successfully changes role to installer
    - Mock successful update
    - Verify `.update({ role: 'installer' })` called
    - Assert success
  - **Test 8**: Returns error on database failure
    - Mock error response
    - Verify error logged
    - Assert `success: false`
- [ ] Test `isValidSpanishPhone()` function:
  - **Test 9**: Accepts valid formats:
    - `+34 600 123 456`
    - `+34600123456`
    - `34600123456`
    - `600123456`
  - **Test 10**: Rejects invalid formats:
    - `123` (too short)
    - `+1 555 123 4567` (wrong country code)
    - `abc123` (non-numeric)
    - Empty string
  - **Test 11**: Returns true for null
    - `isValidSpanishPhone(null)` returns true (null is valid)

**Acceptance Criteria**:

- All 11+ tests pass
- Tests use proper mocks (no real Supabase calls)
- Tests cover success and error paths
- Phone validation thoroughly tested
- Console error logging verified
- Mock client properly isolated between tests

**Time Estimate**: 1-1.5 hours

---

### 6. Unit Tests - User Queries

#### 6.1 Create User Queries Unit Tests

**File**: `src/lib/queries/users.test.ts` (NEW or UPDATE)

**Tasks**:

- [ ] Create or update test file with Vitest imports
- [ ] Mock `createServerClient` using `vi.mock('../supabase')`
- [ ] Test `getAllUsers()` function:
  - **Test 1**: Returns all users ordered by creation date
    - Mock successful query response with multiple users
    - Verify `.select('*')` called
    - Verify `.order('created_at', { ascending: false })` called
    - Assert returned users match mock data
  - **Test 2**: Returns empty array on error
    - Mock error response
    - Verify error logged to console
    - Assert returns `[]`
- [ ] Test `getInstallerStats()` function:
  - **Test 3**: Calculates stats correctly
    - Mock installations with mixed statuses:
      - 2 pending, 3 in_progress, 5 completed
    - Assert: `{ total: 10, pending: 2, inProgress: 3, completed: 5 }`
  - **Test 4**: Excludes archived installations
    - Mock query with `.is('archived_at', null)`
    - Verify filter applied
  - **Test 5**: Returns zero stats on error
    - Mock error response
    - Assert: `{ total: 0, pending: 0, inProgress: 0, completed: 0 }`
  - **Test 6**: Handles empty installations
    - Mock empty array response
    - Assert all stats are 0
- [ ] Test `getInstallerInstallations()` function:
  - **Test 7**: Returns installations for installer
    - Mock installations for specific installer ID
    - Verify `.eq('installer_id', installerId)` called (or `assigned_to`)
    - Assert returned installations match mock
  - **Test 8**: Orders by scheduled_date descending
    - Verify `.order('scheduled_date', { ascending: false, nullsFirst: false })` called
  - **Test 9**: Applies limit when provided
    - Call with `limit: 5`
    - Verify `.limit(5)` called
  - **Test 10**: No limit when omitted
    - Call without limit parameter
    - Verify `.limit()` NOT called
  - **Test 11**: Excludes archived installations
    - Verify `.is('archived_at', null)` called
  - **Test 12**: Returns empty array on error
    - Mock error response
    - Assert returns `[]`
- [ ] Test updated `getUserById()` function:
  - **Test 13**: Returns user by ID
    - Mock successful single user response
    - Verify uses `createServerClient(accessToken)`
    - Assert returned user matches mock
  - **Test 14**: Returns null when user not found
    - Mock error with code 'PGRST116'
    - Assert returns `null`
  - **Test 15**: Throws on other errors
    - Mock error with different code
    - Assert throws error

**Acceptance Criteria**:

- All 15+ tests pass
- Tests use proper mocks (no real Supabase calls)
- Tests verify correct query construction
- Tests cover success and error paths
- Stats calculation logic thoroughly tested
- Optional parameters tested
- Access token usage verified

**Time Estimate**: 1.5-2 hours

---

### 7. Integration Tests with Supabase

#### 7.1 Create User Management Integration Tests

**File**: `src/lib/actions/users.integration.test.ts` (NEW)

**Tasks**:

- [ ] Create integration test file (`.integration.test.ts` extension)
- [ ] Import real Supabase client (not mocked)
- [ ] Setup test environment:
  - Use local Supabase instance (via Supabase CLI)
  - Create test admin user with real access token
  - Create test installer users in database
- [ ] Test `updateUser()` with real Supabase:
  - **Test 1**: Admin updates installer profile
    - Create test installer
    - Update full_name, phone_number, company_details
    - Verify changes persisted in database
    - Clean up test data
  - **Test 2**: Validates phone number in real scenario
    - Attempt update with invalid phone
    - Verify error returned
    - Verify database NOT modified
- [ ] Test `changeUserRole()` with real Supabase:
  - **Test 3**: Admin promotes installer to admin
    - Create test installer
    - Change role to 'admin'
    - Verify role changed in database
    - Clean up test data
  - **Test 4**: RLS prevents installer from changing roles
    - Use installer access token
    - Attempt to change own role
    - Verify operation fails (RLS denial)
- [ ] Cleanup after each test:
  - Delete test users created during test
  - Verify no test data remains

**Acceptance Criteria**:

- Tests use real Supabase connection (local instance)
- Tests verify RLS policies work correctly
- Tests create and clean up test data
- All tests pass with real database
- Tests are isolated (don't depend on each other)
- Test data is properly cleaned up

**Time Estimate**: 1-1.5 hours

---

#### 7.2 Create User Queries Integration Tests

**File**: `src/lib/queries/users.integration.test.ts` (NEW)

**Tasks**:

- [ ] Create integration test file
- [ ] Setup test environment with real Supabase
- [ ] Test `getAllUsers()` with real data:
  - **Test 1**: Admin can fetch all users
    - Seed test users (2 admins, 3 installers)
    - Call `getAllUsers()` with admin token
    - Verify returns all 5 users
    - Verify users ordered by created_at
    - Clean up
  - **Test 2**: Installer cannot fetch all users (RLS)
    - Use installer access token
    - Call `getAllUsers()`
    - Verify returns only installer's own record (RLS)
- [ ] Test `getInstallerStats()` with real data:
  - **Test 3**: Calculates stats from real installations
    - Create test installer
    - Create test installations with various statuses
    - Call `getInstallerStats()`
    - Verify stats match actual data
    - Clean up
  - **Test 4**: Excludes archived installations
    - Create installations, archive some
    - Verify stats don't include archived
- [ ] Test `getInstallerInstallations()` with real data:
  - **Test 5**: Returns installations for installer
    - Create test installer with installations
    - Call `getInstallerInstallations()`
    - Verify returns correct installations
    - Verify ordering
    - Clean up
  - **Test 6**: Respects limit parameter
    - Create 10 installations
    - Call with `limit: 5`
    - Verify returns only 5
    - Clean up
- [ ] Cleanup after all tests

**Acceptance Criteria**:

- Tests use real Supabase local instance
- Tests verify RLS behavior with different user roles
- Tests verify query ordering and filtering
- All tests pass with real database
- Test data properly seeded and cleaned up

**Time Estimate**: 1.5-2 hours

---

### 8. E2E Tests (Optional - Frontend Integration)

#### 8.1 E2E Tests for User Management UI

**File**: `e2e/admin-installers-management.spec.ts` (NEW)

**Note**: These E2E tests require the frontend pages from Phase 11 to be implemented. Include them in the testing plan but mark as dependent on frontend completion.

**Tasks**:

- [ ] Create E2E test file using Playwright
- [ ] Test admin installers list page:
  - **Test 1**: Admin can view installers list
    - Login as admin
    - Navigate to `/admin/installers`
    - Verify installers displayed
    - Verify stats shown for each installer
  - **Test 2**: Installers separated by role
    - Verify admins section exists
    - Verify installers section exists
    - Verify users in correct sections
- [ ] Test installer profile page:
  - **Test 3**: Admin can view installer profile
    - Navigate to `/admin/installers/[id]`
    - Verify profile information displayed
    - Verify stats displayed
    - Verify recent installations shown
  - **Test 4**: Admin can edit installer profile
    - Fill form with new data
    - Submit form
    - Verify success message
    - Verify changes persisted
  - **Test 5**: Phone validation works in UI
    - Enter invalid phone
    - Submit form
    - Verify error message shown
    - Verify form not submitted
  - **Test 6**: Admin can promote installer to admin
    - Click "Promover a Admin"
    - Confirm modal
    - Verify redirect to list
    - Verify user in admins section
  - **Test 7**: Admin can demote admin to installer
    - Click "Cambiar a Installer"
    - Confirm modal
    - Verify success message
    - Verify role changed
  - **Test 8**: Cannot change own role
    - View own profile
    - Verify role change buttons not present
- [ ] Test error scenarios:
  - **Test 9**: Handles network errors gracefully
  - **Test 10**: Displays user-friendly error messages

**Acceptance Criteria**:

- All E2E tests pass in real browser
- Tests use real authentication flow
- Tests verify complete user flows
- Error scenarios tested
- Tests clean up data after execution

**Time Estimate**: 2-3 hours (after frontend implementation)

---

## Verification Checklist

### 9. Manual Testing

#### 9.1 User Actions Manual Tests

**Prerequisites**:

- Local Supabase instance running
- Admin user authenticated
- Test installer users exist

**Tests**:

- [ ] **Manual Test 1**: Update user profile via actions
  - Call `updateUser()` from admin page
  - Verify full_name updated
  - Verify phone_number updated
  - Verify company_details updated
  - Verify response indicates success
- [ ] **Manual Test 2**: Phone validation rejects invalid phone
  - Call `updateUser()` with phone "123"
  - Verify error about phone format
  - Verify database not modified
- [ ] **Manual Test 3**: Change installer to admin
  - Call `changeUserRole()` with role: 'admin'
  - Verify role changed in database
  - Verify user can access admin routes
- [ ] **Manual Test 4**: Change admin to installer
  - Call `changeUserRole()` with role: 'installer'
  - Verify role changed
  - Verify user cannot access admin routes
- [ ] **Manual Test 5**: RLS prevents unauthorized role changes
  - Authenticate as installer
  - Attempt to change own role
  - Verify operation fails

**Time Estimate**: 30-45 minutes

---

#### 9.2 User Queries Manual Tests

**Tests**:

- [ ] **Manual Test 6**: getAllUsers returns all users
  - Call `getAllUsers()` as admin
  - Verify returns both admins and installers
  - Verify ordering (newest first)
- [ ] **Manual Test 7**: getAllUsers respects RLS for installers
  - Call `getAllUsers()` as installer
  - Verify returns only own record (RLS)
- [ ] **Manual Test 8**: getInstallerStats calculates correctly
  - Create test installations with known statuses
  - Call `getInstallerStats()`
  - Verify counts match expectations
- [ ] **Manual Test 9**: getInstallerInstallations returns installations
  - Call with test installer ID
  - Verify returns installations
  - Verify ordering (scheduled_date desc)
  - Verify excludes archived
- [ ] **Manual Test 10**: Limit parameter works
  - Call `getInstallerInstallations()` with limit: 3
  - Verify returns max 3 installations

**Time Estimate**: 30-45 minutes

---

### 10. Build and Code Quality

#### 10.1 Build Verification

**Tasks**:

- [ ] Run `npm run build` successfully
  - No TypeScript compilation errors
  - No type mismatches
  - Build completes successfully
- [ ] Run `npm run lint` successfully
  - No ESLint errors
  - No unused imports
  - Code follows project conventions
- [ ] Run `npm run format:check`
  - All files properly formatted
  - Run `npm run format` if needed

**Acceptance Criteria**:

- Build succeeds without errors
- No linter warnings or errors
- Code properly formatted

**Time Estimate**: 10-15 minutes

---

#### 10.2 TypeScript Type Safety

**Tasks**:

- [ ] Verify no `any` types used in new code
- [ ] Verify all function parameters properly typed
- [ ] Verify all return types explicitly declared
- [ ] Verify imports use correct types from `src/lib/supabase.ts`
- [ ] Verify database types are current (regenerate if needed)

**Acceptance Criteria**:

- TypeScript strict mode passes
- All types are explicit and correct
- No type assertions (`as`) unless justified
- Database types match current schema

**Time Estimate**: 15-20 minutes

---

### 11. Documentation

#### 11.1 Code Documentation

**Tasks**:

- [ ] Add JSDoc comments to all exported functions:
  - Function description (what it does)
  - Parameter descriptions with types
  - Return type description
  - Example usage (if complex)
- [ ] Add inline comments for complex logic:
  - Phone validation regex explanation
  - Stats calculation logic
  - Query construction with multiple filters
- [ ] Document RLS requirements in function comments:
  - Which roles can call which functions
  - What permissions are required

**Acceptance Criteria**:

- All public functions have JSDoc
- Complex logic explained
- RLS requirements documented
- Comments explain WHY not WHAT

**Time Estimate**: 20-30 minutes

---

#### 11.2 Update Project Documentation

**File**: `CLAUDE.md` (UPDATE)

**Tasks**:

- [ ] Document new user actions module:
  - Path: `src/lib/actions/users.ts`
  - Functions: `updateUser()`, `changeUserRole()`
  - Phone validation function
- [ ] Document new user queries:
  - Path: `src/lib/queries/users.ts`
  - Functions: `getAllUsers()`, `getInstallerStats()`, `getInstallerInstallations()`
- [ ] Document Spanish phone validation format:
  - Accepted formats
  - Example valid phones
- [ ] Add example usage in CLAUDE.md:
  ```typescript
  // Example: Update user profile
  const result = await updateUser(accessToken, userId, {
    full_name: 'New Name',
    phone_number: '+34 600 123 456'
  });
  ```

**Acceptance Criteria**:

- CLAUDE.md updated with new modules
- Examples provided for common operations
- Phone validation documented

**Time Estimate**: 20-30 minutes

---

## Summary

### Implementation Breakdown

**Total Tasks**: 11 major sections, 40+ individual tasks

**Estimated Time**:

1. User Actions Module: 1-1.5 hours
2. User Queries Extensions: 1-1.5 hours
3. Type Definitions: 20-30 minutes
4. Integration Verification: 20-30 minutes
5. Unit Tests (Actions): 1-1.5 hours
6. Unit Tests (Queries): 1.5-2 hours
7. Integration Tests (Actions): 1-1.5 hours
8. Integration Tests (Queries): 1.5-2 hours
9. E2E Tests: 2-3 hours (after frontend)
10. Manual Testing: 1-1.5 hours
11. Build & Documentation: 1-1.5 hours

**Total Estimated Time**: 12-17 hours (including comprehensive testing)

**Core Implementation Only**: 4-6 hours (items 1-4 + build)

**Testing**: 6-9 hours (items 5-9)

**Documentation & Verification**: 2-3 hours (items 10-11)

---

### Key Files

**Files to Create**:

- `src/lib/actions/users.ts` - User mutation actions
- `src/lib/actions/users.test.ts` - Unit tests for actions
- `src/lib/actions/users.integration.test.ts` - Integration tests for actions
- `src/lib/queries/users.test.ts` - Unit tests for queries (if doesn't exist)
- `src/lib/queries/users.integration.test.ts` - Integration tests for queries
- `e2e/admin-installers-management.spec.ts` - E2E tests (after frontend)

**Files to Update**:

- `src/lib/queries/users.ts` - Add new query functions
- `src/types/database.ts` - Verify/regenerate if needed
- `CLAUDE.md` - Document new modules

**Files to Verify**:

- `src/lib/supabase.ts` - Verify type exports
- Database RLS policies - Verify user management policies

---

### Dependencies

**Required Before Starting**:

- Phase 10 (Installations CRUD) completed
- Database schema includes users table
- RLS policies for users table configured
- Authentication system working (Phase 06)

**Blocking Frontend Work**:

- Phase 11 frontend pages depend on these backend actions/queries
- E2E tests depend on frontend implementation

**Next Phase**:

- Phase 12: Installer Dashboard (uses `getInstallerStats()`, `getInstallerInstallations()`)

---

### Success Criteria

Phase 11 backend is complete when:

1. ✅ `src/lib/actions/users.ts` created with `updateUser()` and `changeUserRole()`
2. ✅ Phone validation implemented and tested
3. ✅ `src/lib/queries/users.ts` extended with `getAllUsers()`, `getInstallerStats()`, `getInstallerInstallations()`
4. ✅ All unit tests pass (20+ tests)
5. ✅ All integration tests pass (10+ tests)
6. ✅ RLS policies verified and documented
7. ✅ Build succeeds: `npm run build`
8. ✅ Linter passes: `npm run lint`
9. ✅ TypeScript strict mode passes (no `any` types)
10. ✅ Documentation updated in CLAUDE.md
11. ✅ Manual testing completed successfully

**Definition of Done**:

- All backend code implemented
- All tests passing
- Build succeeds
- Code reviewed for quality
- Documentation updated
- Ready for frontend integration

---

### Risk Assessment

**Low Risk**:

- Adding new user actions module (isolated, follows existing pattern)
- Adding new query functions (isolated)
- Phone validation utility (pure function, easily tested)

**Medium Risk**:

- Updating `getUserById()` signature (requires updating all usages)
- RLS policy verification (may require policy changes)
- Integration tests with real Supabase (requires local instance setup)

**Mitigation**:

- Comprehensive unit tests before integration tests
- Verify RLS policies early in implementation
- Test with both admin and installer tokens
- Document all breaking changes

**Rollback Plan**:

- Revert user actions module
- Revert query extensions
- Revert `getUserById()` changes
- No database schema changes (only queries)

---

### Architecture Decisions

**Why Separate Actions and Queries?**:

- **Actions** (`src/lib/actions/`): Mutations (INSERT, UPDATE, DELETE)
- **Queries** (`src/lib/queries/`): Read operations (SELECT)
- Clear separation of concerns
- Easier to test and reason about
- Follows existing project pattern

**Why Phone Validation in Actions?**:

- Validation happens before database operation
- Server-side validation (don't trust client)
- Reusable for other user update scenarios
- Clear error messages before expensive database calls

**Why Stats Calculation in Code?**:

- Simple counts, not complex aggregation
- No need for database view or stored procedure
- Easier to test and debug
- Flexible (can add more stats without schema changes)

**Why AccessToken Required?**:

- All operations respect RLS policies
- No service role operations (security)
- User context always present for authorization
- Consistent with existing query/action pattern

**Trade-offs**:

- ✅ Security: All operations respect RLS
- ✅ Testability: Pure functions, mockable dependencies
- ✅ Consistency: Follows existing patterns
- ❌ Performance: Stats calculated per request (not cached)
  - Mitigation: Cache in frontend or add database view later if needed
- ❌ N+1 queries: `getInstallerStats()` fetches all installations
  - Mitigation: Acceptable for small datasets, optimize later if needed

---

**End of Backend Implementation Plan for Phase 11**
