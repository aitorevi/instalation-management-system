# Frontend Implementation - Phase 12: Installer Dashboard

## Overview

Phase 12 implements the frontend for installer-facing features, allowing installers to view their assigned installations, see today's schedule, upcoming installations, and access a filtered list of all their assignments. This phase focuses on creating a streamlined, mobile-friendly experience for installers in the field.

**Current Status**: Backend queries ready from Phase 11. This checklist covers complete frontend implementation with comprehensive testing.

### Key Features

1. **Installer Dashboard** (`/installer/index.astro`):
   - Personalized greeting with installer name and formatted date
   - 4 stats cards showing counts for today, pending, in progress, and completed installations
   - "Instalaciones de Hoy" section with compact cards for today's installations
   - "Próximas Instalaciones" section with compact cards for upcoming installations
   - Empty states for no installations
   - "Ver todas" link to full list

2. **Compact Installation Card Component** (`InstallationCardCompact.astro`):
   - Displays time, optional date, client name, address, status badge
   - Shows phone icon with client phone number
   - Payment indicator badge if `collect_payment` is true
   - Optional clickable link (hover states)
   - Responsive design for mobile and desktop

3. **Installations List Page** (`/installer/installations/index.astro`):
   - Header with total installation count
   - Status filter dropdown (Todos, Pendiente, En Progreso, Completada)
   - Filter and Clear buttons
   - Installations grouped by date (Spanish format: "lunes, 3 de diciembre de 2024")
   - Compact cards for each installation
   - Empty state if no installations

4. **Installation Detail Placeholder** (`/installer/installations/[id].astro`):
   - Simple card showing client name and installation type
   - Placeholder message: "Detalle completo disponible en Fase 13"
   - Redirect if installation not found or not assigned to current installer

### Architecture Principles

- **Mobile-First Design**: Optimized for installers using mobile devices in the field
- **Consistent UI**: Reuse existing UI components (Button, Select, Badge, EmptyState, StatusBadge)
- **Data-Driven**: Show installer-specific data only (installations assigned to them)
- **Security**: RLS policies enforce data access (installers can only see their assignments)
- **Accessibility**: WCAG 2.1 AA compliance for all interactive elements
- **Spanish Language**: All UI text in Spanish for target audience

---

## Implementation Status Summary

### Prerequisites

- Phase 01-11 completed (authentication, admin dashboard, installations CRUD, user management)
- `src/lib/queries/installations.ts` exists with query functions
- `src/components/ui/*` components available (Button, Select, Badge, EmptyState)
- `src/components/installations/StatusBadge.astro` available
- `DashboardLayout` available for page structure
- Middleware configured for `/installer/*` route protection

### Pending Tasks

- Frontend: Compact installation card component
- Frontend: Installer dashboard page
- Frontend: Installations list page (with filters and grouping)
- Frontend: Installation detail placeholder
- Backend: Query functions for installer-specific data (getInstallerTodayInstallations, getInstallerUpcomingInstallations, getInstallerStats)
- Testing: Unit tests for new query functions
- Testing: E2E tests for installer dashboard flows

---

## Detailed Implementation Checklist

## SETUP - Backend Queries for Installer Dashboard

### 1. Backend Queries Implementation

#### 1.1 Add Installer-Specific Queries

**File**: `src/lib/queries/installations.ts` (EXTEND EXISTING)

- [ ] **Import required types**
  - Import `InstallationStatus` from `@lib/supabase`
  - Verify existing imports: `createServerClient`, `Installation`, `InstallationWithInstaller`
  - Acceptance: All required types available

- [ ] **Implement `getInstallerTodayInstallations()` function**
  - Function signature: `async function getInstallerTodayInstallations(accessToken: string, installerId: string): Promise<InstallationWithInstaller[]>`
  - Get today's date range (start of day to end of day)
  - Query installations where `assigned_to = installerId` AND `scheduled_date >= today_start` AND `scheduled_date <= today_end`
  - Exclude archived installations (`archived_at IS NULL`)
  - Include installer details (join with users table)
  - Order by `scheduled_date` ascending
  - Return typed array of installations with installer
  - Acceptance: Function returns today's installations for specific installer

- [ ] **Implement `getInstallerUpcomingInstallations()` function**
  - Function signature: `async function getInstallerUpcomingInstallations(accessToken: string, installerId: string, limit: number = 10): Promise<InstallationWithInstaller[]>`
  - Get installations where `assigned_to = installerId` AND `scheduled_date > now()`
  - Exclude archived installations
  - Filter to `status IN ['pending', 'in_progress']`
  - Include installer details
  - Order by `scheduled_date` ascending
  - Limit to specified number (default 10)
  - Return typed array
  - Acceptance: Function returns upcoming installations for specific installer

- [ ] **Implement `getInstallerStats()` function**
  - Function signature: `async function getInstallerStats(accessToken: string, installerId: string): Promise<{ today: number; pending: number; inProgress: number; completed: number }>`
  - Query all non-archived installations where `assigned_to = installerId`
  - Calculate counts:
    - `today`: Count where `scheduled_date` is today
    - `pending`: Count where `status = 'pending'`
    - `inProgress`: Count where `status = 'in_progress'`
    - `completed`: Count where `status = 'completed'`
  - Return object with counts
  - Acceptance: Function returns correct stats for installer

- [ ] **Implement `getInstallerInstallationsByStatus()` function**
  - Function signature: `async function getInstallerInstallationsByStatus(accessToken: string, installerId: string, status?: InstallationStatus): Promise<InstallationWithInstaller[]>`
  - Query installations where `assigned_to = installerId`
  - Exclude archived installations
  - If status provided, filter by `status = status`
  - Include installer details
  - Order by `scheduled_date` descending
  - Return typed array
  - Acceptance: Function returns filtered installations for installer

