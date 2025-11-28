# Frontend Architecture - Phase 01: Project Setup

## Overview

Phase 01 establishes the foundational frontend architecture for the IMS (Installation Management System) using Astro 5 with SSR (Server-Side Rendering) and Tailwind CSS. This phase focuses on creating a robust, performant, and maintainable foundation.

### Architecture Principles

1. **Server-First Rendering**: Astro 5 SSR mode for optimal performance and SEO
2. **Utility-First Styling**: Tailwind CSS without `@apply` component abstractions
3. **Type Safety**: Strict TypeScript configuration with explicit types
4. **Component Organization**: Clear folder structure for scalability
5. **Path Aliases**: Clean imports using TypeScript path mapping
6. **Progressive Enhancement**: Base HTML/CSS first, JavaScript as enhancement

### Technology Stack

- **Framework**: Astro 5 (SSR mode)
- **Styling**: Tailwind CSS v3.4+ (utility-first only)
- **Language**: TypeScript (strict mode)
- **Package Manager**: npm
- **Deployment**: Vercel (via @astrojs/vercel adapter)
- **Testing**: Playwright (E2E)

### Project Structure

```
ims/
├── src/
│   ├── components/
│   │   ├── ui/              # Generic UI components (buttons, inputs, cards)
│   │   ├── layout/          # Layout components (header, footer, nav)
│   │   ├── installations/   # Installation-specific components
│   │   └── notifications/   # Push notification components
│   ├── layouts/             # Page layouts
│   ├── lib/                 # Utilities and helpers
│   ├── pages/               # File-based routing
│   ├── types/               # TypeScript type definitions
│   └── styles/
│       └── global.css       # Tailwind directives + base styles
├── public/                  # Static assets
├── e2e/                     # Playwright E2E tests
└── astro.config.mjs         # Astro configuration
```

---

## Detailed Implementation Checklist

### 1. Project Initialization

- [ ] **Create Astro project with minimal template**
  - File: Root directory
  - Command: `npm create astro@latest . -- --template minimal --typescript strict`
  - Acceptance: Project created with TypeScript strict mode enabled

- [ ] **Install core dependencies**
  - Command: `npm install @astrojs/tailwind @astrojs/vercel tailwindcss`
  - Acceptance: All dependencies installed in `package.json`

- [ ] **Install development dependencies**
  - Command: `npm install -D @playwright/test @types/node`
  - Acceptance: Playwright and Node types available for testing

### 2. Astro Configuration

- [ ] **Configure Astro for SSR with Vercel adapter**
  - File: `astro.config.mjs`
  - Add SSR mode: `output: 'server'`
  - Add Vercel adapter: `adapter: vercel()`
  - Add Tailwind integration: `integrations: [tailwind()]`
  - Acceptance: Configuration exports valid Astro config with SSR + Vercel + Tailwind

- [ ] **Configure Astro Tailwind integration options**
  - File: `astro.config.mjs`
  - Disable default base styles: `applyBaseStyles: false`
  - Acceptance: Tailwind integration configured to skip default base styles

### 3. TypeScript Configuration

- [ ] **Configure TypeScript path aliases**
  - File: `tsconfig.json`
  - Add paths: `@/*`, `@components/*`, `@lib/*`, `@layouts/*`, `@types/*`
  - Set baseUrl: `"baseUrl": "."`
  - Acceptance: All path aliases resolve correctly in IDE

- [ ] **Verify strict TypeScript configuration**
  - File: `tsconfig.json`
  - Ensure strict: `"strict": true`
  - Ensure noImplicitAny: `"noImplicitAny": true`
  - Ensure strictNullChecks: `"strictNullChecks": true`
  - Acceptance: TypeScript enforces strict type checking

### 4. Tailwind CSS Configuration

- [ ] **Initialize Tailwind configuration**
  - File: `tailwind.config.mjs`
  - Configure content paths: `['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}']`
  - Acceptance: Tailwind processes all source files for class detection

- [ ] **Configure custom color palette**
  - File: `tailwind.config.mjs`
  - Add primary blue scale (50-900) in `theme.extend.colors`
  - Reference: Use Tailwind's blue palette as base
  - Acceptance: Custom primary colors available as `bg-primary-500`, `text-primary-700`, etc.

- [ ] **Configure mobile-first responsive breakpoints**
  - File: `tailwind.config.mjs`
  - Verify default breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
  - Acceptance: Breakpoints follow Tailwind defaults for mobile-first design

- [ ] **Document Tailwind utility-first policy**
  - File: `tailwind.config.mjs` (comment at top)
  - Add comment: NO @apply component classes allowed
  - Add comment: Use utility classes directly in templates
  - Acceptance: Clear policy documented in config file

