# Phase 13: Installer Update - Frontend Architecture

## Overview

This document provides the complete frontend implementation plan for Phase 13: Installer Update functionality. The installer can update installation status, add/edit notes, and manage materials for their assigned installations.

**Backend Status**: READY (see PHASE_11_BACKEND_SUMMARY.md)

**Backend Functions Available**:

- `updateInstallationStatus(accessToken, id, userId, status)` - Returns ActionResult
- `updateInstallationNotes(accessToken, id, userId, notes)` - Returns ActionResult
- `addMaterial(accessToken, id, userId, description)` - Returns ActionResult
- `deleteMaterial(accessToken, materialId, userId)` - Returns ActionResult
- `getMaterialsByInstallation(accessToken, id)` - Returns Material[]

---

## Architecture Decisions

### Component Structure

1. **MaterialsList Component** - Reusable component to display and manage materials
2. **Installation Detail Page** - Full-featured page with forms, cards, and state management
3. **No Confirmation Modal** - Simplified approach using inline form confirmation (removed from requirements)

### Form Handling Strategy

- All forms use POST method with hidden `_action` field
- Server-side validation and authorization
- Alert notifications for success/error states
- Data reloading after mutations to show updated state

### Layout Pattern

- 2-column layout on desktop (lg:grid-cols-3 with 2-col main + 1-col sidebar)
- Single column on mobile
- Responsive cards with proper spacing

### Security Considerations

- Installer cannot set status to 'cancelled' (backend validates)
- All forms disabled if installation.status === 'cancelled'
- Server-side ownership verification (installer can only update their installations)

---

## Implementation Checklist

### Task 1: Create MaterialsList Component

**File**: `src/components/installations/MaterialsList.astro`

**Purpose**: Reusable component to display and manage installation materials

**Props**:

```typescript
interface Props {
  materials: Material[];
  installationId: string;
  editable?: boolean; // default: false
}
```

**Features**:

- Display list of materials with description and timestamp
- Empty state: "No hay materiales registrados"
- If editable=true:
  - Form to add new material (input + button with plus icon)
  - Delete button per material (trash icon)
- Form submission via POST with hidden \_action field

**Styling**:

- Form: Flex layout with input (flex-1) and button
- Material items: Gray background cards (bg-gray-50) with rounded corners
- Delete button: Text-gray-400 hover:text-red-500 with transition

**Date Formatting**:

```typescript
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

**Acceptance Criteria**:

- ✅ Component renders materials list
- ✅ Add material form appears when editable=true
- ✅ Delete buttons appear when editable=true
- ✅ Empty state displays when no materials
- ✅ Forms use POST with \_action field
- ✅ Timestamps formatted correctly

---

### Task 2: Create Installation Detail Page

**File**: `src/pages/installer/installations/[id].astro` (REPLACE existing placeholder)

**Purpose**: Full-featured installer page to view and update installation details

**Data Loading**:

```typescript
// Get installation data
const installation = await getMyInstallationById(accessToken, user.id, id!);
if (!installation) return Astro.redirect('/installer/installations');

// Get materials
const materials = await getMaterialsByInstallation(accessToken, id!);
```

**Form Processing** (POST method):

```typescript
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const action = formData.get('_action');

  if (action === 'update_status') {
    const status = formData.get('status') as InstallationStatus;
    const result = await updateInstallationStatus(accessToken, id!, user.id, status);
    // Handle result, reload data, set success/error
  } else if (action === 'update_notes') {
    // Similar pattern
  } else if (action === 'add_material') {
    // Similar pattern
  } else if (action === 'delete_material') {
    // Similar pattern
  }
}
```

**Layout Structure**:

```html
<DashboardLayout>
  <!-- Breadcrumb -->
  <nav>Dashboard / Instalaciones / {client_name}</nav>

  <!-- Alerts (if error or success) -->
  {error && <Alert variant="error">{error}</Alert>} {success &&
  <Alert variant="success">{success}</Alert>}

  <!-- 2-Column Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Column (lg:col-span-2) -->
    <div class="space-y-6">
      <!-- Header Card -->
      <!-- Status Update Form Card -->
      <!-- Notes Card -->
      <!-- Materials Card -->
    </div>

    <!-- Sidebar Column -->
    <div class="space-y-6">
      <!-- Scheduled Date/Time Card -->
      <!-- Contact Card -->
      <!-- Payment Badge Card (if collect_payment) -->
    </div>
  </div>