- [ ] **Export all new query functions**
  - Export `getInstallerTodayInstallations`
  - Export `getInstallerUpcomingInstallations`
  - Export `getInstallerStats`
  - Export `getInstallerInstallationsByStatus`
  - Acceptance: All functions exported and available for import

**Estimated Time**: 1.5 hours

---

#### 1.2 Unit Tests for Installer Queries

**File**: `src/lib/queries/installations.test.ts` (NEW OR EXTEND EXISTING)

- [ ] **Setup test environment**
  - Import Vitest functions: `describe`, `it`, `expect`, `vi`, `beforeEach`
  - Import functions to test: `getInstallerTodayInstallations`, `getInstallerUpcomingInstallations`, `getInstallerStats`, `getInstallerInstallationsByStatus`
  - Mock `createServerClient` and Supabase query builder
  - Create mock installer data (ID, name, email)
  - Create mock installation data (today, upcoming, various statuses)
  - Acceptance: Test file structured with comprehensive mocks

- [ ] **Test: getInstallerTodayInstallations() success case**
  - Mock Supabase query to return 2 installations scheduled for today
  - Call function with installer ID
  - Assert returned array has 2 installations
  - Assert installations are for today's date
  - Assert `assigned_to` matches installer ID
  - Acceptance: Test passes for today's installations

- [ ] **Test: getInstallerTodayInstallations() no installations**
  - Mock Supabase query to return empty array
  - Call function with installer ID
  - Assert returned array is empty
  - Acceptance: Test passes for no installations

- [ ] **Test: getInstallerUpcomingInstallations() success case**
  - Mock Supabase query to return 5 upcoming installations
  - Call function with installer ID and limit 5
  - Assert returned array has 5 installations
  - Assert all have `scheduled_date > now()`
  - Assert ordered by scheduled_date ascending
  - Acceptance: Test passes for upcoming installations

- [ ] **Test: getInstallerUpcomingInstallations() respects limit**
  - Mock Supabase query to return limited results
  - Call function with limit 3
  - Assert returned array has max 3 installations
  - Acceptance: Test passes for limit parameter

- [ ] **Test: getInstallerStats() calculates counts correctly**
  - Mock Supabase query to return 10 installations with mixed statuses
  - Expected counts: today=2, pending=3, inProgress=2, completed=5
  - Call function with installer ID
  - Assert counts match expected values
  - Acceptance: Test passes for stats calculation

- [ ] **Test: getInstallerStats() handles zero installations**
  - Mock Supabase query to return empty array
  - Call function with installer ID
  - Assert all counts are 0
  - Acceptance: Test passes for zero installations

- [ ] **Test: getInstallerInstallationsByStatus() filters by status**
  - Mock Supabase query to return 3 pending installations
  - Call function with installer ID and status 'pending'
  - Assert returned array has only pending installations
  - Assert all have `status = 'pending'`
  - Acceptance: Test passes for status filter

- [ ] **Test: getInstallerInstallationsByStatus() returns all without filter**
  - Mock Supabase query to return 8 installations (various statuses)
  - Call function without status parameter
  - Assert returned array has all 8 installations
  - Acceptance: Test passes for no filter

- [ ] **Test: Error handling for all functions**
  - Mock Supabase query to throw error
  - Call each function
  - Assert error is thrown with descriptive message
  - Acceptance: All functions handle errors correctly

- [ ] **Run tests and verify coverage**
  - Execute `npm test` (or equivalent)
  - Verify all tests pass (9+ tests)
  - Check coverage for new query functions (aim for 100%)
  - Acceptance: All tests green, high coverage

**Estimated Time**: 2 hours

---

## IMPLEMENTATION - Components & Pages

### 2. Compact Installation Card Component

#### 2.1 Create InstallationCardCompact Component

**File**: `src/components/installations/InstallationCardCompact.astro` (NEW)

- [x] **Setup component structure**
  - Import `StatusBadge` from `@components/installations/StatusBadge.astro`
  - Import `Badge` from `@components/ui/Badge.astro`
  - Import `Installation` type from `@lib/queries/installer`
  - Define Props interface:
    - `installation: Installation` (required)
    - `href?: string` (optional link to detail page)
    - `showDate?: boolean` (default: false, show date in addition to time)
  - Destructure props with defaults
  - Acceptance: Component structure ready with TypeScript types

- [x] **Implement helper functions**
  - `formatTime(dateString: string | null): string`
    - If null, return 'Sin hora'
    - Return time formatted as "HH:mm" (e.g., "14:30")
    - Use Spanish locale: `date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })`
  - `formatDate(dateString: string | null): string`
    - If null, return 'Sin fecha'
    - Return date formatted as "DD/MM/YYYY" (e.g., "03/12/2024")
    - Use Spanish locale: `date.toLocaleDateString('es-ES')`
  - Acceptance: Helper functions format dates/times correctly

- [x] **Implement card layout**
  - Container: White background, rounded corners, border, padding
  - If `href` provided, wrap in `<a>` tag with hover effect (shadow-md transition)
  - If no `href`, static card (no hover)
  - Layout structure:
    - Top row: Time (bold) and Date (if showDate=true)
    - Second row: Client name (text-lg font-semibold)
    - Third row: Address with location icon (text-sm text-gray-600, truncate)
    - Fourth row: Status badge (right-aligned)
    - Fifth row (conditional): Phone icon + phone number (if client_phone exists)
    - Bottom row (conditional): Payment badge (if collect_payment=true, yellow badge "Cobro pendiente")
  - Acceptance: Card displays all information correctly