### 5. Global Styles Setup

- [ ] **Create global.css with Tailwind directives**
  - File: `src/styles/global.css`
  - Add `@tailwind base;`
  - Add `@tailwind components;`
  - Add `@tailwind utilities;`
  - Acceptance: Tailwind layers properly imported

- [ ] **Add base layer styles for html element**
  - File: `src/styles/global.css`
  - Use `@layer base` for html styles
  - Set font smoothing: `antialiased`
  - Set scroll behavior: `smooth`
  - Acceptance: Base HTML styles applied globally

- [ ] **Add base layer styles for body element**
  - File: `src/styles/global.css`
  - Use `@layer base` for body styles
  - Set default font: system font stack
  - Set default colors: text and background
  - Acceptance: Body has consistent base styling

- [ ] **Verify NO component layer classes created**
  - File: `src/styles/global.css`
  - Ensure no `.btn`, `.card`, `.input` classes in `@layer components`
  - Acceptance: Only base and utilities layers used, NO component abstractions

### 6. Folder Structure Creation

- [ ] **Create component folders**
  - Folders:
    - `src/components/ui/`
    - `src/components/layout/`
    - `src/components/installations/`
    - `src/components/notifications/`
  - Add `.gitkeep` file to each empty folder
  - Acceptance: All component folders exist with `.gitkeep`

- [ ] **Create layouts folder**
  - Folder: `src/layouts/`
  - Add `.gitkeep` file
  - Acceptance: Layouts folder exists with `.gitkeep`

- [ ] **Create lib folder**
  - Folder: `src/lib/`
  - Add `.gitkeep` file
  - Acceptance: Lib folder exists with `.gitkeep`

- [ ] **Create types folder**
  - Folder: `src/types/`
  - Add `.gitkeep` file
  - Acceptance: Types folder exists with `.gitkeep`

- [ ] **Create pages folder if not exists**
  - Folder: `src/pages/`
  - Acceptance: Pages folder exists (may be auto-created by Astro)

### 7. Temporary Welcome Page (Spanish)

- [ ] **Create temporary index.astro page**
  - File: `src/pages/index.astro`
  - Import global.css: `import '@/styles/global.css'`
  - Create Spanish welcome page with Tailwind utilities
  - Include: Page title "IMS - Installation Management System"
  - Include: Welcome heading "Bienvenido al Sistema de Gestión de Instalaciones"
  - Include: Description paragraph explaining the system (in Spanish)
  - Include: Visual verification elements (colors, spacing, typography)
  - Acceptance: Page renders in Spanish with Tailwind styling

- [ ] **Add responsive design verification elements**
  - File: `src/pages/index.astro`
  - Add elements that change at different breakpoints (sm, md, lg)
  - Use primary color palette in visual elements
  - Acceptance: Page demonstrates responsive behavior

### 8. Environment Configuration

- [ ] **Create .env.example file**
  - File: `.env.example`
  - Add placeholder: `PUBLIC_SUPABASE_URL=`
  - Add placeholder: `PUBLIC_SUPABASE_ANON_KEY=`
  - Add placeholder: `PUBLIC_APP_URL=http://localhost:4321`
  - Acceptance: Template for environment variables exists

- [ ] **Ensure .env is in .gitignore**
  - File: `.gitignore`
  - Verify `.env` is listed
  - Acceptance: Actual environment file is not committed

### 9. Development Server Verification

- [ ] **Start development server**
  - Command: `npm run dev`
  - Verify server starts on http://localhost:4321
  - Acceptance: Dev server runs without errors

- [ ] **Verify hot reload functionality**
  - Make a minor change to `src/pages/index.astro`
  - Verify browser updates without manual refresh
  - Acceptance: HMR (Hot Module Replacement) works

- [ ] **Verify Tailwind JIT compilation**
  - Add a new utility class to `src/pages/index.astro`
  - Verify styles appear immediately
  - Acceptance: JIT compiler generates styles on-demand

### 10. Build Verification

- [ ] **Run production build**
  - Command: `npm run build`
  - Verify build completes without errors
  - Verify output in `dist/` folder
  - Acceptance: Production build succeeds

- [ ] **Preview production build**
  - Command: `npm run preview`
  - Verify preview server starts
  - Verify page renders correctly
  - Acceptance: Production preview works as expected

---

## Testing Infrastructure

### E2E Testing Setup (Playwright)

