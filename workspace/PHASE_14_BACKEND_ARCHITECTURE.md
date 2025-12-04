# Phase 14: PWA Setup - Backend Architecture

## Overview

Phase 14 implements PWA infrastructure including service worker, web app manifest, and offline capabilities. This phase is primarily **frontend/client-side focused**, but requires careful backend considerations for cache management, push notification preparation, and static asset delivery.

**Key Characteristics:**

- No database migrations required
- No Edge Functions required
- No RLS policy changes
- Service worker runs client-side (browser context)
- Static assets served via Vercel/Astro

**User Preferences Applied:**

- Simple placeholder icons (blue #2563eb with 'IMS' text)
- Moderate caching strategy (icons + manifest + offline page)
- Network-first approach for dynamic content

---

## Architecture Components

### 1. Service Worker Architecture (`public/sw.js`)

The service worker is a **client-side JavaScript file** that runs in the browser's background context, separate from the main page thread.

#### 1.1 Service Worker Lifecycle

```
Installation → Activation → Fetch Interception → Update Cycle
```

**States:**

- **Installing**: Service worker downloads and caches static assets
- **Waiting**: New service worker waiting for old one to finish
- **Active**: Service worker controls all pages in scope
- **Redundant**: Old service worker replaced by new one

**Implementation Requirements:**

1. Cache static assets on install
2. Clean up old caches on activation
3. Intercept fetch requests for offline support
4. Handle push notifications (Phase 15 preparation)

#### 1.2 Cache Strategy Design

**Approach:** Network-first with cache fallback (user preference: moderate caching)

```typescript
// Network-first strategy flow:
1. Try fetch from network
   └─ Success → Update cache + return response
   └─ Failure → Try cache
      └─ Success → Return cached response
      └─ Failure → Show offline page (navigate mode) or 503 error
```

**Assets to Cache (Moderate Strategy):**

- `/favicon.svg` - Site favicon
- `/manifest.json` - PWA manifest
- `/icons/icon-192.png` - Small app icon
- `/icons/icon-512.png` - Large app icon
- `/offline.html` - Offline fallback page

**Assets NOT Cached (Dynamic Content):**

- API endpoints (`/api/*`)
- Authentication flows (`/auth/*`)
- Supabase requests (contains `supabase`)
- Cross-origin requests (external APIs)

**Rationale for Network-First:**

- User always gets fresh data when online
- Prevents stale installation data
- Cache only used as offline fallback
- Aligns with "moderate caching" preference

#### 1.3 Cache Versioning

```typescript
const CACHE_NAME = 'ims-cache-v1';
```

**Version Bump Triggers:**

- Asset changes (icons, manifest)
- Service worker logic updates
- Offline page redesign

**Migration Strategy:**

1. Update CACHE_NAME to 'ims-cache-v2'
2. Old cache deleted on activation
3. New cache populated on install
4. Zero downtime (old SW runs until new SW activates)

#### 1.4 Push Notification Event Handlers (Preparation)

**Events to Handle:**

- `push`: Receive push notification from server
- `notificationclick`: User clicks notification

**Implementation Notes:**

- Full implementation in Phase 15
- Skeleton handlers included in Phase 14
- VAPID keys already in `.env` (ready for Phase 15)

---

### 2. Web App Manifest (`public/manifest.json`)

**Purpose:** Defines how the PWA appears when installed on user's device

**Key Properties:**

- `name`: Full application name
- `short_name`: Name shown on home screen
- `start_url`: URL to open when app launches
- `display`: "standalone" (hides browser UI)
- `theme_color`: Primary color (#2563eb)
- `background_color`: Splash screen background (#ffffff)
- `icons`: Array of icon definitions with sizes and purposes

**Browser Installability Requirements (Met by Manifest):**

1. ✅ Valid manifest.json with name, icons, start_url
2. ✅ Registered service worker
3. ✅ Served over HTTPS (Vercel provides this)
4. ✅ Icons: 192x192 and 512x512

---

### 3. Static Asset Delivery

**Assets Required:**

- `public/favicon.svg` - Already exists (checked via Glob)
- `public/manifest.json` - NEW
- `public/sw.js` - NEW
- `public/offline.html` - NEW
- `public/icons/icon-192.png` - NEW
- `public/icons/icon-512.png` - NEW
- `public/icons/apple-touch-icon.png` - NEW (iOS compatibility)

**Delivery Mechanism:**

- Astro copies `public/` folder to output directory
- Vercel serves files at root level (e.g., `/manifest.json`)
- No special CDN configuration needed (Vercel Edge Network handles it)

**Caching Headers (Vercel Default):**

- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- HTML files: `Cache-Control: public, max-age=0, must-revalidate`

---

### 4. Service Worker Registration

**Location:** `src/layouts/BaseLayout.astro`

**Current Status:** ❌ NOT YET IMPLEMENTED (Phase 07 was skipped)

**Required Implementation:**

```html
<!-- In <head> or before </body> -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.error('[SW] Registration failed:', err));
    });
  }
</script>
```

**Registration Lifecycle:**

1. Page loads
2. Check if browser supports service workers
3. Wait for page load event (don't block initial render)
4. Register `/sw.js` with Service Worker API
5. Browser downloads, parses, and installs service worker
6. Service worker enters "installing" state

**Error Handling:**

- Registration failure logged to console
- App continues to work (progressive enhancement)
- No user-facing error messages (PWA is optional enhancement)

---

### 5. Icon Generation Strategy

**User Preference:** Simple placeholders (blue #2563eb with 'IMS' text)

**Implementation Options:**

**Option A: ImageMagick (Command-line)**

```bash
# 192x192 icon
convert -size 192x192 xc:#2563eb -fill white -gravity center \
  -pointsize 80 -annotate 0 "IMS" public/icons/icon-192.png

# 512x512 icon
convert -size 512x512 xc:#2563eb -fill white -gravity center \
  -pointsize 200 -annotate 0 "IMS" public/icons/icon-512.png

# Apple touch icon (180x180)
convert -size 180x180 xc:#2563eb -fill white -gravity center \
  -pointsize 70 -annotate 0 "IMS" public/icons/apple-touch-icon.png
```

**Option B: Manual Creation (Recommended)**

- Use online tool: https://favicon.io/favicon-generator/
- Settings: Blue background (#2563eb), white text "IMS", sans-serif font
- Export all sizes
- Place in `public/icons/`

**Option C: SVG + Canvas (Programmatic)**

- Create SVG template
- Use browser canvas API to generate PNG
- Not recommended (adds complexity)

**Recommended:** Option B (manual via favicon.io) for simplicity

---

### 6. Offline Page Design

**Purpose:** Fallback page shown when user navigates while offline

**File:** `public/offline.html`

**Requirements:**

- Pure HTML/CSS (no external dependencies)
- No JavaScript (browser may not execute JS when offline)
- Inline styles (no external stylesheets)
- Simple, user-friendly message
- "Retry" button to reload page

**Design Specifications:**

- Background: Blue gradient (#eff6ff to #dbeafe)
- Icon: Red circle with WiFi-off icon
- Title: "Sin conexión"
- Message: "No tienes conexión a internet. Verifica tu conexión e intenta de nuevo."
- Button: Blue (#2563eb), "Reintentar" text, triggers `location.reload()`

---

## Implementation Checklist

### Task 1: Create Icon Assets (1-2 hours)

**Estimated Time:** 1-2 hours (depends on creation method)

**Steps:**

- [ ] Create directory `public/icons/` (if not exists)
- [ ] Generate or create `icon-192.png` (192x192 px, blue #2563eb, white "IMS" text)
- [ ] Generate or create `icon-512.png` (512x512 px, blue #2563eb, white "IMS" text)
- [ ] Generate or create `apple-touch-icon.png` (180x180 px, blue #2563eb, white "IMS" text)
- [ ] Verify all icons load in browser (open http://localhost:4321/icons/icon-192.png)
- [ ] Verify file sizes are reasonable (<50KB each for placeholders)

**Acceptance Criteria:**

- ✅ All 3 icon files exist in `public/icons/`
- ✅ Icons are accessible via browser at `/icons/icon-*.png`
- ✅ Icons display correctly with blue background and white "IMS" text
- ✅ File sizes under 50KB each (placeholder quality)

**Testing:**

```bash
# Verify icon files exist
npm run dev
# Open in browser:
# - http://localhost:4321/icons/icon-192.png
# - http://localhost:4321/icons/icon-512.png
# - http://localhost:4321/icons/apple-touch-icon.png
```

---

### Task 2: Create Web App Manifest (30 minutes)

**Estimated Time:** 30 minutes

**File:** `public/manifest.json`

**Steps:**

- [ ] Create file `public/manifest.json`
- [ ] Add `name`: "IMS - Installation Management System"
- [ ] Add `short_name`: "IMS"
- [ ] Add `description`: "Sistema de gestión de instalaciones"
- [ ] Add `start_url`: "/"
- [ ] Add `display`: "standalone"
- [ ] Add `background_color`: "#ffffff"
- [ ] Add `theme_color`: "#2563eb"
- [ ] Add `orientation`: "portrait-primary"
- [ ] Add `icons` array with:
  - 192x192 icon with `purpose: "any maskable"`
  - 512x512 icon with `purpose: "any maskable"`
- [ ] Add `categories`: ["business", "productivity"]
- [ ] Add `lang`: "es"
- [ ] Add `dir`: "ltr"
- [ ] Verify JSON syntax (no trailing commas, valid JSON)
- [ ] Verify manifest loads at http://localhost:4321/manifest.json

**Acceptance Criteria:**

- ✅ File exists at `public/manifest.json`
- ✅ Valid JSON syntax (no errors)
- ✅ All required fields present (name, icons, start_url, display)
- ✅ Accessible via browser at `/manifest.json`
- ✅ Icon paths resolve correctly (absolute paths: `/icons/icon-*.png`)

**Testing:**

```bash
npm run dev
# Open: http://localhost:4321/manifest.json
# Expected: JSON file downloads/displays correctly
# Use JSON validator: https://jsonlint.com/
```

---

### Task 3: Create Offline Fallback Page (1 hour)

**Estimated Time:** 1 hour

**File:** `public/offline.html`

**Steps:**

- [ ] Create file `public/offline.html`
- [ ] Add HTML5 doctype and basic structure
- [ ] Set `lang="es"`
- [ ] Add viewport meta tag
- [ ] Add title: "Sin conexión | IMS"
- [ ] Add inline `<style>` block with:
  - CSS reset (margin, padding, box-sizing)
  - Body: gradient background, flexbox centering
  - Icon: 80x80 circle, red background, centered SVG
  - Title: 24px, gray-900
  - Message: 16px, gray-600, line-height 1.5
  - Button: blue (#2563eb), white text, hover effect
- [ ] Add container `<div>` with centered content
- [ ] Add icon `<div>` with WiFi-off SVG icon
- [ ] Add `<h1>`: "Sin conexión"
- [ ] Add `<p>`: "No tienes conexión a internet. Verifica tu conexión e intenta de nuevo."
- [ ] Add `<button>` with `onclick="location.reload()"`: "Reintentar"
- [ ] Verify page renders correctly
- [ ] Test button reloads page

**Acceptance Criteria:**

- ✅ File exists at `public/offline.html`
- ✅ Valid HTML5 syntax
- ✅ All styles inline (no external CSS)
- ✅ No external dependencies (images, fonts, scripts)
- ✅ Responsive design (works on mobile and desktop)
- ✅ "Reintentar" button reloads page
- ✅ Accessible via browser at `/offline.html`

**Testing:**

```bash
npm run dev
# Open: http://localhost:4321/offline.html
# Expected: See styled offline page with blue button
# Click button → Page reloads
```

---

### Task 4: Implement Service Worker (2-3 hours)

**Estimated Time:** 2-3 hours

**File:** `public/sw.js`

**Steps:**

- [ ] Create file `public/sw.js`
- [ ] Define constant `CACHE_NAME = 'ims-cache-v1'`
- [ ] Define array `STATIC_ASSETS` with:
  - `/favicon.svg`
  - `/manifest.json`
  - `/icons/icon-192.png`
  - `/icons/icon-512.png`
- [ ] Implement `install` event listener:
  - [ ] Log "[SW] Installing..."
  - [ ] Open cache with `CACHE_NAME`
  - [ ] Cache all `STATIC_ASSETS` with `cache.addAll()`
  - [ ] Call `self.skipWaiting()` to activate immediately
  - [ ] Use `event.waitUntil()` to keep worker alive
- [ ] Implement `activate` event listener:
  - [ ] Log "[SW] Activating..."
  - [ ] Get all cache names with `caches.keys()`
  - [ ] Delete caches where `name !== CACHE_NAME`
  - [ ] Call `self.clients.claim()` to take control of pages
  - [ ] Use `event.waitUntil()` to keep worker alive
- [ ] Implement `fetch` event listener:
  - [ ] Extract `request` and `url` from event
  - [ ] Skip cross-origin requests (`url.origin !== location.origin`)
  - [ ] Skip API/auth requests (`/api`, `/auth`, `supabase` in pathname)
  - [ ] Implement network-first strategy:
    - Try `fetch(request)`
    - On success: clone response, update cache, return original
    - On failure: try `caches.match(request)`
    - If navigate mode and no cache: return `/offline.html`
    - Otherwise: return 503 error
  - [ ] Use `event.respondWith()` to intercept response
- [ ] Implement `message` event listener:
  - [ ] Check for `SKIP_WAITING` message type
  - [ ] Call `self.skipWaiting()` if received
- [ ] Implement `push` event listener (skeleton for Phase 15):
  - [ ] Log push event
  - [ ] Parse `event.data.json()`
  - [ ] Show notification with `self.registration.showNotification()`
  - [ ] Use `event.waitUntil()` to keep worker alive
- [ ] Implement `notificationclick` event listener (skeleton for Phase 15):
  - [ ] Close notification
  - [ ] Open URL from notification data
  - [ ] Focus existing window or open new one
  - [ ] Use `event.waitUntil()` to keep worker alive
- [ ] Add console logs for debugging (prefixed with "[SW]")

**Acceptance Criteria:**

- ✅ File exists at `public/sw.js`
- ✅ Valid JavaScript syntax (no errors)
- ✅ Install event caches static assets
- ✅ Activate event cleans old caches
- ✅ Fetch event implements network-first strategy
- ✅ Cross-origin requests ignored
- ✅ API/auth requests ignored
- ✅ Offline navigation shows `/offline.html`
- ✅ Push notification handlers prepared (not fully functional)
- ✅ All event handlers use `event.waitUntil()`

**Testing:**

```bash
npm run dev
# Open DevTools (F12) → Application → Service Workers
# Expected: No service worker registered yet (registration in next task)
```

---

### Task 5: Add Service Worker Registration (30 minutes)

**Estimated Time:** 30 minutes

**File:** `src/layouts/BaseLayout.astro`

**Steps:**

- [ ] Open `src/layouts/BaseLayout.astro`
- [ ] Add `<link rel="manifest" href="/manifest.json">` to `<head>` section
- [ ] Add `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">` to `<head>`
- [ ] Add `<script>` block before `</body>`:
  - [ ] Check if `'serviceWorker' in navigator`
  - [ ] Add `window.addEventListener('load', ...)` listener
  - [ ] Inside listener, call `navigator.serviceWorker.register('/sw.js')`
  - [ ] Log success: `console.log('[SW] Registered:', reg.scope)`
  - [ ] Log error: `console.error('[SW] Registration failed:', err)`
- [ ] Verify no TypeScript errors
- [ ] Verify script is inline (not external file)

**Acceptance Criteria:**

- ✅ Manifest link added to `<head>`
- ✅ Apple touch icon link added to `<head>`
- ✅ Service worker registration script added
- ✅ Registration happens after page load (doesn't block render)
- ✅ Browser support check included (`'serviceWorker' in navigator`)
- ✅ Error handling included (catch block)
- ✅ No TypeScript/build errors

**Testing:**

```bash
npm run dev
# Open http://localhost:4321
# Open DevTools (F12) → Console
# Expected: "[SW] Registered: http://localhost:4321/"
# Open DevTools → Application → Service Workers
# Expected: Service worker active and running
```

---

### Task 6: Verify PWA Installation (1 hour)

**Estimated Time:** 1 hour (manual testing)

**Steps:**

- [ ] Open app in Chrome: http://localhost:4321
- [ ] Open DevTools → Application → Manifest
- [ ] Verify manifest loads correctly:
  - [ ] Name: "IMS - Installation Management System"
  - [ ] Short name: "IMS"
  - [ ] Start URL: "/"
  - [ ] Display: "standalone"
  - [ ] Icons: 192x192 and 512x512 shown
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker registered:
  - [ ] Status: "activated and running"
  - [ ] Scope: "/"
  - [ ] Source: "/sw.js"
- [ ] Open DevTools → Application → Cache Storage
- [ ] Verify cache `ims-cache-v1` exists with 4 assets:
  - [ ] `/favicon.svg`
  - [ ] `/manifest.json`
  - [ ] `/icons/icon-192.png`
  - [ ] `/icons/icon-512.png`
- [ ] Check Chrome address bar for "Install" icon (⊕ or download icon)
- [ ] Click "Install" → Verify PWA installs as standalone app
- [ ] Open installed PWA → Verify it opens without browser UI
- [ ] Test offline mode:
  - [ ] In DevTools → Network, enable "Offline"
  - [ ] Navigate to any page
  - [ ] Expected: `/offline.html` shown
  - [ ] Disable "Offline" → Verify app works again
- [ ] Test on mobile (optional):
  - [ ] Deploy to Vercel or use ngrok for HTTPS
  - [ ] Open on Android/iOS device
  - [ ] Chrome (Android): Tap "Install app" from menu
  - [ ] Safari (iOS): Tap Share → "Add to Home Screen"
  - [ ] Verify app icon appears on home screen
  - [ ] Open app → Verify standalone mode (no browser UI)

**Acceptance Criteria:**

- ✅ Manifest loads without errors in DevTools
- ✅ Service worker registers and activates successfully
- ✅ Cache populated with static assets
- ✅ PWA installable in Chrome (shows install prompt)
- ✅ Offline page displays when network unavailable
- ✅ App works in standalone mode after installation
- ✅ (Optional) Mobile installation works on Android/iOS

**Testing Notes:**

- HTTPS required for PWA features (except localhost)
- Service worker only works on `localhost` or HTTPS origins
- Clear cache between tests: DevTools → Application → Clear storage

---

### Task 7: Test Service Worker Lifecycle (1 hour)

**Estimated Time:** 1 hour

**Test Cases:**

#### Test 7.1: First Installation

- [ ] Clear all site data (DevTools → Application → Clear storage)
- [ ] Refresh page
- [ ] Expected: Console logs "[SW] Installing..." then "[SW] Activating..."
- [ ] Expected: Cache `ims-cache-v1` created with 4 assets
- [ ] Expected: Service worker status "activated and running"

#### Test 7.2: Subsequent Visits

- [ ] Close and reopen browser tab
- [ ] Expected: No "[SW] Installing..." log (worker already installed)
- [ ] Expected: Service worker immediately active
- [ ] Expected: Cache still populated

#### Test 7.3: Service Worker Update

- [ ] Edit `public/sw.js`: Change `CACHE_NAME` to `'ims-cache-v2'`
- [ ] Save file and refresh page
- [ ] Expected: New service worker installing (shows in DevTools)
- [ ] Expected: Old service worker still active (waiting state)
- [ ] Click "skipWaiting" in DevTools or refresh again
- [ ] Expected: New service worker activates
- [ ] Expected: Old cache (`ims-cache-v1`) deleted
- [ ] Expected: New cache (`ims-cache-v2`) created

#### Test 7.4: Offline Navigation

- [ ] Navigate to `/installer` or `/admin` while online
- [ ] Enable "Offline" mode in DevTools → Network
- [ ] Navigate to different page or refresh
- [ ] Expected: `/offline.html` displayed
- [ ] Click "Reintentar" button
- [ ] Expected: Page attempts to reload (still shows offline)
- [ ] Disable "Offline" mode
- [ ] Click "Reintentar" again
- [ ] Expected: Page loads successfully

#### Test 7.5: API Requests Not Cached

- [ ] Log network requests in console
- [ ] Navigate to `/admin/installations` (or any page with API calls)
- [ ] Expected: Supabase API requests bypass cache (always hit network)
- [ ] Expected: No Supabase responses in cache storage
- [ ] Expected: Service worker logs skip API requests

#### Test 7.6: Cross-Origin Requests Ignored

- [ ] Observe network requests to external domains (if any)
- [ ] Expected: Service worker doesn't intercept cross-origin requests
- [ ] Expected: No cross-origin responses cached

**Acceptance Criteria:**

- ✅ All 6 test cases pass
- ✅ Service worker installs and activates correctly
- ✅ Cache updates work when service worker changes
- ✅ Offline fallback page displays correctly
- ✅ API requests bypass cache
- ✅ No unintended caching behavior

---

## Testing Strategy

### Unit Tests: Service Worker Logic

**Challenge:** Service workers run in a separate context (not Node.js)

**Approach:** Mock Service Worker API with Vitest

**File:** `src/lib/sw-helpers.test.ts` (if extracting logic)

**Note:** Since `sw.js` is a standalone file with no imports, unit testing is challenging. Consider:

**Option A:** Extract testable logic into helper functions

- Move cache logic to `src/lib/sw-cache.ts`
- Import in `sw.js` using `importScripts()` or ES modules
- Test helpers with Vitest

**Option B:** Skip unit tests, rely on E2E tests

- Service worker best tested in browser
- Playwright can test PWA functionality
- Less value in mocking Service Worker API

**Recommendation:** Option B (E2E only) for Phase 14

**Rationale:**

- Service worker is small and self-contained
- Browser behavior difficult to mock accurately
- E2E tests provide better coverage for PWA features
- Avoid over-engineering for simple implementation

---

### E2E Tests: PWA Functionality

**File:** `e2e/pwa.spec.ts`

**Test Cases:**

#### E2E Test 1: Service Worker Registration

```typescript
test('should register service worker on page load', async ({ page }) => {
  await page.goto('/');

  const swState = await page.evaluate(() => {
    return navigator.serviceWorker.controller?.state;
  });

  expect(swState).toBe('activated');
});
```

#### E2E Test 2: Manifest Loaded

```typescript
test('should load web app manifest', async ({ page }) => {
  await page.goto('/');

  const manifestLink = await page.locator('link[rel="manifest"]');
  expect(await manifestLink.getAttribute('href')).toBe('/manifest.json');

  const response = await page.goto('/manifest.json');
  expect(response?.status()).toBe(200);
});
```

#### E2E Test 3: Offline Fallback

```typescript
test('should show offline page when network unavailable', async ({ page, context }) => {
  await page.goto('/');

  // Wait for service worker to activate
  await page.waitForTimeout(1000);

  // Go offline
  await context.setOffline(true);

  // Navigate to new page
  await page.goto('/admin/installations', { waitUntil: 'networkidle' });

  // Should show offline page
  await expect(page.locator('h1')).toHaveText('Sin conexión');
});
```

#### E2E Test 4: Icons Accessible

```typescript
test('should load all PWA icons', async ({ page }) => {
  const icons = ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

  for (const icon of icons) {
    const response = await page.goto(icon);
    expect(response?.status()).toBe(200);
  }
});
```

#### E2E Test 5: Cache Population

```typescript
test('should cache static assets on install', async ({ page }) => {
  await page.goto('/');

  const cacheNames = await page.evaluate(async () => {
    return await caches.keys();
  });

  expect(cacheNames).toContain('ims-cache-v1');

  const cachedUrls = await page.evaluate(async () => {
    const cache = await caches.open('ims-cache-v1');
    const requests = await cache.keys();
    return requests.map((req) => req.url);
  });

  expect(cachedUrls).toContain(expect.stringContaining('/manifest.json'));
  expect(cachedUrls).toContain(expect.stringContaining('/favicon.svg'));
});
```

**Total E2E Tests:** 5 tests (30-45 minutes to write)

**Acceptance Criteria:**

- ✅ All 5 E2E tests pass
- ✅ Tests run in headless mode
- ✅ Tests work in Playwright UI mode
- ✅ No flaky tests (consistent results)

---

### Manual Testing Checklist

See **Task 6** for comprehensive manual testing steps.

**Quick Checklist:**

- [ ] Service worker registers successfully
- [ ] Manifest loads correctly
- [ ] Icons display in DevTools
- [ ] Cache populated with assets
- [ ] PWA installable in Chrome
- [ ] Offline page shows when offline
- [ ] App works in standalone mode
- [ ] Mobile installation works (Android/iOS)

---

## Security Considerations

### Service Worker Security

**Risk:** Service worker can intercept ALL network requests

**Mitigation:**

- ✅ Only cache same-origin requests (`url.origin === location.origin`)
- ✅ Never cache authentication requests (`/auth/*`)
- ✅ Never cache API requests (`/api/*`, Supabase)
- ✅ Service worker served over HTTPS (Vercel provides this)
- ✅ Service worker scope limited to root (`/`)

### Cache Poisoning Prevention

**Risk:** Malicious responses cached and served to users

**Mitigation:**

- ✅ Only cache successful responses (`response.ok`)
- ✅ Only cache GET requests (`request.method === 'GET'`)
- ✅ Network-first strategy (fresh data prioritized)
- ✅ Cache versioning (can invalidate entire cache)

### Push Notification Security (Phase 15 Preparation)

**Risk:** Unauthorized push notifications sent to users

**Mitigation:**

- ✅ VAPID keys required (server authentication)
- ✅ User permission required (browser prompts)
- ✅ Push subscription tied to user session
- ✅ Server validates subscription before sending

### Manifest Injection Prevention

**Risk:** Malicious manifest changes app behavior

**Mitigation:**

- ✅ Manifest served as static file (no dynamic generation)
- ✅ No user input in manifest
- ✅ Served with correct `Content-Type: application/json`
- ✅ Vercel provides CSP headers (prevents inline script injection)

---

## Performance Considerations

### Service Worker Impact

**Positive:**

- Offline support (app works without network)
- Faster subsequent loads (cached assets)
- Reduced bandwidth usage (cached responses)

**Negative:**

- Initial install delay (caching 4 assets ~200KB)
- Memory usage (cache storage ~200KB)
- CPU usage (service worker thread)

**Net Impact:** ✅ **Positive** (minimal overhead, significant UX improvement)

### Cache Size Management

**Current Size:** ~200KB (4 small assets)

**Growth Strategy:**

- Phase 14: Only essential assets (moderate caching)
- Phase 15: Add push notification service worker updates
- Future: Add offline data caching (if needed)

**Limits:**

- Browser cache quota: ~50MB-100MB (varies by browser)
- Service worker size limit: 5MB (not applicable, sw.js <10KB)
- Icon size limit: None, but keep under 1MB each

### Network-First Trade-offs

**Pro:**

- Always shows fresh data when online
- Prevents stale information
- User preference: moderate caching

**Con:**

- Slower when network slow (waits for network before cache)
- More bandwidth usage (network always tried first)

**Alternative (Not Used):**

- Cache-first: Faster but shows stale data
- Stale-while-revalidate: Shows stale, updates in background

**Decision:** Network-first aligns with user preference and IMS requirements (real-time installation data)

---

## Deployment Considerations

### Vercel Configuration

**Required:** None (Astro + Vercel handles PWA automatically)

**Automatic Behaviors:**

- `public/` folder copied to output root
- Static assets served with cache headers
- HTTPS provided by default
- Service worker registered at `/sw.js`

**No Special Configuration Needed:**

- No `vercel.json` changes
- No build script changes
- No environment variable changes

### HTTPS Requirement

**Development:** Localhost exempted (service worker works on `http://localhost`)

**Production:** HTTPS required (Vercel provides this)

**Staging/Preview:** Vercel preview URLs use HTTPS

### Cache Invalidation

**Strategy:** Cache versioning

**Process:**

1. Update `CACHE_NAME` to `'ims-cache-v2'` in `sw.js`
2. Commit and push to Vercel
3. Vercel deploys new service worker
4. Users' browsers download new service worker
5. New service worker installs (old still active)
6. User refreshes page → new service worker activates
7. Activation deletes old cache (`ims-cache-v1`)
8. New cache (`ims-cache-v2`) populated

**Automatic Process:** No manual intervention required

---

## Acceptance Criteria Summary

### Component Level

- ✅ All icon files exist and accessible
- ✅ Manifest valid JSON and accessible
- ✅ Offline page renders correctly
- ✅ Service worker registers successfully

### Functionality Level

- ✅ PWA installable in Chrome
- ✅ Offline fallback page displays when offline
- ✅ Cache populates with static assets
- ✅ Network-first strategy works correctly
- ✅ API/auth requests bypass cache

### Integration Level

- ✅ Service worker registration in BaseLayout works
- ✅ Manifest linked in BaseLayout
- ✅ Apple touch icon linked in BaseLayout
- ✅ All assets served correctly by Astro/Vercel

### Testing Level

- ✅ E2E tests pass (5 tests)
- ✅ Manual testing checklist complete
- ✅ Service worker lifecycle tests pass (6 test cases)

### Security Level

- ✅ Only same-origin requests cached
- ✅ API/auth requests never cached
- ✅ Service worker served over HTTPS in production
- ✅ Cache versioning prevents poisoning

### Performance Level

- ✅ Service worker doesn't block initial render
- ✅ Cache size under 1MB
- ✅ Network-first strategy prevents stale data
- ✅ Minimal overhead (page load <100ms slower)

---

## File Structure

```
public/
├── favicon.svg                     # Already exists
├── manifest.json                   # NEW
├── sw.js                           # NEW
├── offline.html                    # NEW
└── icons/                          # NEW DIRECTORY
    ├── icon-192.png                # NEW
    ├── icon-512.png                # NEW
    └── apple-touch-icon.png        # NEW

src/
└── layouts/
    └── BaseLayout.astro            # MODIFIED (add SW registration)

e2e/                                # NEW DIRECTORY
└── pwa.spec.ts                     # NEW (5 E2E tests)
```

---

## Next Steps After Phase 14

### Phase 15: Push Notifications

**Backend Requirements (Prepared in Phase 14):**

- ✅ VAPID keys already in `.env`
- ✅ Service worker push handlers already implemented (skeleton)
- ✅ Service worker notification click handlers ready

**Implementation Tasks (Phase 15):**

1. Create Edge Function to send push notifications
2. Implement push subscription management
3. Add UI for notification permissions
4. Test push notifications on mobile/desktop

**Database Changes (Phase 15):**

- Add `push_subscriptions` table
- Store subscription objects per user
- Link subscriptions to users/installers

---

## Appendix: Service Worker Debugging

### Chrome DevTools

**Location:** DevTools (F12) → Application → Service Workers

**Useful Features:**

- **Update on reload**: Automatically update service worker on page refresh
- **Bypass for network**: Disable service worker temporarily
- **Unregister**: Remove service worker completely
- **Inspect**: Open service worker in separate DevTools window
- **Push**: Test push notifications (Phase 15)

### Console Logging

All service worker events logged with `[SW]` prefix:

- `[SW] Installing...` - Service worker installing
- `[SW] Activating...` - Service worker activating
- `[SW] Registered: <scope>` - Registration successful
- `[SW] Caching static assets` - Assets being cached
- `[SW] Deleting old cache: <name>` - Old cache cleanup

### Cache Inspection

**Location:** DevTools → Application → Cache Storage

**View Cached Assets:**

1. Expand `ims-cache-v1` (or current version)
2. See list of cached URLs
3. Click URL to view response
4. Delete individual cache entries

**Clear All Caches:**
DevTools → Application → Clear storage → "Clear site data"

### Network Debugging

**Location:** DevTools → Network

**Filter Service Worker Requests:**

- Filter: `is:from-service-worker`
- See which requests served from cache vs. network

**Offline Testing:**

- Enable "Offline" checkbox
- Throttle network speed (Slow 3G, Fast 3G)

---

## Common Issues and Solutions

### Issue 1: Service Worker Not Registering

**Symptoms:**

- No "[SW] Registered" log in console
- DevTools shows "No service workers"

**Solutions:**

- ✅ Check HTTPS (or localhost)
- ✅ Verify `sw.js` accessible at `/sw.js`
- ✅ Check console for registration errors
- ✅ Clear site data and retry
- ✅ Check browser supports service workers

### Issue 2: Assets Not Caching

**Symptoms:**

- Cache empty or missing assets
- Offline page doesn't show

**Solutions:**

- ✅ Verify `STATIC_ASSETS` array correct
- ✅ Check asset paths absolute (e.g., `/icons/icon-192.png`)
- ✅ Ensure assets exist (check 404 errors)
- ✅ Check cache name matches in activate event
- ✅ Verify `cache.addAll()` succeeds (catch errors)

### Issue 3: Service Worker Not Updating

**Symptoms:**

- Changes to `sw.js` not reflected
- Old cache still used

**Solutions:**

- ✅ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Enable "Update on reload" in DevTools
- ✅ Unregister old service worker and reload
- ✅ Change `CACHE_NAME` to force update
- ✅ Wait 24 hours (browser auto-updates)

### Issue 4: PWA Not Installable

**Symptoms:**

- No install icon in Chrome address bar
- DevTools says "Not installable"

**Solutions:**

- ✅ Check manifest valid JSON
- ✅ Verify icons 192x192 and 512x512 exist
- ✅ Ensure `start_url` resolves
- ✅ Check service worker active
- ✅ Use HTTPS (or localhost)
- ✅ Visit site multiple times (Chrome threshold: 2+ visits)

### Issue 5: Offline Page Not Showing

**Symptoms:**

- "No internet" browser error instead of `/offline.html`

**Solutions:**

- ✅ Check offline page cached: `STATIC_ASSETS.push('/offline.html')` (NOTE: Not in current implementation)
- ✅ Verify fetch handler returns `caches.match('/offline.html')`
- ✅ Check `request.mode === 'navigate'` condition
- ✅ Hard refresh to update service worker
- ✅ Test in incognito (no browser cache interference)

**Fix for Issue 5:**
Add `/offline.html` to `STATIC_ASSETS` array in `sw.js`:

```javascript
const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html' // ADD THIS LINE
];
```

---

## Summary

Phase 14 implements PWA infrastructure with:

1. **Static Assets:** Icons, manifest, offline page, service worker
2. **Service Worker:** Client-side background script with network-first caching
3. **Cache Strategy:** Moderate caching (static assets only, network-first)
4. **Offline Support:** Fallback page when network unavailable
5. **Push Preparation:** Skeleton handlers for Phase 15
6. **Zero Backend Changes:** No database, no Edge Functions, no RLS

**Total Implementation Time:** 6-9 hours

**Breakdown:**

- Icon creation: 1-2 hours
- Manifest: 30 minutes
- Offline page: 1 hour
- Service worker: 2-3 hours
- Registration: 30 minutes
- Testing (manual): 1 hour
- Testing (E2E): 1 hour

**Security:** ✅ Safe (same-origin, no auth caching)

**Performance:** ✅ Positive impact (offline support, faster loads)

**Complexity:** ✅ Low (self-contained, no dependencies)

**User Experience:** ✅ Significant improvement (installable, offline support)

**Phase 14 Complete When:**

- ✅ All 7 tasks checked
- ✅ E2E tests pass (5 tests)
- ✅ Manual testing complete (8 test cases)
- ✅ PWA installable in browser
- ✅ Offline page works
- ✅ No console errors

**Next Phase:** Phase 15 - Push Notifications (uses VAPID keys + push handlers from Phase 14)