</DashboardLayout>
```

**Acceptance Criteria**:

- ✅ Page loads installation data
- ✅ Breadcrumb navigation displayed
- ✅ Alert messages show after form submissions
- ✅ 2-column layout on desktop, 1-column on mobile
- ✅ All forms process correctly
- ✅ Data reloads after successful mutations
- ✅ Page redirects if installation not found

---

### Task 3: Implement Header Card

**Location**: Main column, first card in Installation Detail Page

**Features**:

- Display client name (h1) and status badge
- Display client address
- Quick action buttons (if not cancelled):
  - "Iniciar" button (pending → in_progress) with play icon
  - "Completar" button (in_progress → completed) with checkmark icon
- Manual status change form (dropdown + button)
- Warning message if cancelled

**Quick Action Buttons**:

```astro
{
  installation.status === 'pending' && (
    <form method="POST">
      <input type="hidden" name="_action" value="update_status" />
      <input type="hidden" name="status" value="in_progress" />
      <Button type="submit" size="sm">
        {/* Play Icon */}
        Iniciar
      </Button>
    </form>
  )
}

{
  installation.status === 'in_progress' && (
    <form method="POST">
      <input type="hidden" name="_action" value="update_status" />
      <input type="hidden" name="status" value="completed" />
      <Button type="submit" size="sm" class="bg-green-600 hover:bg-green-700">
        {/* Checkmark Icon */}
        Completar
      </Button>
    </form>
  )
}
```

**Status Dropdown**:

```typescript
const allowedStatuses: { value: InstallationStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' }
  // NOTE: 'cancelled' is NOT included (installer cannot cancel)
];
```

**Cancelled State**:

```astro
{
  isCancelled && (
    <div class="mt-6 pt-6 border-t border-gray-200">
      <p class="text-sm text-red-600">Esta instalación ha sido cancelada por el administrador.</p>
    </div>
  )
}
```

**Acceptance Criteria**:

- ✅ Header displays client name and status badge
- ✅ Quick action buttons show based on current status
- ✅ Manual status form works
- ✅ Status dropdown excludes 'cancelled'
- ✅ Warning message appears if installation is cancelled
- ✅ All forms disabled if cancelled

---

### Task 4: Implement Notes Card

**Location**: Main column, second card in Installation Detail Page

**Features**:

- Textarea component for notes
- "Guardar Notas" button
- Disabled if installation is cancelled

**Implementation**:

```astro
<div class="card">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Notas</h2>

  <form method="POST">
    <input type="hidden" name="_action" value="update_notes" />
    <Textarea
      name="notes"
      value={installation.notes}
      placeholder="Añade notas sobre la instalación..."
      rows={4}
      disabled={isCancelled}
    />
    {
      !isCancelled && (
        <div class="mt-4">
          <Button type="submit" variant="secondary">
            Guardar Notas
          </Button>
        </div>
      )
    }
  </form>
</div>
```

**Acceptance Criteria**:

- ✅ Notes textarea displays current notes value
- ✅ Form submits with \_action=update_notes
- ✅ Success message appears after saving
- ✅ Form disabled if installation cancelled

---

### Task 5: Implement Materials Card

**Location**: Main column, third card in Installation Detail Page

**Features**:

- Uses MaterialsList component with editable=true (if not cancelled)
- Card wrapper with title

**Implementation**:

```astro
<div class="card">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Materiales Utilizados</h2>
  <MaterialsList materials={materials} installationId={id!} editable={!isCancelled} />
</div>
```

**Acceptance Criteria**:

- ✅ MaterialsList component integrated
- ✅ Editable when installation not cancelled
- ✅ Materials list updates after add/delete
- ✅ Success message appears after mutations

---

### Task 6: Implement Sidebar Scheduled Date Card

**Location**: Sidebar column, first card

**Features**:

- Display formatted date and time
- Calendar icon with primary color background

**Helper Functions**:

```typescript
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