- [ ] **Initialize Playwright configuration**
  - File: `playwright.config.ts`
  - Configure baseURL: `http://localhost:4321`
  - Configure test directory: `./e2e`
  - Configure browsers: chromium, firefox, webkit
  - Configure retries: 2 for CI, 0 for local
  - Configure video: 'retain-on-failure'
  - Configure screenshot: 'only-on-failure'
  - Acceptance: Playwright configured for E2E testing

- [ ] **Create E2E test folder structure**
  - Folder: `e2e/`
  - Add `.gitkeep` to ensure folder is tracked
  - Acceptance: E2E folder exists

- [ ] **Create setup test for development server**
  - File: `e2e/01-setup.spec.ts`
  - Test: Verify dev server starts successfully
  - Test: Verify index page loads with 200 status
  - Test: Verify page title is "IMS - Installation Management System"
  - Test: Verify Spanish heading is visible
  - Acceptance: Basic server and page tests pass

- [ ] **Create Tailwind styling verification test**
  - File: `e2e/02-tailwind-setup.spec.ts`
  - Test: Verify primary color classes are applied
  - Test: Verify responsive breakpoints work (mobile, tablet, desktop)
  - Test: Verify typography utilities render correctly
  - Acceptance: Tailwind utilities are functional

- [ ] **Create accessibility baseline test**
  - File: `e2e/03-accessibility.spec.ts`
  - Install: `npm install -D @axe-core/playwright`
  - Test: Run axe accessibility scan on index page
  - Test: Verify no critical or serious violations
  - Acceptance: Basic accessibility standards met

- [ ] **Add test scripts to package.json**
  - File: `package.json`
  - Add script: `"test:e2e": "playwright test"`
  - Add script: `"test:e2e:debug": "playwright test --ui"`
  - Add script: `"test:e2e:headed": "playwright test --headed"`
  - Acceptance: E2E test commands available

### Test Execution

- [ ] **Run all E2E tests**
  - Command: `npm run test:e2e`
  - Verify all tests pass
  - Acceptance: Complete E2E test suite passes

- [ ] **Verify test reporting**
  - Check: HTML report generated in `playwright-report/`
  - Check: Screenshots captured on failure
  - Check: Videos captured on failure
  - Acceptance: Test artifacts properly generated

---

## Documentation

- [ ] **Update README.md with setup instructions**
  - File: `README.md`
  - Add: Project description in Spanish
  - Add: Prerequisites (Node.js version, npm)
  - Add: Installation steps
  - Add: Development commands
  - Add: Testing commands
  - Acceptance: README provides complete setup guide

- [ ] **Document Tailwind utility-first approach**
  - File: `README.md` or `workspace/frontend.md`
  - Explain: NO @apply component classes policy
  - Explain: How to use utility classes directly
  - Provide: Examples of common patterns
  - Acceptance: Utility-first approach clearly documented

- [ ] **Document TypeScript path aliases**
  - File: `README.md`
  - List all aliases: `@/`, `@components/`, `@lib/`, `@layouts/`, `@types/`
  - Provide examples of usage
  - Acceptance: Path aliases documented with examples

---

## Acceptance Criteria

Phase 01 frontend setup is complete when ALL of the following are true:

### 1. Project Structure

- ✅ Astro 5 project initialized with minimal template
- ✅ All required folders exist: components/{ui,layout,installations,notifications}, layouts, lib, types, e2e
- ✅ TypeScript strict mode enabled and configured
- ✅ Path aliases configured and working (@/, @components/, etc.)

### 2. Configuration Files

- ✅ `astro.config.mjs` configured with SSR mode, Vercel adapter, Tailwind integration
- ✅ `tailwind.config.mjs` configured with content paths, primary color palette, NO @apply components
- ✅ `tsconfig.json` configured with strict mode and path aliases
- ✅ `playwright.config.ts` configured for E2E testing
- ✅ `.env.example` exists with required placeholders

### 3. Styling

- ✅ `src/styles/global.css` exists with Tailwind directives and base styles ONLY
- ✅ NO component layer classes created (no .btn, .card, .input)
- ✅ Primary color palette (blue 50-900) accessible via Tailwind utilities
- ✅ Mobile-first responsive breakpoints configured

### 4. Development Environment

- ✅ `npm run dev` starts server successfully at http://localhost:4321
- ✅ Hot reload (HMR) works for Astro components
- ✅ Tailwind JIT compilation works (new classes generate immediately)
- ✅ TypeScript type checking works (strict mode enforced)

### 5. Temporary Welcome Page

- ✅ `src/pages/index.astro` exists and renders in Spanish
- ✅ Page imports global.css and uses Tailwind utilities
- ✅ Page demonstrates responsive design with primary colors
- ✅ Page title is "IMS - Installation Management System"

### 6. Build Process