- [x] **Implement responsive design**
  - Mobile (< 640px): Single column, full width
  - Desktop (>= 640px): Maintain compact size
  - Test truncation for long addresses (max 2 lines with ellipsis)
  - Test with/without optional fields (phone, date)
  - Acceptance: Card responsive and handles missing data

- [x] **Implement accessibility**
  - If clickable, add `aria-label` to link: "Ver instalación de {client_name}"
  - Ensure keyboard navigation works (focus ring on link)
  - Ensure sufficient color contrast for all text
  - Acceptance: Card meets WCAG 2.1 AA

**Estimated Time**: 2 hours

---

### 3. Installer Dashboard Page

#### 3.1 Create Installer Dashboard Page

**File**: `src/pages/installer/index.astro` (NEW)

- [x] **Setup page structure**
  - Import `DashboardLayout` from `@layouts/DashboardLayout.astro`
  - Import `InstallationCardCompact` from `@components/installations/InstallationCardCompact.astro`
  - Import `Button` from `@components/ui/Button.astro`
  - Import `EmptyState` from `@components/ui/EmptyState.astro`
  - Import `Alert` from `@components/ui/Alert.astro`
  - Import `getUser` from `@lib/page-utils`
  - Import query functions: `getMyStats`, `getTodayInstallations`, `getUpcomingInstallations`
  - Get user from `Astro.locals.user`
  - Get access token from cookies: `Astro.cookies.get('sb-access-token')?.value ?? ''`
  - Acceptance: Page imports complete

- [x] **Implement data fetching**
  - Initialize variables: `stats`, `todayInstallations`, `upcomingInstallations`, `error`
  - Use `Promise.all()` to fetch data in parallel:
    - `getMyStats(accessToken, user.id)`
    - `getTodayInstallations(accessToken, user.id)`
    - `getUpcomingInstallations(accessToken, user.id, 5)`
  - Wrap in try/catch, set `error` message on failure
  - Acceptance: Data fetched efficiently

- [x] **Implement helper functions**
  - `formatGreetingDate(): string`
    - Format today's date as "lunes, 3 de diciembre de 2024"
    - Use Spanish locale: `new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`
    - Capitalize first letter
  - `getFirstName(fullName: string): string`
    - Split full name by space, return first part
    - Fallback to full name if no space
  - Acceptance: Helper functions work correctly

- [x] **Implement page header**
  - Title: "Dashboard" (text-2xl font-bold)
  - Greeting: "Hola, {firstName}" (text-xl)
  - Date: Formatted date below greeting (text-gray-600)
  - Acceptance: Header displays personalized greeting

- [x] **Implement stats cards grid**
  - 4 cards in responsive grid:
    - Mobile: 2 columns (grid-cols-2)
    - Desktop: 4 columns (md:grid-cols-4)
  - Card 1: "Hoy" - Count of today's installations (bg-primary-100, text-primary-600)
  - Card 2: "Pendientes" - Count of pending installations (bg-yellow-100, text-yellow-600)
  - Card 3: "En Progreso" - Count of in-progress installations (bg-blue-100, text-blue-600)
  - Card 4: "Completadas" - Count of completed installations (bg-green-100, text-green-600)
  - Each card: Icon + label + count
  - Acceptance: Stats cards display correctly

- [x] **Implement "Instalaciones de Hoy" section**
  - Section header: "Instalaciones de Hoy" (text-lg font-semibold)
  - If `todayInstallations.length === 0`:
    - Show EmptyState: "No tienes instalaciones programadas para hoy"
  - Else:
    - Grid of compact cards (grid-cols-1 sm:grid-cols-2 gap-4)
    - Map over `todayInstallations`
    - Render `InstallationCardCompact` with:
      - `installation={installation}`
      - `href="/installer/installations/{installation.id}"`
      - `showDate={false}` (time only, since all are today)
  - Acceptance: Today's installations displayed with compact cards

- [x] **Implement "Próximas Instalaciones" section**
  - Section header: "Próximas Instalaciones" (text-lg font-semibold)
  - Link to full list: "Ver todas" (text-primary-600, right-aligned)
  - If `upcomingInstallations.length === 0`:
    - Show EmptyState: "No tienes instalaciones próximas programadas"
  - Else:
    - Grid of compact cards (grid-cols-1 sm:grid-cols-2 gap-4)
    - Map over `upcomingInstallations`
    - Render `InstallationCardCompact` with:
      - `installation={installation}`
      - `href="/installer/installations/{installation.id}"`
      - `showDate={true}` (show both date and time)
  - Acceptance: Upcoming installations displayed with date

- [x] **Implement error handling**
  - If `error` exists, display Alert component at top:
    - Variant: "error"
    - Title: "Error al cargar datos"
    - Message: `{error}`
  - Acceptance: Errors displayed to user

- [x] **Wrap in DashboardLayout**
  - Pass `title="Dashboard"` and `user={user}` to layout
  - Acceptance: Page uses layout correctly

**Estimated Time**: 2.5 hours

---

### 4. Installations List Page (Installer)

#### 4.1 Create Installations List Page

**File**: `src/pages/installer/installations/index.astro` (NEW)

- [x] **Setup page structure**
  - Import `DashboardLayout` from `@layouts/DashboardLayout.astro`
  - Import `InstallationCardCompact` from `@components/installations/InstallationCardCompact.astro`
  - Import `Button` from `@components/ui/Button.astro`
  - Import `Select` from `@components/ui/Select.astro`
  - Import `EmptyState` from `@components/ui/EmptyState.astro`
  - Import `getUser` from `@lib/page-utils`
  - Import `getMyInstallations` from `@lib/queries/installer`
  - Import `InstallationStatus` type from `@lib/supabase`
  - Get user from `Astro.locals.user`
  - Get access token from cookies
  - Acceptance: Page imports complete