**Implementation**:

```astro
<div class="card">
  <h3 class="text-sm font-medium text-gray-500 mb-3">Programación</h3>

  <div class="flex items-center gap-3">
    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Calendar icon */}
      </svg>
    </div>
    <div>
      <p class="font-medium text-gray-900 capitalize">
        {formatDate(installation.scheduled_at)}
      </p>
      <p class="text-sm text-gray-500">{formatTime(installation.scheduled_at)}</p>
    </div>
  </div>
</div>
```

**Acceptance Criteria**:

- ✅ Date displays with weekday, day, month, year
- ✅ Time displays in 24-hour format
- ✅ Calendar icon with primary background color
- ✅ Responsive layout

---

### Task 7: Implement Sidebar Contact Card

**Location**: Sidebar column, second card

**Features**:

- Phone link (tel:) with phone icon
- Email link (mailto:) with email icon
- Google Maps link with location icon and external link icon
- Hover effects on all links

**Implementation**:

```astro
<div class="card">
  <h3 class="text-sm font-medium text-gray-500 mb-3">Contacto</h3>

  <div class="space-y-3">
    {
      installation.client_phone && (
        <a
          href={`tel:${installation.client_phone}`}
          class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {/* Phone icon */}
          <span class="text-gray-900">{installation.client_phone}</span>
        </a>
      )
    }

    {
      installation.client_email && (
        <a
          href={`mailto:${installation.client_email}`}
          class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {/* Email icon */}
          <span class="text-gray-900 truncate">{installation.client_email}</span>
        </a>
      )
    }

    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(installation.client_address)}`}
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      {/* Location icon */}
      <span class="text-gray-900">Ver en mapa</span>
      {/* External link icon (ml-auto) */}
    </a>
  </div>
</div>
```

**Acceptance Criteria**:

- ✅ Phone link opens phone dialer
- ✅ Email link opens email client
- ✅ Maps link opens Google Maps in new tab
- ✅ Conditional rendering (only show if data exists)
- ✅ Hover effects on all links
- ✅ Icons display correctly

---

### Task 8: Implement Sidebar Payment Badge Card

**Location**: Sidebar column, third card (conditional)

**Features**:

- Only displays if `installation.collect_payment === true`
- Green theme styling (border-green-200 bg-green-50)
- Display amount in EUR currency format

**Helper Function**:

```typescript
function formatCurrency(amount: number | null): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
```

**Implementation**:

```astro
{
  installation.collect_payment && (
    <div class="card border-green-200 bg-green-50">
      <h3 class="text-sm font-medium text-green-800 mb-2">Cobro Requerido</h3>
      <p class="text-2xl font-bold text-green-700">
        {formatCurrency(installation.amount_to_collect)}
      </p>
    </div>
  )
}
```

**Acceptance Criteria**:

- ✅ Card only appears if collect_payment is true
- ✅ Amount formatted as EUR currency
- ✅ Green theme applied (border and background)
- ✅ Responsive text size

---

### Task 9: Implement Breadcrumb Navigation

**Location**: Top of Installation Detail Page (before alerts)

**Implementation**:

```astro
<nav class="mb-6">
  <ol class="flex items-center gap-2 text-sm text-gray-500">
    <li><a href="/installer" class="hover:text-gray-700">Dashboard</a></li>
    <li>/</li>
    <li><a href="/installer/installations" class="hover:text-gray-700">Instalaciones</a></li>
    <li>/</li>
    <li class="text-gray-900">{installation.client_name}</li>
  </ol>
</nav>
```

**Acceptance Criteria**:

- ✅ Links navigate correctly
- ✅ Current page (client name) not linked
- ✅ Hover effects on links
- ✅ Proper spacing with gap-2

---

### Task 10: Implement Alert Notifications

**Location**: After breadcrumb, before main content

**Alert Types**:

- Success: Green theme (after successful mutations)
- Error: Red theme (after failed mutations)

**State Management**:

```typescript
let error: string | null = null;
let success: string | null = null;

