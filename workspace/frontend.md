# Frontend Implementation Plan - Push Notifications

## 1. Service Worker Updates (`public/sw.js`)

### 1.1 Add Push Event Listener

**File**: `public/sw.js`
**Estimate**: 1-2 hours

**Tasks**:

- [ ] Add `push` event listener to handle incoming push notifications
- [ ] Extract notification payload (title, body, data)
- [ ] Display notification using `self.registration.showNotification()`
- [ ] Include installation ID in notification data for click handling
- [ ] Add notification options: icon, badge, vibrate pattern
- [ ] Handle empty or malformed payloads gracefully

**Acceptance Criteria**:

- Push events trigger visible notifications
- Notification displays "Nueva instalación asignada" title
- Notification includes installation ID in data payload
- Handles missing/invalid payloads without crashing
- Notification shows app icon and badge

---

### 1.2 Add Notification Click Listener

**File**: `public/sw.js`
**Estimate**: 1 hour

**Tasks**:

- [ ] Add `notificationclick` event listener
- [ ] Extract installation ID from notification data
- [ ] Close notification on click
- [ ] Navigate to `/installer/installations/[id]` using `clients.openWindow()`
- [ ] Focus existing window if already open (use `clients.matchAll()`)
- [ ] Handle case where installation ID is missing

**Acceptance Criteria**:

- Clicking notification navigates to installation detail page
- Notification closes after click
- Opens new window if none exists, focuses existing window otherwise
- URL includes correct installation ID
- Handles missing installation ID gracefully (navigate to dashboard)

---

## 2. Push Subscribe Component

### 2.1 Create PushSubscribe Component Structure

**File**: `src/components/notifications/PushSubscribe.astro`
**Estimate**: 2 hours

**Tasks**:

- [ ] Create component with clear UI states: loading, enabled, disabled, error, unsupported
- [ ] Display current subscription status
- [ ] Add toggle button to enable/disable notifications
- [ ] Include helpful text explaining what notifications are for
- [ ] Style with CSS (mobile-first, responsive)
- [ ] Use semantic HTML (button, aria-labels, etc.)

**Acceptance Criteria**:

- Component renders with all possible states
- Clear visual distinction between enabled/disabled states
- Button shows "Activar notificaciones" when disabled, "Desactivar notificaciones" when enabled
- Loading state shows spinner and disables button
- Error state shows user-friendly message in Spanish
- Unsupported state shows "Tu navegador no soporta notificaciones"
- WCAG 2.1 AA compliant (color contrast, keyboard navigation, screen reader support)

**UI States**:

- `unsupported`: Browser doesn't support push notifications
- `loading`: Checking status or processing subscription
- `disabled`: Notifications not enabled (show enable button)
- `enabled`: Notifications active (show disable button)
- `error`: Something went wrong (show error message + retry)

---

### 2.2 Add Client-side Subscription Logic

**File**: `src/components/notifications/PushSubscribe.astro` (inline script)
**Estimate**: 3 hours

**Tasks**:

- [ ] Check browser support (`'serviceWorker' in navigator && 'PushManager' in window`)
- [ ] Request notification permission (`Notification.requestPermission()`)
- [ ] Get Service Worker registration
- [ ] Subscribe to push notifications with VAPID public key
- [ ] Convert subscription to JSON and send to `/api/push/subscribe`
- [ ] Handle subscription errors (permission denied, network failure)
- [ ] Add unsubscribe functionality (call `/api/push/unsubscribe`)
- [ ] Store subscription status in component state
- [ ] Handle edge cases: SW not registered, permission already granted, etc.

**Acceptance Criteria**:

- Checks browser support on component mount
- Requests permission only when user clicks enable button
- Successfully subscribes and sends subscription to backend
- Handles permission denial gracefully (show message)
- Unsubscribe removes subscription from backend and browser
- Updates UI state after each operation
- Logs errors to console for debugging
- Works with existing Service Worker registration

---

### 2.3 Add Subscription Status Check on Load

