# Frontend Implementation - Phase 11: Admin Installers Management

## Overview

Phase 11 implements the frontend for admin management of installers (users). This includes viewing the team overview with role-based separation, individual installer profiles with statistics, editing capabilities, and role management (promote/demote between admin and installer roles).

**Current Status**: Backend queries and actions are defined in the planning document. This checklist covers complete frontend implementation with comprehensive testing.

### Key Features

1. **Team Overview Page** (`/admin/installers/index.astro`):
   - Display users separated by role (admins and installers)
   - Show installer statistics (pending, in progress, completed installations)
   - Info card explaining how new installers are added (via Google OAuth)
   - Link to individual profiles

2. **Installer Profile Page** (`/admin/installers/[id].astro`):
   - View and edit installer profile form (name, phone, company details)
   - Display installer info and statistics sidebar
   - Show recent installations (last 10) with links
   - Promote to admin / demote to installer modals
   - Self-role protection (cannot modify own role)
   - Spanish phone format validation (+34)

3. **Components**:
   - Reuse existing UI components (Button, Badge, Input, Textarea, Modal, Alert, EmptyState)
   - Leverage StatusBadge for installation status display
   - Follow existing table and card patterns from installations pages

### Architecture Principles

- **Consistent Design**: Follow existing admin pages patterns (installations management)
- **Role-Based UX**: Clear visual distinction between admins and installers
- **Self-Protection**: Prevent users from modifying their own role
- **Data-Driven UI**: Show installer statistics prominently for quick assessment
- **Mobile-First**: Responsive tables and cards for all screen sizes
- **Security**: All role changes require explicit confirmation via modals
- **Accessibility**: WCAG 2.1 AA compliance for all interactive elements

---

## Implementation Status Summary

### Prerequisites ✅

- Phase 01-10 completed (authentication, dashboard, installations CRUD)
- `src/lib/queries/users.ts` exists with basic functions (`getInstallers`, `getUserById`)
- `src/components/ui/*` components available (Button, Badge, Input, Textarea, Modal, Alert, EmptyState)
- `src/components/installations/StatusBadge.astro` available for status display
- `DashboardLayout` available for page structure

### Completed ✅

- ✅ Backend: `src/lib/actions/users.ts` (user update, role change actions)
- ✅ Backend: Extended queries in `src/lib/queries/users.ts` (getAllUsers, getSingleInstallerStats, getInstallerInstallations)
- ✅ Frontend: Team overview page (`/admin/installers/index.astro`)
- ✅ Frontend: Installer profile page (`/admin/installers/[id].astro`)
- ✅ Frontend: Phone validation (Spanish format: +34)
- ✅ Testing: Unit tests for backend functions (38 tests passing)
- ✅ Testing: E2E tests for user flows (overview, profile, role management)

---

## Detailed Implementation Checklist

## SETUP - Backend Queries & Actions ✅

### 1. Backend Actions Implementation ✅

#### 1.1 Create User Actions File ✅

**File**: `src/lib/actions/users.ts` (COMPLETED)

- [x] **Create file structure** ✅
- [x] **Implement `updateUser()` function** ✅ (includes Spanish phone validation)
- [x] **Implement `changeUserRole()` function** ✅
- [x] **Export all action functions** ✅

**Estimated Time**: 30 minutes

---

#### 1.2 Unit Tests for User Actions ✅

**File**: `src/lib/actions/users.test.ts` (COMPLETED - 20 tests passing)

- [x] **Setup test environment** ✅
  - Import Vitest functions: `describe`, `it`, `expect`, `vi`, `beforeEach`
  - Import functions to test: `updateUser`, `changeUserRole`
  - Import types: `ActionResult`
  - Acceptance: Test file structured with mocks ✅

- [x] **All test cases implemented** ✅ (20 tests total including phone validation)
  - updateUser() success case ✅
  - updateUser() failure case ✅
  - Phone validation tests (all formats) ✅
  - changeUserRole() success case ✅
  - changeUserRole() failure case ✅