- ✅ `npm run build` completes successfully
- ✅ `npm run preview` serves production build
- ✅ Production build output in `dist/` folder is valid

### 7. Testing Infrastructure

- ✅ Playwright installed and configured
- ✅ E2E test scripts added to package.json
- ✅ `e2e/01-setup.spec.ts` verifies server and page load
- ✅ `e2e/02-tailwind-setup.spec.ts` verifies Tailwind utilities
- ✅ `e2e/03-accessibility.spec.ts` verifies basic accessibility
- ✅ `npm run test:e2e` runs and passes all tests
- ✅ Test artifacts (reports, screenshots, videos) generate correctly

### 8. Documentation

- ✅ `README.md` includes setup instructions and development commands
- ✅ Tailwind utility-first approach documented (NO @apply policy)
- ✅ TypeScript path aliases documented with examples
- ✅ All configuration files include explanatory comments

### 9. Code Quality

- ✅ No TypeScript errors or warnings
- ✅ No console errors in browser
- ✅ No build warnings
- ✅ All files use consistent formatting

### 10. Version Control

- ✅ `.gitignore` includes `.env`, `node_modules/`, `dist/`, etc.
- ✅ `.env.example` committed (but not `.env`)
- ✅ All required files committed to git

---

## Post-Phase 01 Readiness

After completing Phase 01, the project will be ready for:

- **Phase 02**: Supabase integration (auth, database)
- **Phase 03**: Layout components and routing structure
- **Phase 04**: Authentication flow implementation
- **Phase 05+**: Feature development (installations, installers, PWA, etc.)

### Verified Capabilities

The foundation will support:

- Server-side rendering with Astro 5
- Type-safe development with TypeScript strict mode
- Utility-first styling with Tailwind CSS
- Clean import paths with TypeScript aliases
- E2E testing with Playwright
- Production deployment to Vercel

---

## Notes and Considerations

### Tailwind Utility-First Philosophy

This project uses **pure utility classes** in templates instead of `@apply` abstractions. This approach:

- **Keeps styling visible and co-located** with markup
- **Reduces CSS bundle size** (no duplicate utility generation)
- **Improves debugging** (see all classes in DevTools)
- **Follows Tailwind best practices** (v3.4+ guidance)

Example pattern (DO THIS):

```astro
<button
  class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
>
  Guardar
</button>
```

Anti-pattern (DON'T DO THIS):

```css
/* ❌ Avoid this in global.css */
@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors;
  }
}
```

### Component Reusability

Without `@apply` classes, reusability is achieved through:

1. **Astro components** - Encapsulate markup + utility classes
2. **Shared utility patterns** - Document common class combinations
3. **TypeScript constants** - Export class name strings if needed

### Mobile-First Responsive Design

All responsive styles use mobile-first approach:

```astro
<!-- Base styles = mobile, then add larger breakpoints -->
<div class="p-4 md:p-6 lg:p-8">
  <h1 class="text-2xl md:text-3xl lg:text-4xl">Bienvenido</h1>
</div>
```

### TypeScript Strict Mode

All code must:

- Have explicit return types on functions
- Avoid `any` type (use `unknown` or proper types)
- Handle null/undefined with strict null checks
- Use `??` instead of `||` for null coalescing

### Performance Considerations

This setup prioritizes performance through:

- **SSR-first rendering** (HTML sent from server)
- **Minimal client JavaScript** (Astro islands for interactivity)
- **Tailwind JIT** (only used classes in production)
- **Type-safe builds** (catch errors before deployment)

---

## Timeline Estimate

Total estimated time: **8-12 hours**

Breakdown:

- Project initialization: 1-2 hours
- Configuration (Astro, TypeScript, Tailwind): 2-3 hours
- Folder structure + global styles: 1 hour
- Temporary welcome page: 1-2 hours
- Testing infrastructure setup: 2-3 hours
- Documentation: 1-2 hours

**Note**: Times assume familiarity with Astro 5, Tailwind CSS, and Playwright. First-time setup may take longer.

---

## Risk Mitigation

### Potential Issues

1. **Astro 5 breaking changes**: Verify compatibility with latest version
2. **Tailwind CSS purging issues**: Ensure content paths are correct
3. **TypeScript path alias resolution**: Verify in both IDE and build
4. **Playwright browser dependencies**: May require system-level installations

### Mitigation Strategies

- Test each configuration step immediately after implementation
- Run `npm run build` frequently to catch issues early
- Keep Playwright and Astro dependencies up to date
- Document any version-specific quirks or workarounds

---

**Phase 01 establishes a solid, performant, and type-safe foundation for the IMS application. All subsequent phases build upon this infrastructure.**