// Set after form processing
if (result.success) {
  success = 'Estado actualizado'; // or 'Notas guardadas', 'Material añadido', etc.
} else {
  error = result.error || 'Error al actualizar estado';
}
```

**Implementation**:

```astro
{
  error && (
    <Alert variant="error" title="Error" class="mb-6" dismissible>
      {error}
    </Alert>
  )
}

{
  success && (
    <Alert variant="success" class="mb-6" dismissible>
      {success}
    </Alert>
  )
}
```

**Alert Messages**:

- Status update: "Estado actualizado"
- Notes update: "Notas guardadas"
- Material add: "Material añadido"
- Material delete: "Material eliminado"

**Acceptance Criteria**:

- ✅ Success alert appears after successful mutations
- ✅ Error alert appears after failed mutations
- ✅ Alerts are dismissible
- ✅ Proper spacing (mb-6)

---

## Testing Plan

### Manual Testing Checklist

#### Test 1: View Installation Detail

1. Login as installer
2. Navigate to an assigned installation
3. **Expected**: See all details (header, notes, materials, sidebar)

#### Test 2: Change Status to "En Progreso"

1. On pending installation, click "Iniciar" button
2. **Expected**: Status changes to "En Progreso", success message appears

#### Test 3: Change Status to "Completada"

1. On in_progress installation, click "Completar" button
2. **Expected**: Status changes to "Completada", success message appears

#### Test 4: Manual Status Change

1. Use dropdown to select different status
2. Click "Actualizar" button
3. **Expected**: Status changes, success message appears

#### Test 5: Verify Cancelled Status Not Available

1. Check status dropdown options
2. **Expected**: Only shows pending, in_progress, completed (NOT cancelled)

#### Test 6: Add Notes

1. Enter text in notes textarea
2. Click "Guardar Notas" button
3. **Expected**: Notes saved, success message appears, page reloads with updated notes

#### Test 7: Add Material

1. Enter material description in add material form
2. Click "Añadir" button
3. **Expected**: Material appears in list, success message appears

#### Test 8: Delete Material

1. Click trash icon on a material
2. **Expected**: Material removed from list, success message appears

#### Test 9: Contact Links

1. Click phone link → **Expected**: Opens phone dialer
2. Click email link → **Expected**: Opens email client
3. Click "Ver en mapa" → **Expected**: Opens Google Maps in new tab

#### Test 10: Cancelled Installation

1. As admin, cancel an installation
2. As installer, view that installation
3. **Expected**:
   - Warning message displayed
   - All forms disabled
   - No edit buttons visible

#### Test 11: Responsive Layout

1. View page on mobile (< 768px)
2. **Expected**: Single column layout
3. View page on desktop (>= 1024px)
4. **Expected**: 2-column layout (main + sidebar)

#### Test 12: Payment Badge

1. View installation with collect_payment = true
2. **Expected**: Green payment badge in sidebar with formatted amount
3. View installation with collect_payment = false
4. **Expected**: No payment badge

---

## Component Dependencies

### Required Existing Components

- ✅ `DashboardLayout` (layouts/DashboardLayout.astro)
- ✅ `Button` (components/ui/Button.astro)
- ✅ `Textarea` (components/ui/Textarea.astro)
- ✅ `Alert` (components/ui/Alert.astro)
- ✅ `StatusBadge` (components/installations/StatusBadge.astro)

### New Components to Create

- **MaterialsList** (components/installations/MaterialsList.astro)

### Backend Functions (Already Available)

- ✅ `getMyInstallationById(accessToken, userId, id)` - from lib/queries/installer.ts
- ✅ `getMaterialsByInstallation(accessToken, id)` - from backend (need to create query wrapper)
- ✅ `updateInstallationStatus(accessToken, id, userId, status)` - from backend (need to create action wrapper)
- ✅ `updateInstallationNotes(accessToken, id, userId, notes)` - from backend (need to create action wrapper)
- ✅ `addMaterial(accessToken, id, userId, description)` - from backend (need to create action wrapper)
- ✅ `deleteMaterial(accessToken, materialId, userId)` - from backend (need to create action wrapper)

---

## File Structure

```
src/
├── components/
│   └── installations/
│       └── MaterialsList.astro           # NEW
├── pages/
│   └── installer/
│       └── installations/
│           └── [id].astro                # REPLACE (was placeholder)
└── lib/
    ├── actions/
    │   └── installer.ts                  # NEW (backend action wrappers)
    └── queries/
        └── materials.ts                  # NEW (backend query wrappers)