**File**: `src/components/notifications/PushSubscribe.astro` (inline script)
**Estimate**: 1 hour

**Tasks**:

- [ ] On component mount, check if push subscription exists
- [ ] Query `registration.pushManager.getSubscription()`
- [ ] Update UI state based on existing subscription
- [ ] Handle cases: no SW registration, no subscription, subscription exists
- [ ] Show correct button state (enable/disable) based on status

**Acceptance Criteria**:

- Component checks subscription status on mount
- UI reflects correct state (enabled/disabled) on page load
- Handles case where SW is not registered yet
- Handles case where subscription exists but backend doesn't know about it
- Fast status check (no noticeable delay)

---

## 3. Client-side Utilities

### 3.1 Create VAPID Key Conversion Utility

**File**: `src/lib/push-utils.ts`
**Estimate**: 30 minutes

**Tasks**:

- [ ] Create `urlBase64ToUint8Array(base64String: string): Uint8Array` function
- [ ] Convert base64-encoded VAPID public key to Uint8Array
- [ ] Add TypeScript return type
- [ ] Add JSDoc comment explaining usage

**Acceptance Criteria**:

- Function correctly converts base64 to Uint8Array
- Works with VAPID public key from environment variable
- Includes TypeScript types
- Includes JSDoc documentation

---

### 3.2 Create Subscription Management Utilities

**File**: `src/lib/push-utils.ts`
**Estimate**: 2 hours

**Tasks**:

- [ ] Create `checkPushSupport(): boolean` - checks if browser supports push
- [ ] Create `requestNotificationPermission(): Promise<NotificationPermission>` - requests permission
- [ ] Create `subscribeToPushNotifications(vapidPublicKey: string): Promise<PushSubscription>` - handles subscription flow
- [ ] Create `unsubscribeFromPushNotifications(): Promise<void>` - handles unsubscribe
- [ ] Create `getPushSubscriptionStatus(): Promise<PushSubscription | null>` - gets current subscription
- [ ] Add proper error handling and TypeScript types
- [ ] Export all functions from `src/lib/push-utils.ts`

**Acceptance Criteria**:

- All functions have explicit TypeScript return types
- Functions handle errors gracefully (return null/false instead of throwing)
- `checkPushSupport()` returns true only if both ServiceWorker and PushManager are supported
- `requestNotificationPermission()` handles all permission states (granted, denied, default)
- `subscribeToPushNotifications()` returns valid PushSubscription
- `unsubscribeFromPushNotifications()` removes subscription from browser
- All functions are pure and testable (no side effects beyond their purpose)

---

## 4. Integration with Installer Dashboard

### 4.1 Add PushSubscribe Component to Dashboard

**File**: `src/pages/installer/index.astro`
**Estimate**: 1 hour

**Tasks**:

- [ ] Import `PushSubscribe` component
- [ ] Add component to installer dashboard UI (below header, above installations list)
- [ ] Wrap in section with appropriate heading ("Notificaciones")
- [ ] Ensure component is visible and accessible
- [ ] Test responsive layout on mobile/desktop

**Acceptance Criteria**:

- Component appears on installer dashboard
- Positioned logically (near top, but not intrusive)
- Responsive on all screen sizes
- Maintains existing dashboard layout and functionality
- Component is accessible via keyboard navigation

---

### 4.2 Add Environment Variable for VAPID Public Key

**File**: `.env.example`, `.env`
**Estimate**: 15 minutes

**Tasks**:

- [ ] Add `PUBLIC_VAPID_PUBLIC_KEY` to `.env.example` with placeholder
- [ ] Add comment explaining how to generate VAPID keys
- [ ] Verify `PUBLIC_VAPID_PUBLIC_KEY` is set in `.env` (local dev)
- [ ] Pass VAPID key to component via props or environment variable

**Acceptance Criteria**:

- `.env.example` includes `PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here`
- Comment explains how to generate keys (`npx web-push generate-vapid-keys`)
- Component reads key from `import.meta.env.PUBLIC_VAPID_PUBLIC_KEY`
- Build fails if key is missing (validation in component)