- [x] **Implement query parameter handling**
  - Get URL params: `const url = Astro.url`
  - Extract status filter: `const statusFilter = url.searchParams.get('status') as InstallationStatus | null`
  - Acceptance: Status filter captured from URL

- [x] **Implement data fetching**
  - Fetch installations: `const installations = await getMyInstallations(accessToken, user.id, statusFilter ? { status: statusFilter } : undefined)`
  - Handle errors (try/catch)
  - Acceptance: Installations fetched with optional filter

- [x] **Implement helper functions**
  - `formatDateGroup(dateString: string): string`
    - Parse date and format as "lunes, 3 de diciembre de 2024"
    - Use Spanish locale: `new Date(dateString).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`
    - Capitalize first letter
  - `groupInstallationsByDate(installations: Installation[]): Map<string, Installation[]>`
    - Group installations by `scheduled_date` (date part only, ignore time)
    - Return Map with date string as key, array of installations as value
    - Sort dates chronologically (oldest first)
  - Acceptance: Grouping logic works correctly

- [x] **Implement page header**
  - Title: "Instalaciones" (text-2xl font-bold)
  - Count: "{installations.length} instalación{installations.length !== 1 ? 'es' : ''}" (text-gray-600)
  - Acceptance: Header displays title and count

- [x] **Implement status filter form**
  - Form with GET method (reloads page with query params)
  - Select dropdown with options:
    - { value: '', label: 'Todos los estados' }
    - { value: 'pending', label: 'Pendiente' }
    - { value: 'in_progress', label: 'En Progreso' }
    - { value: 'completed', label: 'Completada' }
  - Selected value: `statusFilter ?? ''`
  - Buttons:
    - "Filtrar" (type="submit", primary button)
    - "Limpiar" (href="/installer/installations", secondary button)
  - Responsive: Stack on mobile, inline on desktop
  - Acceptance: Filter form works and updates URL

- [x] **Implement installations grouped list**
  - If `installations.length === 0`:
    - Show EmptyState: "No tienes instalaciones asignadas" with description based on filter
  - Else:
    - Group installations by date using `groupInstallationsByDate()`
    - Iterate over grouped map:
      - Section header: Date formatted with `formatDateGroup()` (text-lg font-semibold mb-4)
      - Grid of compact cards for that date (grid-cols-1 sm:grid-cols-2 gap-4)
      - Render `InstallationCardCompact` with:
        - `installation={installation}`
        - `href="/installer/installations/{installation.id}"`
        - `showDate={false}` (since grouped by date, only show time)
    - Add spacing between date groups (mb-8)
  - Acceptance: Installations grouped and displayed correctly

- [x] **Wrap in DashboardLayout**
  - Pass `title="Instalaciones"` and `user={user}` to layout
  - Acceptance: Page uses layout correctly

**Estimated Time**: 2.5 hours

---

### 5. Installation Detail Placeholder

#### 5.1 Create Installation Detail Placeholder Page

**File**: `src/pages/installer/installations/[id].astro` (NEW)

