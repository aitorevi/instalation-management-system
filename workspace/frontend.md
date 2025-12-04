# Frontend Architecture - Phase 14: PWA Setup

## Overview

Phase 14 implements Progressive Web App capabilities for IMS, making the application installable on devices and providing basic offline functionality. This phase focuses on creating PWA assets (manifest, icons, favicon), implementing an offline fallback page, and ensuring proper service worker registration.

**Backend Status**: N/A (Frontend-only phase)

**User Preferences Applied**:

- Simple placeholder icons with blue (#2563eb) background and 'IMS' text
- Blue theme color (#2563eb)
- Moderate caching strategy (network-first with cache fallback)

---

## Implementation Checklist

### Task 1: Create Placeholder PWA Icons

**Files**:

- `public/icons/icon-192.png` (NEW)
- `public/icons/icon-512.png` (NEW)
- `public/icons/apple-touch-icon.png` (NEW)

**Objective**: Create simple placeholder icons for PWA installation and home screen.

**Implementation Steps**:

- [ ] Create 192x192 PNG icon
  - Blue background (#2563eb)
  - White 'IMS' text centered
  - Sans-serif font, bold weight
  - Export as `icon-192.png` to `public/icons/`

- [ ] Create 512x512 PNG icon
  - Blue background (#2563eb)
  - White 'IMS' text centered
  - Sans-serif font, bold weight
  - Larger text proportional to canvas
  - Export as `icon-512.png` to `public/icons/`

- [ ] Create 180x180 Apple touch icon
  - Blue background (#2563eb)
  - White 'IMS' text centered
  - Sans-serif font, bold weight
  - Export as `apple-touch-icon.png` to `public/icons/`

**Tools**: Use any of the following:

- Online tool: [Placeholder Image Generator](https://placeholder.com/)
- ImageMagick CLI (if available)
- Canvas/Figma/Any image editor
- Node.js script with `canvas` library

**ImageMagick Example** (if available):

```bash
convert -size 192x192 xc:#2563eb -fill white -gravity center -pointsize 80 -font Arial-Bold -annotate 0 "IMS" public/icons/icon-192.png
convert -size 512x512 xc:#2563eb -fill white -gravity center -pointsize 240 -font Arial-Bold -annotate 0 "IMS" public/icons/icon-512.png
convert -size 180x180 xc:#2563eb -fill white -gravity center -pointsize 72 -font Arial-Bold -annotate 0 "IMS" public/icons/apple-touch-icon.png
```

**Acceptance Criteria**:

- ✅ All three PNG files exist in `public/icons/` directory
- ✅ Icons display blue background (#2563eb)
- ✅ Icons display white 'IMS' text
- ✅ Icons are correctly sized (192x192, 512x512, 180x180)
- ✅ Icons are optimized for web (no excessive file size)
- ✅ Icons load correctly in browser (test with direct URL)

**Estimated Time**: 30 minutes

---

### Task 2: Replace Favicon with IMS Branding

**File**: `public/favicon.svg` (REPLACE)

**Objective**: Replace Astro default favicon with IMS-branded SVG favicon.

**Implementation Steps**:

- [ ] Create new favicon.svg with IMS branding
  - Blue rounded rectangle background (#2563eb, rounded corners)
  - Simple house/building icon in white (represents installations)
  - Or white 'IMS' text if icon is too complex
  - Ensure SVG is viewable at 16x16 and 32x32 sizes

**SVG Design Options**:

**Option A: Building Icon**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <path d="M50 20 L80 45 L80 80 L20 80 L20 45 Z" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="40" y="55" width="20" height="25" fill="white" rx="2"/>
  <circle cx="50" cy="38" r="8" fill="white"/>
</svg>
```

**Option B: Simple IMS Text**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <text x="50" y="65" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">IMS</text>
</svg>
```

- [ ] Replace existing `public/favicon.svg` with new design
- [ ] Test favicon in browser (clear cache if needed)

**Acceptance Criteria**:

- ✅ File exists at `public/favicon.svg`
- ✅ SVG displays correctly in browser tab
- ✅ SVG uses blue (#2563eb) theme color
- ✅ SVG is viewable at small sizes (16x16, 32x32)
- ✅ SVG works in both light and dark mode browsers

**Estimated Time**: 20 minutes

---

### Task 3: Create Web App Manifest

**File**: `public/manifest.json` (NEW)

**Objective**: Create PWA manifest for installability and app metadata.

**Implementation Steps**:

- [ ] Create `manifest.json` in `public/` directory
- [ ] Configure manifest with following properties:
  - `name`: "IMS - Installation Management System"
  - `short_name`: "IMS"
  - `description`: "Sistema de gestión de instalaciones"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#ffffff"
  - `theme_color`: "#2563eb"
  - `orientation`: "portrait-primary"
  - `icons`: Array with 192x192 and 512x512 icons
  - `categories`: ["business", "productivity"]
  - `lang`: "es"
  - `dir`: "ltr"

**Complete Manifest**:

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

**Acceptance Criteria**:

- ✅ File exists at `public/manifest.json`
- ✅ Valid JSON syntax (no errors)
- ✅ All required properties present
- ✅ Icon paths are correct (`/icons/icon-192.png`, `/icons/icon-512.png`)
- ✅ Theme color matches design system (#2563eb)
- ✅ Display mode is "standalone"
- ✅ Start URL is "/"

**Estimated Time**: 15 minutes

---

### Task 4: Create Service Worker

**File**: `public/sw.js` (NEW)

**Objective**: Implement service worker with moderate caching strategy (network-first with cache fallback) and offline support.

**Implementation Steps**:

- [ ] Create `sw.js` file in `public/` directory
- [ ] Define cache name with version: `'ims-cache-v1'`
- [ ] Define static assets to pre-cache:
  - `/favicon.svg`
  - `/manifest.json`
  - `/icons/icon-192.png`
  - `/icons/icon-512.png`
- [ ] Implement install event handler
  - Pre-cache static assets
  - Call `self.skipWaiting()` to activate immediately
- [ ] Implement activate event handler
  - Delete old caches (cache cleanup)
  - Call `self.clients.claim()` to take control
- [ ] Implement fetch event handler
  - **Strategy**: Network-first with cache fallback
  - Ignore non-same-origin requests
  - Ignore `/api/*`, `/auth/*`, and Supabase requests
  - Attempt network fetch first
  - On success (GET requests), update cache
  - On network failure, serve from cache
  - On cache miss + network failure, serve `/offline.html` for navigation requests
- [ ] Add message event listener (for future updates)
- [ ] Add push notification handlers (prepared for Phase 15)
  - `push` event: Show notification with data
  - `notificationclick` event: Open app or focus existing window

**Complete Service Worker Code**: See `workspace/planning/14-PWA-SETUP.md` lines 100-253

**Key Features**:

- Network-first strategy (always try to get fresh content)
- Cache fallback for offline resilience
- Automatic cache updates on successful fetches
- Old cache cleanup on activation
- Prepared for push notifications (Phase 15)

**Acceptance Criteria**:

- ✅ File exists at `public/sw.js`
- ✅ Valid JavaScript syntax (no errors)
- ✅ Pre-caches static assets on install
- ✅ Cleans up old caches on activate
- ✅ Network-first strategy implemented correctly
- ✅ Ignores API/auth/Supabase requests
- ✅ Serves offline page when network and cache unavailable
- ✅ Push notification handlers prepared (not active yet)

**Estimated Time**: 1 hour

---

### Task 5: Create Offline Fallback Page

**File**: `public/offline.html` (NEW)

**Objective**: Create standalone offline page with IMS branding and user-friendly messaging.

**Implementation Steps**:

- [ ] Create `offline.html` in `public/` directory
- [ ] Design standalone HTML page (no external dependencies)
- [ ] Include inline CSS for styling (mobile-first)
- [ ] Design layout:
  - Centered container with gradient background (blue theme)
  - Icon: Red circle with WiFi-off icon
  - Heading: "Sin conexión"
  - Message: "No tienes conexión a internet. Verifica tu conexión e intenta de nuevo."
  - Button: "Reintentar" (calls `location.reload()`)
- [ ] Use blue gradient background matching app theme
- [ ] Ensure responsive design (mobile and desktop)
- [ ] Include proper meta tags (charset, viewport)

**Complete HTML Code**: See `workspace/planning/14-PWA-SETUP.md` lines 265-359

**Design Features**:

- Clean, minimal design
- Blue gradient background (eff6ff to dbeafe)
- Red icon for offline state (visual warning)
- Clear messaging in Spanish
- Reload button for retry action
- Fully responsive (mobile-first)
- No external dependencies (works offline)

**Acceptance Criteria**:

- ✅ File exists at `public/offline.html`
- ✅ Valid HTML5 syntax
- ✅ All CSS is inline (no external stylesheets)
- ✅ All assets are inline or embedded (no external images)
- ✅ Responsive design works on mobile and desktop
- ✅ Reload button triggers `location.reload()`
- ✅ Uses blue theme colors consistent with app
- ✅ Spanish language messaging
- ✅ Accessible (proper semantic HTML)

**Estimated Time**: 30 minutes

---

### Task 6: Add PWA Meta Tags to BaseLayout

**File**: `src/layouts/BaseLayout.astro` (MODIFY)

**Objective**: Add PWA-related meta tags and manifest link to BaseLayout.

**Current BaseLayout** (lines 10-18):

```astro
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#2563eb" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title} | IMS</title>
  </head>
</html>
```

**Implementation Steps**:

- [ ] Add manifest link after favicon link
- [ ] Add apple-touch-icon link
- [ ] Verify theme-color meta tag exists (already present: #2563eb)
- [ ] Add apple-mobile-web-app-capable meta tag
- [ ] Add apple-mobile-web-app-status-bar-style meta tag
- [ ] Add apple-mobile-web-app-title meta tag

**New Tags to Add**:

```astro
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="IMS" />
```

**Insertion Point**: After line 17 (`<link rel="icon"...`)

**Acceptance Criteria**:

- ✅ Manifest link points to `/manifest.json`
- ✅ Apple touch icon link points to `/icons/apple-touch-icon.png`
- ✅ Theme color meta tag is #2563eb (already exists)
- ✅ Apple web app meta tags added
- ✅ No TypeScript errors
- ✅ All tags in correct order (meta tags before links)

**Estimated Time**: 10 minutes

---

### Task 7: Add Service Worker Registration to BaseLayout

**File**: `src/layouts/BaseLayout.astro` (MODIFY)

**Objective**: Add service worker registration script to BaseLayout.

**Implementation Steps**:

- [ ] Add `<script>` tag after closing `</body>` tag (or at end of body)
- [ ] Check for service worker support (`'serviceWorker' in navigator`)
- [ ] Register service worker on window load event
- [ ] Use `/sw.js` path for registration
- [ ] Log success and error to console
- [ ] Wrap in `is:inline` attribute to prevent Vite processing

**Registration Script**:

```astro
<!-- Service Worker Registration -->
<script is:inline>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    });
  }
</script>
```

**Insertion Point**: Before closing `</body>` tag (after `<slot />`)

**Key Points**:

- Use `is:inline` to prevent Vite from processing the script
- Register on `load` event to avoid blocking initial page load
- Feature detection for service worker support
- Console logging for debugging

**Acceptance Criteria**:

- ✅ Script tag added to BaseLayout
- ✅ Uses `is:inline` attribute
- ✅ Feature detection for service worker support
- ✅ Registers on window load event
- ✅ Logs success/error to console
- ✅ Service worker path is `/sw.js`
- ✅ No JavaScript errors in console

**Estimated Time**: 10 minutes

---

### Task 8: Verify PWA Meta Tags in Other Layouts

**Files**:

- `src/layouts/DashboardLayout.astro` (CHECK)
- `src/layouts/AuthLayout.astro` (CHECK)

**Objective**: Ensure PWA meta tags are inherited from BaseLayout (or add if needed).

**Implementation Steps**:

- [ ] Review DashboardLayout.astro
  - Verify it wraps content with `<BaseLayout>`
  - If not, add manifest and icon links to `<head>`
- [ ] Review AuthLayout.astro
  - Verify it wraps content with `<BaseLayout>`
  - If not, add manifest and icon links to `<head>`
- [ ] Confirm all layouts inherit PWA capabilities

**Current Layout Structure**:

- `DashboardLayout.astro` → Uses `<BaseLayout>` (line 14)
- `AuthLayout.astro` → Does NOT use `<BaseLayout>` (standalone HTML)

**For AuthLayout.astro** (lines 10-16), add same meta tags as BaseLayout:

```astro
<meta name="theme-color" content="#2563eb" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="IMS" />
```

**Also add service worker registration script** to AuthLayout before `</body>`.

**Acceptance Criteria**:

- ✅ DashboardLayout inherits PWA meta tags from BaseLayout
- ✅ AuthLayout has PWA meta tags added directly
- ✅ AuthLayout has service worker registration script
- ✅ All layouts support PWA installation
- ✅ No duplicate meta tags
- ✅ No TypeScript errors

**Estimated Time**: 20 minutes

---

## Testing Checklist

### Manual Testing: PWA Installation

- [ ] **Test 1: Verify Manifest in DevTools**
  - Open Chrome DevTools (F12)
  - Navigate to Application → Manifest
  - Expected: Manifest data displayed correctly (name, icons, theme color)
  - Expected: No errors or warnings

- [ ] **Test 2: Verify Service Worker Registration**
  - In DevTools → Application → Service Workers
  - Expected: Service worker status "activated and is running"
  - Expected: Scope is "/" (root)
  - Console log: "[SW] Registered successfully"

- [ ] **Test 3: Verify Static Asset Caching**
  - In DevTools → Application → Cache Storage
  - Expected: Cache named "ims-cache-v1" exists
  - Expected: Cache contains: favicon.svg, manifest.json, icon-192.png, icon-512.png
  - Clear cache and reload → Cache repopulates

- [ ] **Test 4: Check PWA Installability**
  - In Chrome, check address bar for install icon
  - OR DevTools → Application → Manifest → "Installability" section
  - Expected: "Installable" or "No installability issues detected"
  - Expected: Install prompt available

- [ ] **Test 5: Install PWA on Desktop**
  - Click install icon in address bar
  - OR Chrome menu → "Install IMS..."
  - Expected: Installation dialog appears
  - Expected: App icon and name shown correctly
  - Click "Install"
  - Expected: PWA opens in standalone window
  - Expected: PWA appears in OS app launcher

- [ ] **Test 6: Install PWA on Mobile (iOS)**
  - Open app in Safari on iOS
  - Tap Share button → "Add to Home Screen"
  - Expected: Icon preview shows apple-touch-icon
  - Expected: Name shows "IMS"
  - Add to home screen
  - Expected: Icon appears on home screen
  - Tap icon → Expected: App opens in standalone mode

- [ ] **Test 7: Install PWA on Mobile (Android)**
  - Open app in Chrome on Android
  - Tap menu (three dots) → "Install app" or "Add to Home screen"
  - Expected: Installation dialog with app name and icon
  - Install app
  - Expected: Icon appears on home screen
  - Tap icon → Expected: App opens in standalone mode

### Manual Testing: Offline Functionality

- [ ] **Test 8: Test Offline Page**
  - Open DevTools → Network tab
  - Enable "Offline" mode
  - Navigate to new page (e.g., type random URL)
  - Expected: `offline.html` page loads
  - Expected: "Sin conexión" heading visible
  - Expected: "Reintentar" button visible
  - Click "Reintentar" → Expected: Page attempts reload

- [ ] **Test 9: Test Network-First Caching**
  - Visit a page with service worker active
  - Open DevTools → Network tab
  - Disable cache in DevTools (checkbox)
  - Reload page → Expected: Network request made
  - Check Cache Storage → Expected: Page cached after successful fetch
  - Enable "Offline" mode
  - Reload page → Expected: Cached version served

- [ ] **Test 10: Test Cache Update on Network Success**
  - Clear cache in DevTools
  - Visit page (online) → Expected: Network request + cache update
  - Check Cache Storage → Expected: Page in cache
  - Modify page content on server (if possible)
  - Reload page (online) → Expected: New content fetched and cached

- [ ] **Test 11: Verify API Requests Not Cached**
  - Open DevTools → Network tab
  - Perform action that calls `/api/*` or Supabase
  - Enable "Offline" mode
  - Retry API call → Expected: Network error (not served from cache)
  - Check Cache Storage → Expected: API responses NOT in cache

### Manual Testing: Service Worker Updates

- [ ] **Test 12: Test Service Worker Update**
  - Modify `sw.js` (change CACHE_NAME to 'ims-cache-v2')
  - Reload page in browser
  - DevTools → Application → Service Workers
  - Expected: New service worker "waiting to activate"
  - Close all app tabs/windows
  - Reopen app → Expected: New service worker activated
  - Check Cache Storage → Expected: Old cache deleted, new cache created

- [ ] **Test 13: Test skipWaiting Message**
  - Modify `sw.js` again (version v3)
  - Reload page
  - Open console
  - Run: `navigator.serviceWorker.controller.postMessage({type: 'SKIP_WAITING'})`
  - Expected: New service worker activates immediately
  - Expected: Page reloads with new service worker

### Visual Testing

- [ ] **Test 14: Verify Favicon Display**
  - Open app in browser
  - Check browser tab → Expected: IMS favicon visible
  - Check in both light and dark mode
  - Check on mobile browser

- [ ] **Test 15: Verify Theme Color**
  - Open app in Chrome on Android
  - Expected: Address bar color is blue (#2563eb)
  - Scroll down → Expected: Theme color persists

- [ ] **Test 16: Verify Installed App Icon**
  - After installation, check app icon on home screen
  - Expected: Blue icon with 'IMS' text
  - Expected: Icon is not pixelated or blurry

- [ ] **Test 17: Verify Splash Screen (Android)**
  - Install PWA on Android
  - Close app completely
  - Reopen app from home screen
  - Expected: Brief splash screen with IMS icon and blue background
  - Expected: Splash screen matches theme color

### Cross-Browser Testing

- [ ] **Test 18: Test in Chrome Desktop**
  - All features work as expected
  - PWA installable
  - Service worker registers
  - Offline page works

- [ ] **Test 19: Test in Edge Desktop**
  - All features work as expected
  - PWA installable
  - Service worker registers

- [ ] **Test 20: Test in Safari Desktop (macOS)**
  - Service worker support (Safari 11.1+)
  - Manifest support (Safari 15+)
  - Install via menu (limited support)

- [ ] **Test 21: Test in Chrome Mobile (Android)**
  - Install banner appears
  - PWA installs correctly
  - Standalone mode works
  - Theme color applies

- [ ] **Test 22: Test in Safari Mobile (iOS)**
  - Add to Home Screen works
  - Apple touch icon displays
  - Standalone mode works
  - Status bar styling correct

### Lighthouse PWA Audit

- [ ] **Test 23: Run Lighthouse PWA Audit**
  - Open DevTools → Lighthouse
  - Select "Progressive Web App" category
  - Run audit (mobile or desktop)
  - Expected: Score ≥ 90/100
  - Expected: All core PWA checks pass:
    - ✅ Registers a service worker
    - ✅ Responds with 200 when offline
    - ✅ Has a web app manifest
    - ✅ Uses HTTPS (in production)
    - ✅ Redirects HTTP to HTTPS (in production)
    - ✅ Configured for a custom splash screen
    - ✅ Sets a theme color
    - ✅ Provides valid apple-touch-icon
  - Review any warnings or failures
  - Fix issues and re-run audit

---

## Acceptance Criteria Summary

### Asset Creation

- ✅ Three PWA icons created and optimized (192x192, 512x512, 180x180)
- ✅ Favicon replaced with IMS branding
- ✅ All icons use blue (#2563eb) theme color
- ✅ All icons display 'IMS' branding
- ✅ All assets load correctly in browser

### Configuration

- ✅ Web app manifest created and valid
- ✅ Manifest properly configured with app metadata
- ✅ Manifest references correct icon paths
- ✅ Theme color is #2563eb throughout

### Service Worker

- ✅ Service worker implemented with network-first strategy
- ✅ Service worker pre-caches static assets
- ✅ Service worker cleans up old caches
- ✅ Service worker ignores API/auth requests
- ✅ Service worker serves offline page when needed
- ✅ Push notification handlers prepared (inactive)

### Offline Page

- ✅ Offline page created with IMS branding
- ✅ Offline page is standalone (no external dependencies)
- ✅ Offline page is responsive
- ✅ Offline page has retry button

### Layout Integration

- ✅ BaseLayout includes PWA meta tags
- ✅ BaseLayout includes manifest link
- ✅ BaseLayout includes service worker registration
- ✅ AuthLayout includes PWA meta tags (standalone layout)
- ✅ DashboardLayout inherits from BaseLayout (no changes needed)

### Installation

- ✅ PWA is installable in Chrome/Edge desktop
- ✅ PWA is installable in Safari iOS
- ✅ PWA is installable in Chrome Android
- ✅ Install prompt appears automatically (Chrome Android)
- ✅ Installed app opens in standalone mode
- ✅ Installed app icon displays correctly

### Offline Functionality

- ✅ App serves cached pages when offline
- ✅ App shows offline page for uncached navigation
- ✅ App updates cache on successful network requests
- ✅ API requests bypass cache (always network)

### Testing

- ✅ All manual tests pass
- ✅ Lighthouse PWA audit score ≥ 90/100
- ✅ Cross-browser testing completed
- ✅ Mobile testing completed (iOS and Android)

---

## File Structure

```
public/
├── icons/
│   ├── icon-192.png          # NEW - 192x192 PWA icon
│   ├── icon-512.png          # NEW - 512x512 PWA icon
│   └── apple-touch-icon.png  # NEW - 180x180 Apple icon
├── favicon.svg               # MODIFIED - IMS branded favicon
├── manifest.json             # NEW - Web app manifest
├── sw.js                     # NEW - Service worker
└── offline.html              # NEW - Offline fallback page

src/layouts/
├── BaseLayout.astro          # MODIFIED - Add PWA meta tags + SW registration
└── AuthLayout.astro          # MODIFIED - Add PWA meta tags + SW registration
```

---

## Implementation Notes

### Icon Design Philosophy

- **Simplicity**: Placeholder icons use simple text to avoid design complexity
- **Branding**: Blue (#2563eb) aligns with app theme color
- **Recognizability**: 'IMS' text is clear and readable at all sizes
- **Future**: Can be replaced with professional icons later without code changes

### Caching Strategy Rationale

- **Network-First**: Prioritizes fresh content when online
- **Cache Fallback**: Ensures resilience when offline
- **Moderate**: Balances performance and data freshness
- **API Exclusion**: Auth and database requests always use network

### Service Worker Lifecycle

1. **Install**: Pre-cache static assets
2. **Activate**: Clean up old caches, take control of pages
3. **Fetch**: Intercept requests, apply caching strategy
4. **Update**: New SW version waits for old version to release, then activates

### Offline Strategy

- **Static Assets**: Always cached (icons, manifest, favicon)
- **Pages**: Cached after first visit (network-first)
- **API Requests**: Never cached (always network)
- **Uncached Pages**: Show offline.html fallback

### iOS Considerations

- Safari has limited PWA support (no install banner)
- Requires "Add to Home Screen" manual action
- Uses apple-touch-icon for home screen icon
- Meta tags control status bar and standalone mode

### Android Considerations

- Chrome shows automatic install banner (if criteria met)
- Splash screen generated from manifest
- Theme color applies to status bar and address bar
- Better PWA support than iOS

### Testing Strategy

- **Manual Testing**: Covers all user-facing functionality
- **DevTools**: Verify technical implementation
- **Lighthouse**: Automated PWA audit
- **Cross-Browser**: Ensure compatibility
- **Cross-Platform**: Mobile and desktop testing

### Future Enhancements (Phase 15+)

- Push notifications (handlers already prepared in SW)
- Background sync for offline actions
- Advanced caching strategies (cache-first for static, network-first for dynamic)
- Update notifications for new SW versions
- Professional icon design

---

## Troubleshooting

### Service Worker Not Registering

- Check console for errors
- Ensure `/sw.js` is accessible (200 response)
- Verify HTTPS in production (localhost OK for development)
- Clear browser cache and reload
- Check DevTools → Application → Service Workers for errors

### PWA Not Installable

- Run Lighthouse audit to identify issues
- Verify manifest is valid JSON
- Ensure all manifest icons exist and are accessible
- Check that start_url is valid
- Ensure HTTPS in production
- Check DevTools → Application → Manifest for errors

### Offline Page Not Showing

- Verify `offline.html` exists in `public/`
- Check service worker fetch handler logic
- Test with DevTools offline mode
- Clear cache and re-register service worker
- Check network tab for offline.html request

### Icons Not Displaying

- Verify icon files exist in `public/icons/`
- Check file names match manifest exactly
- Clear browser cache
- Test icon URLs directly in browser
- Check file sizes (not too large)

### Cache Not Updating

- Check cache name in service worker
- Verify old caches are being deleted in activate event
- Force update service worker in DevTools
- Clear cache manually in DevTools
- Check network tab for cache hits/misses

---

**Phase 14 Complete When All Checklist Items Are Checked and All Tests Pass**