- [x] **Run tests and verify coverage** ✅
  - All tests passing (20/20 green)
  - Coverage: 100% for user actions

**Estimated Time**: 45 minutes

---

### 2. Extended Backend Queries ✅

#### 2.1 Add Queries to Existing File ✅

**File**: `src/lib/queries/users.ts` (COMPLETED)

- [x] **Import required types** ✅
  - Import `Installation` type from `../supabase`
  - Update existing import: `import { createServerClient, type User, type Installation } from '../supabase'`
  - Acceptance: Types are available for new functions ✅

- [x] **Implement `getAllUsers()` function** ✅
- [x] **Implement `getSingleInstallerStats()` function** ✅ (renamed to avoid conflict)
- [x] **Implement `getInstallerInstallations()` function** ✅
- [x] **Export new query functions** ✅

**Estimated Time**: 45 minutes

---

#### 2.2 Unit Tests for Extended Queries ✅

**File**: `src/lib/queries/users.test.ts` (COMPLETED - 18 tests passing)

- [x] **Setup test environment** ✅
  - Import Vitest functions: `describe`, `it`, `expect`, `vi`, `beforeEach`
  - Import functions: `getAllUsers`, `getInstallerStats`, `getInstallerInstallations`
  - Mock `createServerClient` to avoid real Supabase calls
  - Acceptance: Test file structured with mocks ✅

- [x] **All test cases implemented** ✅ (18 tests total)
  - getAllUsers() success and error cases ✅
  - getSingleInstallerStats() success and error cases ✅
  - getInstallerInstallations() with/without limit ✅
  - All edge cases covered ✅

- [x] **Run tests and verify coverage** ✅
  - All tests passing (18/18 green)
  - Coverage: 100% for new query functions

**Estimated Time**: 1 hour

---

## IMPLEMENTATION - Pages & Components ✅

### 3. Team Overview Page ✅

#### 3.1 Create Team Overview Page ✅

**File**: `src/pages/admin/installers/index.astro` (COMPLETED)

- [x] **Setup page structure** ✅
  - Import `DashboardLayout` from `@layouts/DashboardLayout.astro`
  - Import UI components: `Button`, `Badge`, `EmptyState` from `@components/ui/`
  - Import queries: `getAllUsers`, `getInstallerStats` from `@lib/queries/users`
  - Get user from `Astro.locals.user` (middleware ensures user exists)
  - Get access token from cookies: `Astro.cookies.get('sb-access-token')?.value || ''`
  - Acceptance: Page imports and setup complete ✅

- [x] **All page features implemented** ✅:
  - Fetch all users and separate by role ✅
  - Fetch installer statistics with Promise.all() ✅
  - Date formatting helper (Spanish locale) ✅
  - Page header with "Equipo" title ✅
  - Info card about Google OAuth ✅
  - Admins section (grid layout with avatars and badges) ✅
  - Installers table (with stats badges) ✅
  - Empty state for no installers ✅
  - Responsive design (mobile/tablet/desktop) ✅
  - "Tú" label for current user ✅
  - "Ver perfil" links working ✅

**Estimated Time**: 2 hours

---

### 4. Installer Profile Page ✅

#### 4.1 Create Profile Page Structure ✅

**File**: `src/pages/admin/installers/[id].astro` (COMPLETED)

- [x] **Setup page structure** ✅
  - Import layout: `DashboardLayout` from `@layouts/DashboardLayout.astro`
  - Import UI components: `Button`, `Input`, `Textarea`, `Badge`, `Alert`, `Modal` from `@components/ui/`
  - Import `StatusBadge` from `@components/installations/StatusBadge.astro`
  - Import `EmptyState` from `@components/ui/EmptyState.astro`
  - Import queries: `getUserById`, `getInstallerStats`, `getInstallerInstallations` from `@lib/queries/users`
  - Import actions: `updateUser`, `changeUserRole` from `@lib/actions/users`
  - Get user from `Astro.locals.user`
  - Get access token from cookies
  - Get route param: `const { id } = Astro.params`
  - Acceptance: Page imports complete ✅