- [x] **Setup page structure**
  - Import `DashboardLayout` from `@layouts/DashboardLayout.astro`
  - Import `Button` from `@components/ui/Button.astro'
  - Import `StatusBadge` from `@components/installations/StatusBadge.astro`
  - Import `getUser` from `@lib/page-utils`
  - Import `getMyInstallationById` from `@lib/queries/installer`
  - Get user from `Astro.locals.user`
  - Get access token from cookies
  - Get route param: `const { id } = Astro.params`
  - Acceptance: Page imports complete

- [x] **Implement data fetching and validation**
  - Fetch installation: `const installation = await getMyInstallationById(accessToken, user.id, id)`
  - If installation is null:
    - Redirect to `/installer/installations` with error query param
    - `return Astro.redirect('/installer/installations?error=not-found')`
  - RLS ensures only assigned installations are returned
  - Acceptance: Validates installation exists and belongs to installer

- [x] **Implement page header**
  - Breadcrumb navigation:
    - Link: "Instalaciones" → `/installer/installations`
    - Current: `{installation.client_name}`
  - Title: Client name (text-2xl font-bold)
  - Subtitle: Installation type (text-gray-600)
  - Acceptance: Header with breadcrumbs

- [x] **Implement placeholder card**
  - White card with border and padding
  - Icon: Info icon (blue circle with "i")
  - Title: "Detalle Completo en Fase 13" (text-xl font-semibold)
  - Message: "La funcionalidad completa para ver y actualizar detalles de instalación estará disponible en la Fase 13." (text-gray-600)
  - Basic info display:
    - Cliente: `{installation.client_name}`
    - Dirección: `{installation.address}`
    - Estado: StatusBadge component
    - Fecha programada: formatted date (if exists)
    - Teléfono: client phone (if exists)
  - Button: "Volver a Instalaciones" (href="/installer/installations")
  - Acceptance: Placeholder card displays basic info

- [x] **Wrap in DashboardLayout**
  - Pass `title={installation.client_name}` and `user={user}` to layout
  - Acceptance: Page uses layout correctly

**Estimated Time**: 1 hour

---

## TESTING - Comprehensive E2E Tests

### 6. E2E Tests - Installer Dashboard

#### 6.1 Create Installer Dashboard E2E Test

**File**: `e2e/installer-dashboard.spec.ts` (NEW)

- [ ] **Setup test structure**
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Import auth helper: `import { loginAsInstaller } from './helpers/auth'`
  - Create describe block: "Installer Dashboard"
  - Setup: Login as installer before each test
  - Acceptance: Test file structure ready

- [ ] **Test: Display personalized greeting**
  - Navigate to `/installer`
  - Check: "Hola, {firstName}" visible (use first name of test installer)
  - Check: Formatted date visible (Spanish format with day of week)
  - Acceptance: Greeting displays correctly

- [ ] **Test: Display stats cards**
  - Navigate to `/installer`
  - Check: "Hoy" card visible with count
  - Check: "Pendientes" card visible with count
  - Check: "En Progreso" card visible with count
  - Check: "Completadas" card visible with count
  - Verify counts are numbers (not NaN or null)
  - Acceptance: All 4 stats cards display

- [ ] **Test: Display today's installations section**
  - Navigate to `/installer`
  - Check: "Instalaciones de Hoy" heading visible
  - If installations exist:
    - Check: Compact cards visible
    - Check: Each card shows time (not full date)
    - Check: Each card shows client name, address, status
  - Acceptance: Today's section displays correctly

- [ ] **Test: Display upcoming installations section**
  - Navigate to `/installer`
  - Check: "Próximas Instalaciones" heading visible
  - Check: "Ver todas" link visible and points to `/installer/installations`
  - If installations exist:
    - Check: Compact cards visible
    - Check: Each card shows date AND time
    - Check: Each card shows client name, address, status
  - Acceptance: Upcoming section displays correctly

- [ ] **Test: Empty state for no today's installations**
  - Setup: Test installer with no installations today
  - Navigate to `/installer`
  - Check: EmptyState component visible
  - Check: Message "No tienes instalaciones programadas para hoy"
  - Acceptance: Empty state displays for no installations

- [ ] **Test: Empty state for no upcoming installations**
  - Setup: Test installer with no upcoming installations
  - Navigate to `/installer`
  - Check: EmptyState component visible in upcoming section
  - Check: Message "No tienes instalaciones próximas programadas"
  - Acceptance: Empty state displays for upcoming section

- [ ] **Test: Click compact card navigates to detail**
  - Setup: Test installer with at least 1 installation
  - Navigate to `/installer`
  - Click first compact card
  - Check: URL changes to `/installer/installations/{id}`
  - Check: Detail page loads (placeholder in Phase 12)
  - Acceptance: Card click navigates correctly

- [ ] **Test: Click "Ver todas" navigates to list**
  - Navigate to `/installer`
  - Click "Ver todas" link
  - Check: URL changes to `/installer/installations`
  - Check: List page loads with all installations
  - Acceptance: Link navigates to installations list

- [ ] **Test: Responsive stats grid**
  - Set viewport to mobile (375x667)
  - Navigate to `/installer`
  - Check: Stats cards in 2-column grid (grid-cols-2)
  - Set viewport to desktop (1440x900)
  - Check: Stats cards in 4-column grid (md:grid-cols-4)
  - Acceptance: Grid responsive

- [ ] **Test: Responsive installations grid**
  - Set viewport to mobile (375x667)
  - Navigate to `/installer`
  - Check: Compact cards stack vertically (1 column)
  - Set viewport to desktop (1440x900)
  - Check: Compact cards in 2 columns (sm:grid-cols-2)
  - Acceptance: Cards responsive

**Estimated Time**: 2.5 hours

---

### 7. E2E Tests - Installations List (Installer)

#### 7.1 Create Installations List E2E Test

**File**: `e2e/installer-installations-list.spec.ts` (NEW)

- [ ] **Setup test structure**
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Import auth helper: `import { loginAsInstaller } from './helpers/auth'`
  - Create describe block: "Installer Installations List"
  - Setup: Login as installer before each test
  - Acceptance: Test file structure ready

- [ ] **Test: Display page header with count**
  - Navigate to `/installer/installations`
  - Check: "Instalaciones" heading visible
  - Check: Count displays (e.g., "12 instalaciones")
  - Check: Plural/singular grammar correct
  - Acceptance: Header displays title and count

- [ ] **Test: Display status filter form**
  - Navigate to `/installer/installations`
  - Check: Select dropdown visible with options
  - Check: Options include "Todos los estados", "Pendiente", "En Progreso", "Completada"
  - Check: "Filtrar" button visible
  - Check: "Limpiar" button visible
  - Acceptance: Filter form displays correctly

- [ ] **Test: Filter installations by status**
  - Navigate to `/installer/installations`
  - Select "Pendiente" from dropdown
  - Click "Filtrar" button
  - Check: URL changes to `/installer/installations?status=pending`
  - Check: Only pending installations displayed
  - Check: Each card has yellow "Pendiente" badge
  - Acceptance: Status filter works

- [ ] **Test: Clear filter**
  - Navigate to `/installer/installations?status=pending`
  - Click "Limpiar" button
  - Check: URL changes to `/installer/installations` (no query params)
  - Check: All installations displayed (no filter)
  - Acceptance: Clear filter works

- [ ] **Test: Installations grouped by date**
  - Navigate to `/installer/installations`
  - Check: Date headers visible (Spanish format: "lunes, 3 de diciembre de 2024")
  - Check: Installations grouped under correct date headers
  - Check: Dates ordered chronologically (oldest first)
  - Check: Each group has compact cards
  - Acceptance: Grouping by date works

- [ ] **Test: Compact cards display correctly**
  - Navigate to `/installer/installations`
  - Find first compact card
  - Check: Time displayed (HH:mm format)
  - Check: Client name displayed
  - Check: Address displayed (truncated if long)
  - Check: Status badge displayed
  - Check: No full date displayed (only time, since grouped by date)
  - Acceptance: Compact cards show correct info

- [ ] **Test: Click card navigates to detail**
  - Navigate to `/installer/installations`
  - Click first compact card
  - Check: URL changes to `/installer/installations/{id}`
  - Check: Detail page loads (placeholder)
  - Acceptance: Navigation works

- [ ] **Test: Empty state for no installations**
  - Setup: Test installer with no installations
  - Navigate to `/installer/installations`
  - Check: EmptyState component visible
  - Check: Message "No tienes instalaciones asignadas"
  - Acceptance: Empty state displays

- [ ] **Test: Empty state for filtered results**
  - Navigate to `/installer/installations?status=cancelled`
  - If no cancelled installations:
    - Check: EmptyState visible
    - Check: Message indicates no installations match filter
  - Acceptance: Empty state for filtered results

- [ ] **Test: Responsive filter form**
  - Set viewport to mobile (375x667)
  - Navigate to `/installer/installations`
  - Check: Filter elements stack vertically
  - Set viewport to desktop (1440x900)
  - Check: Filter elements inline horizontally
  - Acceptance: Form responsive

- [ ] **Test: Responsive installations grid**
  - Set viewport to mobile (375x667)
  - Navigate to `/installer/installations`
  - Check: Cards stack vertically (1 column)
  - Set viewport to desktop (1440x900)
  - Check: Cards in 2 columns (sm:grid-cols-2)
  - Acceptance: Grid responsive

**Estimated Time**: 2.5 hours

---

### 8. E2E Tests - Installation Detail Placeholder

#### 8.1 Create Detail Placeholder E2E Test

**File**: `e2e/installer-installation-detail.spec.ts` (NEW)

- [ ] **Setup test structure**
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Import auth helper: `import { loginAsInstaller } from './helpers/auth'`
  - Create describe block: "Installer Installation Detail"
  - Setup: Login as installer before each test
  - Acceptance: Test file structure ready

- [ ] **Test: Display breadcrumb navigation**
  - Setup: Get first installation ID for test installer
  - Navigate to `/installer/installations/{id}`
  - Check: Breadcrumb visible with "Instalaciones" link
  - Check: Current breadcrumb shows client name
  - Click "Instalaciones" link
  - Check: Navigates back to `/installer/installations`
  - Acceptance: Breadcrumb navigation works

- [ ] **Test: Display page header**
  - Navigate to `/installer/installations/{id}`
  - Check: Client name displayed as title (text-2xl)
  - Check: Installation type displayed as subtitle
  - Acceptance: Header displays correctly

- [ ] **Test: Display placeholder card**
  - Navigate to `/installer/installations/{id}`
  - Check: Info icon visible
  - Check: Title "Detalle Completo en Fase 13" visible
  - Check: Placeholder message visible
  - Check: Basic info displayed (Cliente, Dirección, Estado)
  - Check: StatusBadge component visible
  - Acceptance: Placeholder card displays

- [ ] **Test: Display "Volver a Instalaciones" button**
  - Navigate to `/installer/installations/{id}`
  - Check: Button visible with text "Volver a Instalaciones"
  - Click button
  - Check: Navigates to `/installer/installations`
  - Acceptance: Button navigates correctly

- [ ] **Test: Redirect if installation not found**
  - Navigate to `/installer/installations/00000000-0000-0000-0000-000000000000` (invalid ID)
  - Check: Redirects to `/installer/installations`
  - Check: URL contains error query param (error=not-found)
  - Acceptance: Redirect works for not found

- [ ] **Test: Redirect if installation not assigned**
  - Setup: Get installation ID assigned to different installer
  - Navigate to `/installer/installations/{other_installer_id}`
  - Check: Redirects to `/installer/installations`
  - Check: URL contains error query param (error=not-assigned)
  - Acceptance: Redirect works for not assigned

- [ ] **Test: Display error message after redirect**
  - Navigate to `/installer/installations?error=not-found`
  - Check: Error message visible (Alert component or similar)
  - Check: Message indicates installation not found
  - Acceptance: Error message displays

**Estimated Time**: 1.5 hours

---

### 9. E2E Tests - Compact Installation Card Component

#### 9.1 Create Component E2E Test

**File**: `e2e/installation-card-compact.spec.ts` (NEW)

- [ ] **Setup test structure**
  - Import Playwright: `import { test, expect } from '@playwright/test'`
  - Import auth helper: `import { loginAsInstaller } from './helpers/auth'`
  - Create describe block: "InstallationCardCompact Component"
  - Setup: Login as installer and navigate to dashboard
  - Acceptance: Test file structure ready

- [ ] **Test: Display time**
  - Navigate to `/installer` (dashboard with today's installations)
  - Find first compact card
  - Check: Time displayed in HH:mm format (e.g., "14:30")
  - Check: Time is bold or emphasized
  - Acceptance: Time displays correctly

- [ ] **Test: Display date when showDate=true**
  - Navigate to `/installer` (upcoming installations section)
  - Find first compact card
  - Check: Date displayed in DD/MM/YYYY format (e.g., "03/12/2024")
  - Check: Both date and time visible
  - Acceptance: Date displays when enabled

- [ ] **Test: Hide date when showDate=false**
  - Navigate to `/installer` (today's installations section)
  - Find first compact card
  - Check: Only time visible, no full date
  - Acceptance: Date hidden when disabled

- [ ] **Test: Display client name**
  - Find compact card
  - Check: Client name visible (text-lg font-semibold)
  - Acceptance: Client name displays

- [ ] **Test: Display address with icon**
  - Find compact card
  - Check: Location icon visible
  - Check: Address text visible (truncated if long)
  - Acceptance: Address displays with icon

- [ ] **Test: Display status badge**
  - Find compact card with specific status (e.g., pending)
  - Check: StatusBadge component visible
  - Check: Badge shows correct status (e.g., "Pendiente" with yellow color)
  - Acceptance: Status badge displays

- [ ] **Test: Display phone number with icon**
  - Setup: Installation with client_phone populated
  - Find compact card
  - Check: Phone icon visible
  - Check: Phone number displayed (formatted)
  - Acceptance: Phone displays with icon

- [ ] **Test: Hide phone when not available**
  - Setup: Installation without client_phone
  - Find compact card
  - Check: Phone icon NOT visible
  - Check: No phone number displayed
  - Acceptance: Phone hidden when missing

- [ ] **Test: Display payment badge when collect_payment=true**
  - Setup: Installation with collect_payment=true
  - Find compact card
  - Check: Yellow badge visible with text "Cobro pendiente"
  - Acceptance: Payment badge displays

- [ ] **Test: Hide payment badge when collect_payment=false**
  - Setup: Installation with collect_payment=false
  - Find compact card
  - Check: No payment badge visible
  - Acceptance: Payment badge hidden

- [ ] **Test: Card is clickable when href provided**
  - Find compact card with href
  - Check: Card is wrapped in <a> tag
  - Hover over card
  - Check: Shadow effect on hover (hover:shadow-md)
  - Click card
  - Check: Navigation works
  - Acceptance: Clickable card works

- [ ] **Test: Card is not clickable when href not provided**
  - Setup: Render card without href (modify test data)
  - Find compact card
  - Check: Card is NOT wrapped in <a> tag
  - Check: No hover effect
  - Acceptance: Static card works

- [ ] **Test: Keyboard navigation for clickable card**
  - Tab to compact card link
  - Check: Focus ring visible (keyboard navigation)
  - Press Enter
  - Check: Navigation works
  - Acceptance: Keyboard navigation works

- [ ] **Test: Truncation for long address**
  - Setup: Installation with very long address (>100 characters)
  - Find compact card
  - Check: Address truncated with ellipsis (...)
  - Check: Maximum 2 lines displayed
  - Acceptance: Long addresses truncated

**Estimated Time**: 2 hours

---

## VERIFICATION - Manual Testing Checklist

### 10. Manual Testing

#### 10.1 Installer Dashboard

- [ ] **Verify personalized greeting**
  - Login as installer
  - Navigate to `/installer`
  - Check: Greeting shows first name correctly
  - Check: Date formatted in Spanish (e.g., "lunes, 3 de diciembre de 2024")
  - Check: First letter of date is capitalized
  - Acceptance: Greeting displays correctly

- [ ] **Verify stats cards**
  - Check: All 4 stats cards visible
  - Check: "Hoy" card shows count of today's installations (primary-600 color)
  - Check: "Pendientes" card shows count of pending (yellow-600 color)
  - Check: "En Progreso" card shows count of in-progress (blue-600 color)
  - Check: "Completadas" card shows count of completed (green-600 color)
  - Check: Numbers are accurate (match database)
  - Acceptance: Stats cards display correct data

- [ ] **Verify today's installations section**
  - Check: "Instalaciones de Hoy" heading visible
  - If installations exist:
    - Check: Compact cards displayed
    - Check: Each card shows time only (no date)
    - Check: Each card shows client name, address, status
    - Check: Cards are clickable (hover effect)
  - If no installations:
    - Check: EmptyState component visible
    - Check: Message "No tienes instalaciones programadas para hoy"
  - Acceptance: Today's section works correctly

- [ ] **Verify upcoming installations section**
  - Check: "Próximas Instalaciones" heading visible
  - Check: "Ver todas" link visible and works
  - If installations exist:
    - Check: Compact cards displayed
    - Check: Each card shows date AND time
    - Check: Cards are clickable
  - If no installations:
    - Check: EmptyState component visible
    - Check: Message "No tienes instalaciones próximas programadas"
  - Acceptance: Upcoming section works correctly

- [ ] **Verify navigation**
  - Click compact card in today's section
  - Check: Navigates to `/installer/installations/{id}`
  - Go back
  - Click "Ver todas" link
  - Check: Navigates to `/installer/installations`
  - Acceptance: Navigation works

- [ ] **Verify error handling**
  - Simulate Supabase error (disconnect network or use invalid token)
  - Refresh dashboard
  - Check: Alert component displays error message
  - Check: Page doesn't crash (graceful error handling)
  - Acceptance: Errors handled gracefully

#### 10.2 Installations List Page

- [ ] **Verify page header**
  - Navigate to `/installer/installations`
  - Check: "Instalaciones" heading visible
  - Check: Count displays correctly (e.g., "12 instalaciones")
  - Check: Singular form for 1 installation ("1 instalación")
  - Acceptance: Header displays correctly

- [ ] **Verify status filter**
  - Check: Select dropdown visible with all options
  - Select "Pendiente"
  - Click "Filtrar"
  - Check: URL updates to include `?status=pending`
  - Check: Only pending installations displayed
  - Check: All displayed cards have yellow "Pendiente" badge
  - Acceptance: Filter works correctly

- [ ] **Verify clear filter**
  - Apply filter (e.g., "Pendiente")
  - Click "Limpiar" button
  - Check: URL resets to `/installer/installations` (no query params)
  - Check: All installations displayed (no filter)
  - Acceptance: Clear filter works

- [ ] **Verify date grouping**
  - Check: Installations grouped by date
  - Check: Date headers formatted in Spanish (e.g., "lunes, 3 de diciembre de 2024")
  - Check: First letter capitalized
  - Check: Dates ordered chronologically (oldest first)
  - Check: Each group contains correct installations
  - Acceptance: Grouping works correctly

- [ ] **Verify compact cards**
  - Find a compact card
  - Check: Time displayed (HH:mm format)
  - Check: Client name displayed
  - Check: Address displayed (truncated if long)
  - Check: Status badge displayed
  - Check: Phone icon and number if available
  - Check: Payment badge if collect_payment=true
  - Check: Cards are clickable (hover effect)
  - Acceptance: Cards display all information

- [ ] **Verify navigation from list**
  - Click a compact card
  - Check: Navigates to `/installer/installations/{id}`
  - Check: Detail page loads
  - Acceptance: Navigation works

- [ ] **Verify empty states**
  - Test scenario: Installer with no installations
  - Navigate to `/installer/installations`
  - Check: EmptyState component visible
  - Check: Message "No tienes instalaciones asignadas"
  - Apply filter that returns no results
  - Check: EmptyState visible with appropriate message
  - Acceptance: Empty states display correctly

#### 10.3 Installation Detail Placeholder

- [ ] **Verify breadcrumb navigation**
  - Navigate to installation detail page
  - Check: Breadcrumb visible
  - Check: "Instalaciones" link works (navigates back)
  - Check: Current breadcrumb shows client name
  - Acceptance: Breadcrumb works

- [ ] **Verify page header**
  - Check: Client name displayed as title
  - Check: Installation type displayed as subtitle
  - Acceptance: Header displays correctly

- [ ] **Verify placeholder card**
  - Check: Info icon visible
  - Check: Title "Detalle Completo en Fase 13" visible
  - Check: Placeholder message visible
  - Check: Basic info displayed:
    - Cliente: {client_name}
    - Dirección: {address}
    - Estado: StatusBadge component
  - Acceptance: Placeholder card displays

- [ ] **Verify "Volver a Instalaciones" button**
  - Check: Button visible
  - Click button
  - Check: Navigates to `/installer/installations`
  - Acceptance: Button works

- [ ] **Verify access control**
  - Test scenario: Navigate to installation assigned to different installer
  - Check: Redirects to `/installer/installations`
  - Check: Error query param in URL (`error=not-assigned`)
  - Test scenario: Navigate to non-existent installation ID
  - Check: Redirects to `/installer/installations`
  - Check: Error query param in URL (`error=not-found`)
  - Acceptance: Access control works

#### 10.4 Responsive Design

- [ ] **Test mobile layout (375px)**
  - Resize browser to 375px width
  - Dashboard:
    - Check: Stats cards in 2-column grid
    - Check: Compact cards stack vertically (1 column)
  - Installations list:
    - Check: Filter form elements stack vertically
    - Check: Compact cards stack vertically
  - Detail page:
    - Check: Breadcrumb wraps if needed
    - Check: Content fits in narrow viewport
  - Acceptance: Mobile layout works

- [ ] **Test tablet layout (768px)**
  - Resize browser to 768px width
  - Dashboard:
    - Check: Stats cards in 4 columns (md:grid-cols-4)
    - Check: Compact cards in 2 columns (sm:grid-cols-2)
  - Installations list:
    - Check: Filter form inline
    - Check: Compact cards in 2 columns
  - Acceptance: Tablet layout works

- [ ] **Test desktop layout (1440px)**
  - Resize browser to 1440px width
  - All pages:
    - Check: Content uses available space well
    - Check: No awkward stretching or compression
  - Acceptance: Desktop layout works

#### 10.5 Accessibility

- [ ] **Verify keyboard navigation**
  - Use Tab key to navigate through all interactive elements
  - Dashboard:
    - Tab through compact cards
    - Check: Focus ring visible on cards
    - Press Enter on focused card
    - Check: Navigation works
  - Installations list:
    - Tab through filter form
    - Tab through compact cards
    - Check: All elements reachable via keyboard
  - Acceptance: Full keyboard support

- [ ] **Verify screen reader compatibility**
  - Run screen reader (NVDA/JAWS/VoiceOver)
  - Dashboard:
    - Check: Stats cards announced with label and count
    - Check: Compact cards announced with client name and status
  - Installations list:
    - Check: Filter form labels announced
    - Check: Date group headers announced
    - Check: Cards announced with relevant info
  - Acceptance: Screen reader navigation works

- [ ] **Verify color contrast**
  - Use browser DevTools or contrast checker
  - Check: All text meets WCAG AA (4.5:1 for normal text)
  - Check: Stats card colors have sufficient contrast
  - Check: Badge colors (yellow, blue, green) have sufficient contrast
  - Acceptance: All colors pass WCAG AA

- [ ] **Verify focus indicators**
  - Tab through all interactive elements
  - Check: Focus ring visible on all focusable elements
  - Check: Focus ring color contrasts with background
  - Acceptance: Focus indicators visible

---

## Summary

### Total Estimated Time: 18-20 hours

**Breakdown**:

- Backend queries & tests: 3.5 hours
- Components (InstallationCardCompact): 2 hours
- Dashboard page: 2.5 hours
- Installations list page: 2.5 hours
- Detail placeholder page: 1 hour
- E2E testing: 8.5 hours
- Manual testing & verification: 2 hours

### Key Deliverables

1. **Backend**: Installer-specific query functions (today, upcoming, stats, by status)
2. **Component**: InstallationCardCompact (reusable compact card for mobile)
3. **Frontend**: Installer dashboard with greeting, stats, today's installations, upcoming installations
4. **Frontend**: Installations list page with status filter and date grouping
5. **Frontend**: Installation detail placeholder (full detail in Phase 13)
6. **Testing**: Comprehensive unit tests for query functions
7. **Testing**: Comprehensive E2E tests for all installer flows
8. **Quality**: Responsive design, accessibility compliance, Spanish language

### Success Criteria

- All unit tests pass (100% coverage for new query functions)
- All E2E tests pass (dashboard, list, detail, component tests)
- Manual testing checklist complete (all items verified)
- Code follows existing patterns (admin pages, DashboardLayout)
- Responsive on mobile (375px), tablet (768px), desktop (1440px)
- WCAG 2.1 AA accessibility compliance
- Spanish language for all UI text
- RLS policies enforce data access (installers see only their assignments)
- Compact card component reusable for other features

### Next Phase

After Phase 12 completion, proceed to:

- **Phase 13**: Installer Installation Detail (view full details, update status, mark completion, upload photos)