---

## 5. UX/UI Enhancements

### 5.1 Design Permission Request Flow

**File**: `src/components/notifications/PushSubscribe.astro`
**Estimate**: 2 hours

**Tasks**:

- [ ] Add explanatory text before permission request
- [ ] Show permission prompt only when user clicks "Activar notificaciones" button (non-intrusive)
- [ ] Display helpful message if permission is denied
- [ ] Add visual feedback during subscription process (loading spinner, success message)
- [ ] Style messages with appropriate colors (info: blue, error: red, success: green)

**Acceptance Criteria**:

- Permission request is not automatic (only triggered by user action)
- Clear explanation of what notifications are for
- Helpful recovery message if permission denied
- Visual feedback for all states (loading, success, error)
- Non-blocking UI (user can continue using dashboard while subscribing)

---

### 5.2 Add Status Indicators

**File**: `src/components/notifications/PushSubscribe.astro`
**Estimate**: 1 hour

**Tasks**:

- [ ] Display clear status text: "Notificaciones activadas" or "Notificaciones desactivadas"
- [ ] Add icon to indicate status (bell icon with slash when disabled)
- [ ] Use color coding (green for enabled, gray for disabled)
- [ ] Show last subscription date if available
- [ ] Add tooltip with more details on hover

**Acceptance Criteria**:

- Status is visible at a glance (icon + text)
- Color coding matches common UX patterns (green = good, gray = inactive)
- Accessible (screen readers can read status)
- Works on mobile (no hover-only interactions)

---

### 5.3 Add Error Messages

**File**: `src/components/notifications/PushSubscribe.astro`
**Estimate**: 1 hour

**Tasks**:

- [ ] Create Spanish error messages for common scenarios
- [ ] Display errors in dismissible alert/banner
- [ ] Add retry button for recoverable errors
- [ ] Log technical errors to console for debugging

**Acceptance Criteria**:

- All error messages are in Spanish
- Errors are user-friendly (no technical jargon)
- Dismissible error banners (X button)
- Retry button for network errors
- Technical details logged to console (not shown to user)

---

## 6. Testing

### 6.1 Unit Tests for Push Utilities

**File**: `src/lib/push-utils.test.ts`
**Estimate**: 2 hours

**Tasks**:

- [ ] Test `urlBase64ToUint8Array()` converts base64 correctly
- [ ] Test `checkPushSupport()` returns true/false based on browser support
- [ ] Mock `navigator.serviceWorker` and `window.PushManager` for tests
- [ ] Test `requestNotificationPermission()` handles all permission states
- [ ] Test error handling in all utility functions
- [ ] Achieve 100% code coverage for `push-utils.ts`

**Acceptance Criteria**:

- All utility functions have unit tests
- Tests use Vitest mocks for browser APIs
- 100% code coverage for `push-utils.ts`
- Tests run in CI/CD pipeline
- Tests are isolated (no dependencies on real browser APIs)

---

### 6.2 Component Tests for PushSubscribe

**File**: `src/components/notifications/PushSubscribe.test.ts`
**Estimate**: 3 hours

**Tasks**:

- [ ] Test component renders in all states (unsupported, loading, enabled, disabled, error)
- [ ] Test "Activar notificaciones" button triggers permission request
- [ ] Test "Desactivar notificaciones" button unsubscribes
- [ ] Mock Service Worker registration and push subscription
- [ ] Test error states display correct messages
- [ ] Test loading states show spinner and disable button
- [ ] Test accessibility (ARIA labels, keyboard navigation)

**Acceptance Criteria**:

- Component tests cover all UI states
- Tests verify button click behavior
- Tests verify error messages display correctly
- Tests verify loading states
- Tests verify accessibility attributes
- Tests use Vitest + Testing Library
- Tests run in CI/CD pipeline

---

### 6.3 Integration Tests for Push Subscription Flow

**File**: `src/components/notifications/PushSubscribe.integration.test.ts`
**Estimate**: 3 hours

**Tasks**:

- [ ] Test full subscription flow: request permission → subscribe → send to backend
- [ ] Test unsubscribe flow: unsubscribe → remove from backend
- [ ] Test subscription status check on component mount
- [ ] Mock `/api/push/subscribe` and `/api/push/unsubscribe` endpoints
- [ ] Test error handling when backend returns error
- [ ] Test retry logic after network failure
- [ ] Use real Service Worker registration (not mocked)

**Acceptance Criteria**:

- Tests verify complete subscription flow
- Tests verify backend API calls
- Tests verify error handling and retry logic
- Tests use real Service Worker (test environment)
- Tests clean up subscriptions after each test
- Tests run in CI/CD pipeline

---

### 6.4 E2E Tests for Push Notifications

**File**: `e2e/push-notifications.spec.ts`
**Estimate**: 4 hours

**Tasks**:

- [ ] Test: Installer enables notifications on dashboard
- [ ] Test: Installer receives notification when installation is assigned
- [ ] Test: Clicking notification navigates to installation detail page
- [ ] Test: Installer disables notifications
- [ ] Test: Installer does not receive notification after disabling
- [ ] Test: Multi-device scenario (enable on device A, assign installation, verify notification)
- [ ] Grant notification permission in Playwright context
- [ ] Mock push events in Playwright

**Acceptance Criteria**:

- E2E tests cover complete user flow (enable → receive → click → navigate)
- Tests verify notification appears in browser
- Tests verify notification click navigation
- Tests verify disable functionality
- Tests grant notification permission programmatically
- Tests run in Playwright headless mode
- Tests pass in CI/CD pipeline

---

## 7. Documentation

### 7.1 Update README with Push Notification Setup

**File**: `README.md`
**Estimate**: 30 minutes

**Tasks**:

- [ ] Add section "Push Notifications Setup"
- [ ] Document VAPID key generation
- [ ] Document required environment variables
- [ ] Explain how to test push notifications locally
- [ ] Link to Service Worker documentation

**Acceptance Criteria**:

- README includes push notification setup instructions
- Instructions include VAPID key generation
- All required environment variables documented
- Local testing instructions included

---

### 7.2 Add Inline Documentation to Service Worker

**File**: `public/sw.js`
**Estimate**: 30 minutes

**Tasks**:

- [ ] Add JSDoc comments explaining push event listener
- [ ] Add JSDoc comments explaining notification click listener
- [ ] Document notification payload structure
- [ ] Add examples of valid notification data

**Acceptance Criteria**:

- Service Worker code includes JSDoc comments
- Comments explain WHY, not WHAT
- Notification payload structure documented
- Examples provided for future developers

---

## Summary

**Total Estimated Time**: 26-30 hours

**Checklist Summary by Phase**:

### Service Worker (2-3 hours)

- [ ] 1.1. Add push event listener (1-2 hours)
- [ ] 1.2. Add notification click listener (1 hour)

### Push Subscribe Component (6 hours)

- [ ] 2.1. Create component structure (2 hours)
- [ ] 2.2. Add subscription logic (3 hours)
- [ ] 2.3. Add status check on load (1 hour)

### Client Utilities (2.5 hours)

- [ ] 3.1. Create VAPID conversion utility (30 min)
- [ ] 3.2. Create subscription management utilities (2 hours)

### Integration (1.25 hours)

- [ ] 4.1. Add component to dashboard (1 hour)
- [ ] 4.2. Add environment variables (15 min)

### UX/UI Enhancements (4 hours)

- [ ] 5.1. Design permission request flow (2 hours)
- [ ] 5.2. Add status indicators (1 hour)
- [ ] 5.3. Add error messages (1 hour)

### Testing (12 hours)

- [ ] 6.1. Unit tests for utilities (2 hours)
- [ ] 6.2. Component tests (3 hours)
- [ ] 6.3. Integration tests (3 hours)
- [ ] 6.4. E2E tests (4 hours)

### Documentation (1 hour)

- [ ] 7.1. Update README (30 min)
- [ ] 7.2. Add Service Worker documentation (30 min)
