# Phase 14: PWA Setup - Backend Implementation Checklist

## Overview

This checklist contains all backend-related tasks for Phase 14: PWA Setup. This phase is primarily client-side focused (service worker, manifest) with minimal backend requirements.

**Key Points:**

- No database migrations required
- No Edge Functions required
- No RLS policy changes
- Service worker runs client-side (browser context)
- Static assets served via Vercel/Astro
- Estimated total time: 6-9 hours

---

## Task 1: Create Icon Assets (1-2 hours)

### Description

Create placeholder PWA icons (192x192, 512x512, 180x180) with blue background and white "IMS" text.

### Steps

- [ ] Create directory `public/icons/` (if not exists)
- [ ] Generate or create `icon-192.png` (192x192 px, blue #2563eb, white "IMS" text)
  - Use online tool: https://favicon.io/favicon-generator/
  - Settings: Blue background (#2563eb), white text "IMS", sans-serif font
  - Or use ImageMagick: `convert -size 192x192 xc:#2563eb -fill white -gravity center -pointsize 80 -annotate 0 "IMS" public/icons/icon-192.png`
- [ ] Generate or create `icon-512.png` (512x512 px, blue #2563eb, white "IMS" text)
  - Same process as 192x192 but larger
  - ImageMagick: `convert -size 512x512 xc:#2563eb -fill white -gravity center -pointsize 200 -annotate 0 "IMS" public/icons/icon-512.png`
- [ ] Generate or create `apple-touch-icon.png` (180x180 px, blue #2563eb, white "IMS" text)
  - Required for iOS "Add to Home Screen"
  - ImageMagick: `convert -size 180x180 xc:#2563eb -fill white -gravity center -pointsize 70 -annotate 0 "IMS" public/icons/apple-touch-icon.png`
- [ ] Verify all icons load in browser (open http://localhost:4321/icons/icon-192.png)
- [ ] Verify file sizes are reasonable (<50KB each for placeholders)

### Testing

```bash
npm run dev
# Open in browser:
# - http://localhost:4321/icons/icon-192.png (should display blue icon with "IMS")
# - http://localhost:4321/icons/icon-512.png (should display blue icon with "IMS")
# - http://localhost:4321/icons/apple-touch-icon.png (should display blue icon with "IMS")
```

### Acceptance Criteria

- ✅ All 3 icon files exist in `public/icons/`
- ✅ Icons are accessible via browser at `/icons/icon-*.png`
- ✅ Icons display correctly with blue background (#2563eb) and white "IMS" text
- ✅ File sizes under 50KB each (placeholder quality)
- ✅ No 404 errors when accessing icons

---

## Task 2: Create Web App Manifest (30 minutes)

### Description

Create `manifest.json` defining PWA metadata (name, icons, colors, display mode).

### Steps

- [ ] Create file `public/manifest.json`
- [ ] Add all required manifest fields:
  ```json
  {
    "name": "IMS - Installation Management System",
    "short_name": "IMS",
    "description": "Sistema de gestión de instalaciones",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2563eb",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "categories": ["business", "productivity"],
    "lang": "es",
    "dir": "ltr"
  }
  ```
- [ ] Verify JSON syntax (no trailing commas, valid JSON)
- [ ] Verify manifest loads at http://localhost:4321/manifest.json
- [ ] Validate JSON with https://jsonlint.com/

### Testing

```bash
npm run dev
# Open: http://localhost:4321/manifest.json
# Expected: JSON file downloads/displays correctly
# Copy JSON to https://jsonlint.com/ → Validate
```

### Acceptance Criteria

- ✅ File exists at `public/manifest.json`
- ✅ Valid JSON syntax (no errors on jsonlint.com)
- ✅ All required fields present (name, icons, start_url, display)
- ✅ Accessible via browser at `/manifest.json`
- ✅ Icon paths resolve correctly (absolute paths: `/icons/icon-*.png`)
- ✅ Theme color matches IMS brand (#2563eb)

---

## Task 3: Create Offline Fallback Page (1 hour)

### Description

Create static HTML page shown when user navigates while offline.

### Steps

- [ ] Create file `public/offline.html`
- [ ] Add complete HTML structure with inline styles:
  - HTML5 doctype, `lang="es"`
  - Viewport meta tag
  - Title: "Sin conexión | IMS"
- [ ] Add inline CSS styles:
  - CSS reset (margin, padding, box-sizing)
  - Body: gradient background (#eff6ff to #dbeafe), flexbox centering
  - Icon container: 80x80 circle, red background (#fee2e2), centered SVG
  - Title: 24px, gray-900
  - Message: 16px, gray-600, line-height 1.5
  - Button: blue (#2563eb), white text, hover effect (#1d4ed8)
- [ ] Add content structure:
  - Container div with centered content
  - Icon div with WiFi-off SVG icon
  - H1: "Sin conexión"
  - Paragraph: "No tienes conexión a internet. Verifica tu conexión e intenta de nuevo."
  - Button with `onclick="location.reload()"`: "Reintentar"
- [ ] Verify page renders correctly at http://localhost:4321/offline.html
- [ ] Test button reloads page

### Testing

```bash
npm run dev
# Open: http://localhost:4321/offline.html
# Expected: See styled offline page with blue button
# Click "Reintentar" button → Page reloads
# Verify responsive design (resize browser)
```

### Acceptance Criteria

- ✅ File exists at `public/offline.html`
- ✅ Valid HTML5 syntax (no errors in W3C validator)
- ✅ All styles inline (no external CSS files)
- ✅ No external dependencies (images, fonts, scripts)
- ✅ Responsive design (works on mobile 320px+ and desktop)
- ✅ "Reintentar" button reloads page
- ✅ Accessible via browser at `/offline.html`
- ✅ WiFi-off icon displays correctly

---

## Task 4: Implement Service Worker (2-3 hours)

### Description

Create service worker script handling cache management, offline support, and push notifications (skeleton).

### Steps

#### 4.1: Setup and Constants

- [ ] Create file `public/sw.js`
- [ ] Define constant `CACHE_NAME = 'ims-cache-v1'`
- [ ] Define array `STATIC_ASSETS`:
  ```javascript
  const STATIC_ASSETS = [
    '/favicon.svg',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/offline.html' // IMPORTANT: Include offline page
  ];
  ```

#### 4.2: Install Event Handler

- [ ] Implement `install` event listener
- [ ] Log "[SW] Installing..."
- [ ] Open cache with `caches.open(CACHE_NAME)`
- [ ] Cache all `STATIC_ASSETS` with `cache.addAll()`
- [ ] Call `self.skipWaiting()` to activate immediately
- [ ] Use `event.waitUntil()` to keep worker alive
- [ ] Handle errors gracefully (log but don't fail)

#### 4.3: Activate Event Handler

- [ ] Implement `activate` event listener
- [ ] Log "[SW] Activating..."
- [ ] Get all cache names with `caches.keys()`
- [ ] Delete caches where `name !== CACHE_NAME`
- [ ] Call `self.clients.claim()` to take control of pages
- [ ] Use `event.waitUntil()` to keep worker alive

#### 4.4: Fetch Event Handler (Network-First Strategy)

- [ ] Implement `fetch` event listener
- [ ] Extract `request` and `url` from event
- [ ] Skip cross-origin requests (`url.origin !== location.origin`)
- [ ] Skip API/auth requests:
  - `/api/*` paths
  - `/auth/*` paths
  - URLs containing `supabase`
- [ ] Implement network-first logic:
  - Try `fetch(request)` first
  - On success: clone response, update cache, return original
  - On failure: try `caches.match(request)`
  - If navigate mode and no cache: return `/offline.html`
  - Otherwise: return `Response` with 503 status
- [ ] Use `event.respondWith()` to intercept response

#### 4.5: Message Event Handler

- [ ] Implement `message` event listener
- [ ] Check for `event.data.type === 'SKIP_WAITING'`
- [ ] Call `self.skipWaiting()` if message received
- [ ] Purpose: Allow manual service worker update

#### 4.6: Push Notification Handlers (Skeleton for Phase 15)

- [ ] Implement `push` event listener:
  - Log push event
  - Check if `event.data` exists
  - Parse `event.data.json()`
  - Show notification with `self.registration.showNotification()`
  - Use icon `/icons/icon-192.png`
  - Use `event.waitUntil()` to keep worker alive
- [ ] Implement `notificationclick` event listener:
  - Close notification with `event.notification.close()`
  - Get URL from `event.notification.data.url` or default to `/`
  - Use `clients.matchAll()` to find existing windows
  - Focus existing window or open new one
  - Use `event.waitUntil()` to keep worker alive

#### 4.7: Console Logging and Debugging

- [ ] Add console logs for all events (prefixed with "[SW]")
- [ ] Log cache operations (add, delete, match)
- [ ] Log skipped requests (API, auth, cross-origin)
- [ ] Log errors with stack traces

### Testing

```bash
npm run dev
# Open DevTools (F12) → Application → Service Workers
# Expected: No service worker registered yet (registration in next task)
# Manually test by opening DevTools Console and running:
# navigator.serviceWorker.register('/sw.js')
# Expected: Service worker registers, console shows "[SW] Installing..." then "[SW] Activating..."
```

### Acceptance Criteria

- ✅ File exists at `public/sw.js`
- ✅ Valid JavaScript syntax (no errors in console)
- ✅ Install event caches 5 static assets (including `/offline.html`)
- ✅ Activate event cleans old caches correctly
- ✅ Fetch event implements network-first strategy
- ✅ Cross-origin requests ignored (not intercepted)
- ✅ API/auth requests ignored (bypass cache)
- ✅ Offline navigation shows `/offline.html`
- ✅ Push notification handlers prepared (not fully functional)
- ✅ All event handlers use `event.waitUntil()` correctly
- ✅ Console logs all events with "[SW]" prefix

---

## Task 5: Add Service Worker Registration (30 minutes)

### Description

Update `BaseLayout.astro` to register service worker and link manifest.

### Steps

- [ ] Open `src/layouts/BaseLayout.astro`
- [ ] Add manifest link to `<head>` section:
  ```html
  <link rel="manifest" href="/manifest.json" />
  ```
- [ ] Add apple touch icon link to `<head>` section:
  ```html
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  ```
- [ ] Add service worker registration script before `</body>`:
  ```html
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
- [ ] Verify script is inline (not external file)
- [ ] Verify no TypeScript errors in project

### Testing

```bash
npm run dev
# Open http://localhost:4321
# Open DevTools (F12) → Console
# Expected: "[SW] Registered: http://localhost:4321/"
# Open DevTools → Application → Service Workers
# Expected: Service worker "activated and running"
```

### Acceptance Criteria

- ✅ Manifest link added to `<head>` section
- ✅ Apple touch icon link added to `<head>` section
- ✅ Service worker registration script added before `</body>`
- ✅ Registration happens after page load (doesn't block render)
- ✅ Browser support check included (`'serviceWorker' in navigator`)
- ✅ Error handling included (catch block logs error)
- ✅ No TypeScript/build errors
- ✅ Script inline (not external .js file)

---

## Task 6: Verify PWA Installation (1 hour)

### Description

Comprehensive manual testing of PWA functionality.

### Steps

#### 6.1: Verify Manifest Loading

- [ ] Open app in Chrome: http://localhost:4321
- [ ] Open DevTools → Application → Manifest
- [ ] Verify all manifest properties display correctly:
  - Name: "IMS - Installation Management System"
  - Short name: "IMS"
  - Start URL: "/"
  - Display: "standalone"
  - Theme color: #2563eb
  - Icons: 192x192 and 512x512 shown with preview

#### 6.2: Verify Service Worker Registration

- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker registered:
  - Status: "activated and running" (green dot)
  - Scope: "/"
  - Source: "/sw.js"
- [ ] Click "Update" → Service worker re-installs
- [ ] Check console for "[SW] Installing..." and "[SW] Activating..." logs

#### 6.3: Verify Cache Population

- [ ] Open DevTools → Application → Cache Storage
- [ ] Verify cache `ims-cache-v1` exists
- [ ] Expand cache → Verify 5 cached assets:
  - `/favicon.svg`
  - `/manifest.json`
  - `/icons/icon-192.png`
  - `/icons/icon-512.png`
  - `/offline.html`
- [ ] Click asset → Preview shows content

#### 6.4: Test PWA Installability

- [ ] Check Chrome address bar for "Install" icon (⊕ or download icon)
- [ ] Click "Install" → Verify install prompt appears
- [ ] Click "Install" in prompt → App installs
- [ ] Verify installed app opens in new window (no browser UI)
- [ ] Check taskbar/dock → App icon appears

#### 6.5: Test Offline Mode

- [ ] In DevTools → Network, enable "Offline" checkbox
- [ ] Navigate to any page (e.g., `/admin/installations`)
- [ ] Expected: `/offline.html` displayed with "Sin conexión" message
- [ ] Click "Reintentar" button → Page still offline
- [ ] Disable "Offline" → Click "Reintentar" again
- [ ] Expected: Page loads successfully

#### 6.6: Test Mobile Installation (Optional)

- [ ] Deploy to Vercel or use ngrok for HTTPS tunnel
- [ ] Open on Android device (Chrome):
  - Tap Chrome menu → "Install app"
  - Or banner appears automatically
  - App icon appears on home screen
- [ ] Open on iOS device (Safari):
  - Tap Share button → "Add to Home Screen"
  - App icon appears on home screen
- [ ] Open installed app → Verify standalone mode (no browser UI)

### Acceptance Criteria

- ✅ Manifest loads without errors in DevTools
- ✅ All manifest properties display correctly
- ✅ Service worker registers and activates successfully
- ✅ Cache populated with all 5 static assets
- ✅ PWA installable in Chrome (shows install prompt)
- ✅ Offline page displays when network unavailable
- ✅ "Reintentar" button works correctly
- ✅ App works in standalone mode after installation
- ✅ (Optional) Mobile installation works on Android/iOS

---

## Task 7: Test Service Worker Lifecycle (1 hour)

### Description

Test service worker installation, activation, updates, and edge cases.

### Test Cases

#### Test 7.1: First Installation

- [ ] Clear all site data (DevTools → Application → Clear storage → "Clear site data")
- [ ] Refresh page (F5)
- [ ] Expected: Console logs "[SW] Installing..." then "[SW] Activating..."
- [ ] Expected: Cache `ims-cache-v1` created with 5 assets
- [ ] Expected: Service worker status "activated and running"
- [ ] Expected: No errors in console

#### Test 7.2: Subsequent Visits

- [ ] Close browser tab completely
- [ ] Reopen tab and navigate to http://localhost:4321
- [ ] Expected: NO "[SW] Installing..." log (worker already installed)
- [ ] Expected: Service worker immediately active
- [ ] Expected: Cache still populated (5 assets)
- [ ] Expected: Page loads faster (cached assets)

#### Test 7.3: Service Worker Update

- [ ] Edit `public/sw.js`: Change `CACHE_NAME` to `'ims-cache-v2'`
- [ ] Save file and refresh page (F5)
- [ ] Open DevTools → Application → Service Workers
- [ ] Expected: New service worker in "waiting to activate" state
- [ ] Expected: Old service worker still active
- [ ] Click "skipWaiting" in DevTools or refresh again (Shift+F5)
- [ ] Expected: New service worker activates
- [ ] Open DevTools → Application → Cache Storage
- [ ] Expected: Old cache `ims-cache-v1` deleted
- [ ] Expected: New cache `ims-cache-v2` created
- [ ] Revert change: Change back to `'ims-cache-v1'` for consistency

#### Test 7.4: Offline Navigation

- [ ] Navigate to `/installer` or `/admin` while online
- [ ] Verify page loads correctly
- [ ] Enable "Offline" mode in DevTools → Network
- [ ] Navigate to different page or refresh (F5)
- [ ] Expected: `/offline.html` displayed with "Sin conexión" message
- [ ] Expected: Blue "Reintentar" button visible
- [ ] Click "Reintentar" → Page attempts reload (still offline)
- [ ] Disable "Offline" mode
- [ ] Click "Reintentar" again → Expected: Page loads successfully

#### Test 7.5: API Requests Not Cached

- [ ] Clear console (DevTools → Console → Clear)
- [ ] Navigate to `/admin/installations` (or any page with Supabase queries)
- [ ] Open DevTools → Network tab
- [ ] Filter: `supabase` in request URL
- [ ] Expected: Supabase API requests hit network (not cached)
- [ ] Expected: No Supabase responses in Cache Storage
- [ ] Check console: Expected: Service worker logs skip API requests

#### Test 7.6: Cross-Origin Requests Ignored

- [ ] Clear console
- [ ] Open DevTools → Network tab
- [ ] Navigate to page (if any external resources loaded)
- [ ] Filter: cross-origin requests (different domain)
- [ ] Expected: Service worker doesn't intercept cross-origin requests
- [ ] Expected: No cross-origin responses cached
- [ ] Check Cache Storage → No external domain assets

### Acceptance Criteria

- ✅ Test 7.1 (First Installation) passes
- ✅ Test 7.2 (Subsequent Visits) passes
- ✅ Test 7.3 (Service Worker Update) passes
- ✅ Test 7.4 (Offline Navigation) passes
- ✅ Test 7.5 (API Requests Not Cached) passes
- ✅ Test 7.6 (Cross-Origin Requests Ignored) passes
- ✅ No console errors in any test
- ✅ Service worker lifecycle works correctly
- ✅ Cache management works as expected

---

## Task 8: Write E2E Tests (1 hour)

### Description

Create Playwright E2E tests for PWA functionality.

### Steps

- [ ] Create file `e2e/pwa.spec.ts`
- [ ] Import Playwright `test` and `expect`
- [ ] Write Test 1: Service Worker Registration
  ```typescript
  test('should register service worker on page load', async ({ page }) => {
    await page.goto('/');
    const swState = await page.evaluate(() => {
      return navigator.serviceWorker.controller?.state;
    });
    expect(swState).toBe('activated');
  });
  ```
- [ ] Write Test 2: Manifest Loaded
  ```typescript
  test('should load web app manifest', async ({ page }) => {
    await page.goto('/');
    const manifestLink = await page.locator('link[rel="manifest"]');
    expect(await manifestLink.getAttribute('href')).toBe('/manifest.json');
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
  });
  ```
- [ ] Write Test 3: Offline Fallback
  ```typescript
  test('should show offline page when network unavailable', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await context.setOffline(true);
    await page.goto('/admin/installations', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Sin conexión');
  });
  ```
- [ ] Write Test 4: Icons Accessible
  ```typescript
  test('should load all PWA icons', async ({ page }) => {
    const icons = ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];
    for (const icon of icons) {
      const response = await page.goto(icon);
      expect(response?.status()).toBe(200);
    }
  });
  ```
- [ ] Write Test 5: Cache Population
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

### Testing

```bash
npm run test:e2e
# Expected: All 5 tests pass
# Or run in UI mode:
npm run test:e2e:debug
# Navigate to pwa.spec.ts → Run tests
```

### Acceptance Criteria

- ✅ File `e2e/pwa.spec.ts` created
- ✅ All 5 E2E tests written
- ✅ Tests pass in headless mode (`npm run test:e2e`)
- ✅ Tests pass in UI mode (`npm run test:e2e:debug`)
- ✅ No flaky tests (consistent results on multiple runs)
- ✅ Test coverage includes service worker, manifest, icons, cache, offline

---

## Code Quality Checklist

### Pre-Commit Verification

- [ ] Run `npm run build` → Build succeeds with no errors
- [ ] Run `npm run lint` → No ESLint errors
- [ ] Run `npm run format` → All files formatted correctly
- [ ] Run `npm run test:e2e` → All E2E tests pass (5 tests)
- [ ] Verify TypeScript strict mode compliance (no type errors)
- [ ] Check browser console → No errors or warnings

### File Organization

- [ ] All PWA assets in `public/` directory
- [ ] Icons in `public/icons/` subdirectory
- [ ] Service worker at `public/sw.js` (root of public)
- [ ] Manifest at `public/manifest.json` (root of public)
- [ ] Offline page at `public/offline.html` (root of public)
- [ ] E2E tests in `e2e/` directory

### Documentation

- [ ] All tasks in this checklist completed
- [ ] `PHASE_14_BACKEND_ARCHITECTURE.md` reviewed and accurate
- [ ] Update `.env.example` if needed (no new env vars for Phase 14)
- [ ] Update `README.md` if needed (mention PWA features)

---

## Security Verification

### Service Worker Security

- [ ] Only same-origin requests cached (`url.origin === location.origin`)
- [ ] Authentication requests never cached (`/auth/*` excluded)
- [ ] API requests never cached (`/api/*` and `supabase` excluded)
- [ ] Cross-origin requests ignored (not intercepted)
- [ ] Only successful responses cached (`response.ok`)
- [ ] Only GET requests cached (`request.method === 'GET'`)

### Manifest Security

- [ ] Manifest served as static file (no dynamic generation)
- [ ] No user input in manifest (all values hardcoded)
- [ ] Correct `Content-Type: application/json` header (Vercel handles)
- [ ] Icon paths absolute (no relative paths that could be manipulated)

### Cache Poisoning Prevention

- [ ] Cache versioning implemented (`CACHE_NAME` with version)
- [ ] Old caches deleted on activation
- [ ] Network-first strategy (fresh data prioritized)
- [ ] No sensitive data cached (no auth tokens, API responses)

---

## Performance Verification

### Service Worker Performance

- [ ] Service worker registration doesn't block page load (`window.addEventListener('load', ...)`)
- [ ] Cache operations async (no blocking main thread)
- [ ] Static assets cache size < 1MB (currently ~200KB)
- [ ] No memory leaks (service worker properly terminates)

### Cache Strategy Performance

- [ ] Network-first prevents stale data (always tries network first)
- [ ] Cache only used as fallback (offline support)
- [ ] No unnecessary cache reads (skip API/auth requests)
- [ ] Cache updates async (doesn't slow down responses)

### Bundle Size Impact

- [ ] Service worker file size < 10KB (currently ~5KB)
- [ ] Manifest file size < 1KB
- [ ] Offline page size < 5KB (inline styles)
- [ ] Icons total size < 150KB (3 placeholder icons)

---

## Deployment Checklist

### Vercel Deployment (Automatic)

- [ ] Verify `public/` folder structure correct
- [ ] Push to Git → Vercel deploys automatically
- [ ] No `vercel.json` changes needed
- [ ] HTTPS provided by default (required for service worker)

### Post-Deployment Verification

- [ ] Visit production URL (https://ims.vercel.app or custom domain)
- [ ] Open DevTools → Application → Service Workers
- [ ] Expected: Service worker registered and active
- [ ] Open DevTools → Application → Manifest
- [ ] Expected: Manifest loads correctly
- [ ] Test PWA installation in production
- [ ] Test offline mode in production

### Mobile Testing

- [ ] Test on Android device (Chrome)
- [ ] Test on iOS device (Safari)
- [ ] Verify "Add to Home Screen" works
- [ ] Verify standalone mode works (no browser UI)
- [ ] Verify icons appear correctly on home screen

---

## Final Acceptance Criteria

### Component Level

- ✅ All icon files exist and accessible (3 files)
- ✅ Manifest valid JSON and accessible
- ✅ Offline page renders correctly
- ✅ Service worker valid JavaScript and registers

### Functionality Level

- ✅ PWA installable in Chrome (desktop and mobile)
- ✅ Offline fallback page displays when offline
- ✅ Cache populates with 5 static assets
- ✅ Network-first strategy works correctly
- ✅ API/auth requests bypass cache

### Integration Level

- ✅ Service worker registration in BaseLayout works
- ✅ Manifest linked in BaseLayout `<head>`
- ✅ Apple touch icon linked in BaseLayout `<head>`
- ✅ All assets served correctly by Astro/Vercel

### Testing Level

- ✅ All 5 E2E tests pass consistently
- ✅ All 6 manual test cases pass (Task 7)
- ✅ PWA installation verified on desktop
- ✅ Mobile installation verified (Android and/or iOS)

### Security Level

- ✅ Only same-origin requests cached
- ✅ API/auth requests never cached
- ✅ Service worker served over HTTPS in production
- ✅ Cache versioning prevents poisoning

### Performance Level

- ✅ Service worker doesn't block initial render
- ✅ Cache size under 1MB (~200KB)
- ✅ Network-first strategy prevents stale data
- ✅ Page load performance acceptable (<100ms overhead)

### Deployment Level

- ✅ Production deployment successful
- ✅ Service worker works in production
- ✅ PWA installable in production
- ✅ Mobile testing completed (Android/iOS)

---

## Estimated Time Breakdown

- **Task 1:** Icon creation - 1-2 hours
- **Task 2:** Manifest - 30 minutes
- **Task 3:** Offline page - 1 hour
- **Task 4:** Service worker - 2-3 hours
- **Task 5:** Registration - 30 minutes
- **Task 6:** Manual testing - 1 hour
- **Task 7:** Lifecycle testing - 1 hour
- **Task 8:** E2E tests - 1 hour

**Total: 8-10 hours** (including testing and verification)

---

## Common Issues and Solutions

### Issue: Service Worker Not Registering

**Symptoms:** No "[SW] Registered" log in console

**Solutions:**

- ✅ Verify HTTPS or localhost
- ✅ Check `sw.js` accessible at `/sw.js`
- ✅ Clear site data and retry
- ✅ Check browser console for errors

### Issue: Assets Not Caching

**Symptoms:** Cache empty or offline page doesn't show

**Solutions:**

- ✅ Verify `STATIC_ASSETS` array includes `/offline.html`
- ✅ Check asset paths are absolute (`/icons/icon-192.png`)
- ✅ Ensure assets exist (check 404 errors)
- ✅ Hard refresh (Ctrl+Shift+R)

### Issue: Service Worker Not Updating

**Symptoms:** Changes to `sw.js` not reflected

**Solutions:**

- ✅ Enable "Update on reload" in DevTools
- ✅ Unregister old service worker
- ✅ Change `CACHE_NAME` version
- ✅ Hard refresh (Ctrl+Shift+R)

### Issue: PWA Not Installable

**Symptoms:** No install icon in Chrome

**Solutions:**

- ✅ Verify manifest valid JSON
- ✅ Check icons 192x192 and 512x512 exist
- ✅ Ensure service worker active
- ✅ Use HTTPS (or localhost)
- ✅ Visit site multiple times (Chrome threshold)

---

## Notes

### No Unit Tests

Service worker runs in browser context, not Node.js. Unit testing service workers with mocks provides minimal value. E2E tests in Playwright provide better coverage.

### VAPID Keys Prepared

VAPID keys already configured in `.env` for Phase 15 (Push Notifications). Service worker includes skeleton push handlers.

### Network-First Rationale

Network-first strategy chosen per user preference ("moderate caching"). Prevents stale installation data while providing offline fallback.

### iOS Quirks

- Safari requires "Add to Home Screen" (no automatic install prompt)
- Service worker support limited (some features may not work)
- Push notifications not supported on iOS (Phase 15 limitation)

---

## Phase 14 Complete When

- ✅ All 8 tasks checked and completed
- ✅ All acceptance criteria met
- ✅ All E2E tests pass (5 tests)
- ✅ All manual tests pass (Task 6 and Task 7)
- ✅ Code quality checklist complete
- ✅ Security verification complete
- ✅ Performance verification complete
- ✅ Deployment checklist complete
- ✅ PWA installable and functional in production

**Next Phase:** Phase 15 - Push Notifications (uses VAPID keys and push handlers from Phase 14)