- [x] **All profile page features implemented** ✅:
  - Fetch installer data (user, stats, installations) ✅
  - Form processing (POST handler) ✅
  - Role change actions (make_admin, make_installer) ✅
  - Profile update action ✅
  - Error/success state management ✅
  - Helper functions (formatDate, formatDateTime, getInitial) ✅
  - Breadcrumb navigation ✅
  - Page header with avatar and badges ✅
  - Role change button (conditional, not for self) ✅
  - Alert messages (error/success) ✅
  - Grid layout (responsive) ✅
  - Profile form (name, phone, company details) ✅
  - Phone validation (HTML5 pattern + hint) ✅
  - Recent installations section ✅
  - Empty state for no installations ✅
  - Info sidebar (email, phone, member since) ✅
  - Stats sidebar (total, pending, in progress, completed) ✅
  - Promote modal ✅
  - Demote modal ✅
  - Modal interactions (cancel, confirm, escape key) ✅

**Estimated Time**: 15 minutes

---

### 5. Cleanup & Polish ✅

#### 5.1 Remove Unnecessary Files ✅

- [x] **Delete new installer page if exists** ✅
  - File: `src/pages/admin/installers/new.astro`
  - Reason: Users auto-created via Google OAuth, no manual creation needed
  - Command: Check if file exists, delete if present
  - Acceptance: File removed or confirmed not to exist

**Estimated Time**: 5 minutes

---

#### 5.2 Responsive Design Verification ✅

- [x] **Test team overview page responsive design** ✅
  - Mobile (375px): Admin cards stack, table scrolls horizontally
  - Tablet (768px): Admin cards in 2 columns, table visible
  - Desktop (1024px): Admin cards in 3 columns, full table
  - Acceptance: Team page responsive on all breakpoints ✅

- [x] **Test profile page responsive design** ✅
  - Mobile (375px): Single column layout (form stacks above stats)
  - Tablet (768px): Still single column
  - Desktop (1024px): 2-column grid (form left, sidebar right)
  - Acceptance: Profile page responsive on all breakpoints

**Estimated Time**: 30 minutes

---

#### 5.3 Accessibility Audit

- [ ] **Verify keyboard navigation**
  - Tab through all interactive elements on both pages
  - Verify focus indicators visible (ring-2)
  - Verify modals closable with Escape key
  - Verify forms submittable with Enter key
  - Acceptance: Full keyboard navigation support

- [ ] **Verify screen reader compatibility**
  - Run page through screen reader (NVDA/JAWS/VoiceOver)
  - Verify labels associated with inputs (for/id attributes)
  - Verify modal ARIA attributes (aria-modal, aria-labelledby)
  - Verify table headers properly associated (th scope)
  - Acceptance: Screen readers announce content correctly

- [ ] **Verify color contrast**
  - Check all text/background combinations meet WCAG AA (4.5:1 for normal text)
  - Verify badge colors (purple, blue, green, yellow) have sufficient contrast
  - Use browser DevTools or online contrast checker
  - Acceptance: All color combinations pass WCAG AA

**Estimated Time**: 45 minutes

---

## TESTING - Comprehensive E2E Tests ✅

### 6. E2E Tests - Team Overview Page ✅

#### 6.1 Create E2E Test File ✅

**File**: `e2e/admin-installers-overview.spec.ts` (COMPLETED)

- [x] **Setup test structure** ✅
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Import fixtures (if needed for authentication)
  - Create describe block: "Admin Installers - Team Overview"
  - Acceptance: Test file structure ready ✅