```

---

## Styling Guidelines

### Color Scheme

- Primary actions: `bg-primary-600 hover:bg-primary-700`
- Success (complete): `bg-green-600 hover:bg-green-700`
- Warning (cancelled): `text-red-600`
- Background cards: `bg-gray-50 hover:bg-gray-100`

### Responsive Breakpoints

- Mobile: `< 768px` (single column)
- Tablet: `768px - 1023px` (single column)
- Desktop: `>= 1024px` (2-column with lg:grid-cols-3)

### Spacing

- Card padding: `p-4` or `p-6`
- Section gaps: `gap-6` or `space-y-6`
- Form gaps: `gap-2` or `gap-4`

### Typography

- Page title (h1): `text-2xl font-bold text-gray-900`
- Card title (h2): `text-lg font-semibold text-gray-900`
- Sidebar title (h3): `text-sm font-medium text-gray-500`
- Body text: `text-gray-900` or `text-gray-600`
- Small text: `text-sm text-gray-500`

---

## Security Considerations

### Server-Side Validation

- ✅ Backend validates ownership (installer can only update their installations)
- ✅ Backend blocks 'cancelled' status from installer
- ✅ All mutations require accessToken

### Client-Side Protection

- ✅ Forms disabled if installation.status === 'cancelled'
- ✅ Status dropdown excludes 'cancelled' option
- ✅ Authorization happens on every request via middleware

### Data Integrity

- ✅ Data reloaded after mutations to ensure consistency
- ✅ Error handling for failed mutations
- ✅ User-friendly error messages (no sensitive details)

---

## Acceptance Criteria Summary

### Component Level

- ✅ MaterialsList component renders correctly with editable and read-only modes
- ✅ MaterialsList handles empty state gracefully
- ✅ MaterialsList forms submit with correct \_action values

### Page Level

- ✅ Installation detail page loads data correctly
- ✅ All forms process POST requests correctly
- ✅ Alert notifications appear after form submissions
- ✅ Data reloads after successful mutations
- ✅ Breadcrumb navigation works
- ✅ Responsive layout adapts to mobile and desktop

### Functionality Level

- ✅ Status updates work (including quick actions)
- ✅ Notes save correctly
- ✅ Materials add/delete work
- ✅ Contact links open correct applications
- ✅ Payment badge displays conditionally
- ✅ Cancelled installations are read-only

### Security Level

- ✅ Installer cannot set status to 'cancelled'
- ✅ Forms disabled for cancelled installations
- ✅ Server-side ownership verification
- ✅ All mutations require authentication

---

## Notes

### Design Patterns

- **Form Handling**: All forms use POST with hidden `_action` field to differentiate actions
- **Data Flow**: Load data → Process form → Reload data → Show alert
- **Responsive Design**: Mobile-first approach with lg: breakpoint for desktop layout
- **Component Reusability**: MaterialsList is reusable with editable prop

### Performance Considerations

- Minimal client-side JavaScript (Astro SSR)
- Forms use native HTML form submission (no JavaScript required)
- Data fetching happens server-side (fast initial load)

### Accessibility

- Proper semantic HTML (nav, form, button, a)
- Links have meaningful text ("Ver en mapa" not just "Mapa")
- Alert messages use proper ARIA attributes
- Form inputs have labels

### Future Enhancements (Not in This Phase)

- Confirmation modal for "Completar" action (simplified approach used instead)
- Real-time updates via WebSocket (not needed for Phase 13)
- Image upload for materials (future feature)
- Material quantity tracking (future feature)

---

**End of Phase 13 Frontend Architecture Document**