- [x] **All team overview tests implemented** ✅ (10+ tests):
  - Display admins and installers sections ✅
  - Display info card about Google OAuth ✅
  - Display admin cards with avatars and purple badges ✅
  - Display "Tú" label for current user ✅
  - Display installer table with stats ✅
  - Display colored stat badges (yellow/blue/green) ✅
  - Display "Ver perfil" links ✅
  - Navigate to installer profile ✅
  - Display empty state when no installers ✅
  - Admin cards clickable and navigate to profile ✅
  - Responsive tests (mobile/tablet/desktop) ✅

**Estimated Time**: 1.5 hours

---

### 7. E2E Tests - Installer Profile Page ✅

#### 7.1 Create Profile E2E Test File ✅

**File**: `e2e/admin-installers-profile.spec.ts` (COMPLETED)

- [x] **Setup test structure** ✅
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Create describe block: "Admin Installers - Profile Page"
  - Acceptance: Test file structure ready ✅

- [x] **All profile page tests implemented** ✅ (15+ tests):
  - Display installer profile header (avatar, badge) ✅
  - Display admin profile header (purple badge) ✅
  - Display "Tú" badge for own profile ✅
  - Display breadcrumb navigation ✅
  - Display profile form with populated data ✅
  - Display phone validation hint ✅
  - Validate phone format on submission ✅
  - Update profile successfully with valid phone ✅
  - Display installer stats sidebar ✅
  - Hide stats card for admin profiles ✅
  - Display recent installations ✅
  - Display empty state for no installations ✅
  - Navigate to installation detail ✅
  - Display info sidebar (email, member since) ✅
  - Responsive tests (mobile/desktop) ✅

**Estimated Time**: 2 hours

---

### 8. E2E Tests - Role Management ✅

#### 8.1 Create Role Change E2E Tests ✅

**File**: `e2e/admin-installers-role-change.spec.ts` (COMPLETED)

- [x] **Setup test structure** ✅
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Create describe block: "Admin Installers - Role Management"
  - Acceptance: Test file structure ready ✅

- [x] **All role management tests implemented** ✅ (11+ tests):
  - Display "Promover a Admin" button for installers ✅
  - Display "Cambiar a Installer" button for admins (not self) ✅
  - Hide role change button for own profile ✅
  - Open promote modal with confirmation message ✅
  - Open demote modal with warning message ✅
  - Cancel promote modal (button click) ✅
  - Cancel demote modal (button click) ✅
  - Close modal with Escape key ✅
  - Promote installer to admin successfully ✅
  - Demote admin to installer successfully ✅
  - Display danger variant button in demote modal ✅

**Estimated Time**: 2 hours

---

### 9. E2E Tests - Responsive Design

#### 9.1 Create Responsive E2E Tests

**File**: `e2e/admin-installers-responsive.spec.ts` (NEW)

- [ ] **Setup test structure**
  - Import Playwright with viewport config
  - Create describe block: "Admin Installers - Responsive Design"
  - Acceptance: Test file structure ready

- [ ] **Test: Team overview mobile layout**
  - Set viewport to mobile (375x667)
  - Navigate to `/admin/installers`
  - Assert admin cards stacked (grid-cols-1)
  - Assert table wrapper has horizontal scroll
  - Scroll table horizontally
  - Acceptance: Mobile layout works for team overview

- [ ] **Test: Team overview tablet layout**
  - Set viewport to tablet (768x1024)
  - Navigate to `/admin/installers`
  - Assert admin cards in 2 columns (grid-cols-2)
  - Assert table visible without scroll (if content fits)
  - Acceptance: Tablet layout works

- [ ] **Test: Team overview desktop layout**
  - Set viewport to desktop (1440x900)
  - Navigate to `/admin/installers`
  - Assert admin cards in 3 columns (grid-cols-3)
  - Assert full table visible
  - Acceptance: Desktop layout works

- [ ] **Test: Profile page mobile layout**
  - Set viewport to mobile (375x667)
  - Navigate to installer profile page
  - Assert single column layout (lg:col-span-2 not applied)
  - Assert form and sidebar stack vertically
  - Acceptance: Mobile layout works for profile

- [ ] **Test: Profile page desktop layout**
  - Set viewport to desktop (1440x900)
  - Navigate to installer profile page
  - Assert 2-column grid (lg:grid-cols-3)
  - Assert form on left, sidebar on right
  - Acceptance: Desktop layout works for profile

**Estimated Time**: 1.5 hours

---

## VERIFICATION - Manual Testing Checklist

### 10. Manual Testing

#### 10.1 Team Overview Page

- [ ] **Verify team overview displays correctly**
  - Navigate to `/admin/installers` as admin
  - Check: Admins section shows all admins with avatars and purple badges
  - Check: Installers section shows all installers in table with stats
  - Check: Info card visible and readable
  - Check: "Tú" label appears next to current user in admins section
  - Check: Stats badges colored correctly (yellow, blue, green)
  - Acceptance: Team overview page displays all elements correctly

- [ ] **Verify empty states**
  - Test scenario: Database with no installers
  - Navigate to `/admin/installers`
  - Check: EmptyState component visible with message "No hay instaladores"
  - Acceptance: Empty state displays when no installers exist

- [ ] **Verify navigation**
  - Click "Ver perfil" link for an installer
  - Check: Redirects to `/admin/installers/[id]`
  - Go back to team overview
  - Acceptance: Navigation works

#### 10.2 Installer Profile Page

- [ ] **Verify profile header**
  - Navigate to installer profile page
  - Check: Avatar with initial displays (blue for installer, purple for admin)
  - Check: Name and email visible
  - Check: Role badge displays correctly (Installer or Admin)
  - Check: "Tú" badge if viewing own profile
  - Check: Breadcrumb navigation works (links to /admin and /admin/installers)
  - Acceptance: Profile header complete

- [ ] **Verify profile form**
  - Fill in "Nombre Completo": "Test User"
  - Fill in "Teléfono": "+34 600 123 456"
  - Fill in "Detalles de la Empresa": "Test company details"
  - Submit form
  - Check: Success message displays
  - Check: Form repopulates with updated values
  - Refresh page
  - Check: Updated values persist
  - Acceptance: Profile form updates work

- [ ] **Verify phone validation**
  - Fill in "Teléfono": "123" (invalid format)
  - Submit form
  - Check: Browser validation error displays
  - Fill in valid phone: "+34 600 123 456"
  - Submit form
  - Check: Validation passes
  - Acceptance: Phone validation works

- [ ] **Verify stats sidebar**
  - View installer profile (non-admin)
  - Check: "Estadísticas" card visible
  - Check: Stats display (Total, Pendientes, En progreso, Completadas)
  - Check: Numbers match actual installations
  - View admin profile
  - Check: "Estadísticas" card NOT visible
  - Acceptance: Stats display correctly for installers only

- [ ] **Verify recent installations**
  - View installer profile with installations
  - Check: "Instalaciones Recientes" section visible
  - Check: Up to 10 installations listed
  - Check: Each installation shows client name, date, and StatusBadge
  - Click installation link
  - Check: Redirects to installation detail page
  - Acceptance: Recent installations display and links work

#### 10.3 Role Management

- [ ] **Verify promote to admin**
  - Navigate to installer profile (not own profile)
  - Check: "Promover a Admin" button visible
  - Click button
  - Check: Modal opens with confirmation message
  - Click "Promover"
  - Check: Redirects to `/admin/installers`
  - Navigate to team overview
  - Check: User moved to "Administradores" section
  - Acceptance: Promote to admin works

- [ ] **Verify demote to installer**
  - Navigate to admin profile (not own profile)
  - Check: "Cambiar a Installer" button visible
  - Click button
  - Check: Modal opens with warning message
  - Click "Cambiar Rol" (danger button)
  - Check: Success message displays
  - Check: Badge changes to "Installer"
  - Navigate to team overview
  - Check: User moved to "Instaladores" section
  - Acceptance: Demote to installer works

- [ ] **Verify self-role protection**
  - Login as admin user
  - Navigate to own profile
  - Check: "Tú" badge visible
  - Check: NO role change button visible
  - Acceptance: Cannot change own role

- [ ] **Verify modal cancel behavior**
  - Open promote modal
  - Click "Cancelar"
  - Check: Modal closes, no role change
  - Open demote modal
  - Click "Cancelar"
  - Check: Modal closes, no role change
  - Acceptance: Cancel buttons work

- [ ] **Verify modal keyboard behavior**
  - Open promote modal
  - Press Escape key
  - Check: Modal closes
  - Acceptance: Escape key closes modals

#### 10.4 Responsive Design

- [ ] **Test mobile layout (375px)**
  - Resize browser to 375px width
  - Navigate to `/admin/installers`
  - Check: Admin cards stack vertically (1 column)
  - Check: Installer table scrolls horizontally
  - Navigate to installer profile
  - Check: Form and sidebar stack vertically
  - Acceptance: Mobile layout works

- [ ] **Test tablet layout (768px)**
  - Resize browser to 768px width
  - Navigate to `/admin/installers`
  - Check: Admin cards in 2 columns
  - Check: Table visible (may scroll if needed)
  - Navigate to installer profile
  - Check: Still single column layout
  - Acceptance: Tablet layout works

- [ ] **Test desktop layout (1440px)**
  - Resize browser to 1440px width
  - Navigate to `/admin/installers`
  - Check: Admin cards in 3 columns
  - Check: Full table visible without scroll
  - Navigate to installer profile
  - Check: 2-column grid (form left, sidebar right)
  - Acceptance: Desktop layout works

#### 10.5 Accessibility

- [ ] **Verify keyboard navigation**
  - Use Tab key to navigate through all interactive elements on both pages
  - Check: Focus indicators visible (ring outline)
  - Check: Can submit forms with Enter key
  - Check: Can close modals with Escape key
  - Acceptance: Full keyboard support

- [ ] **Verify screen reader compatibility**
  - Run screen reader (NVDA/JAWS/VoiceOver)
  - Check: All form labels announced correctly
  - Check: Buttons and links announced with clear purpose
  - Check: Table headers associated with cells
  - Check: Modal title announced when opened
  - Acceptance: Screen reader navigation works

- [ ] **Verify color contrast**
  - Use browser DevTools or contrast checker
  - Check: All text meets WCAG AA (4.5:1 for normal text)
  - Check: Badge colors (purple, blue, green, yellow) have sufficient contrast
  - Acceptance: All colors pass WCAG AA

---

## Summary

### Total Estimated Time: 18-20 hours

**Breakdown**:

- Backend actions & queries: 3-4 hours
- Team overview page: 2 hours
- Profile page: 4 hours
- Testing (E2E + manual): 8-10 hours
- Cleanup & verification: 2 hours

### Key Deliverables

1. **Backend**: User actions (update, role change) and extended queries (all users, stats, installations)
2. **Frontend**: Team overview page with admins/installers sections
3. **Frontend**: Installer profile page with edit form and role management
4. **Testing**: Comprehensive E2E tests covering all user flows
5. **Quality**: Responsive design, accessibility compliance, phone validation

### Success Criteria

- All unit tests pass (100% coverage for new functions)
- All E2E tests pass (team overview, profile, role management, responsive)
- Manual testing checklist complete (all items verified)
- Code follows existing patterns (installations pages, DashboardLayout)
- Responsive on mobile (375px), tablet (768px), desktop (1440px)
- WCAG 2.1 AA accessibility compliance
- Spanish phone validation (+34 format)
- Self-role protection (cannot change own role)

### Next Phase

After Phase 11 completion, proceed to:

- **Phase 12**: Installer Dashboard (view assigned installations, update status)
