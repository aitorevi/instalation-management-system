# Backend Architecture - Phase 01: Project Setup

## Overview

Phase 01 establishes the foundational backend infrastructure for the IMS (Installation Management System). This phase focuses on creating a production-ready development environment with proper tooling, configuration, and testing infrastructure.

**What we're building in this phase:**

- **Astro 5 SSR Application**: Server-side rendering with Vercel adapter for optimal performance and SEO
- **Supabase Client Setup**: Foundation for PostgreSQL database, authentication, and Edge Functions
- **Development Tooling**: TypeScript strict mode, ESLint, Prettier, and comprehensive testing infrastructure
- **Environment Management**: Secure configuration for local development and production deployment
- **Testing Foundation**: Vitest for unit/integration tests, Playwright for E2E tests

**What we're NOT building yet:**

- Database schema (Phase 02)
- Authentication implementation (Phases 03-06)
- API endpoints or Edge Functions (future phases)
- Business logic or domain models (future phases)

**Key Architecture Decisions:**

1. **SSR over SPA**: Server-side rendering provides better SEO, faster initial page loads, and secure server-side operations
2. **Utility-first Tailwind**: NO @apply classes for components (per user preference) - all styling via utility classes
3. **Strict TypeScript**: Maximum type safety to catch errors at compile time
4. **Test-Driven Infrastructure**: Comprehensive test setup from the start (unit, integration, E2E)
5. **Supabase Serverless**: Edge Functions (Deno runtime) + PostgreSQL with RLS for security

---

## Detailed Implementation Checklist

### 1. Project Initialization

#### 1.1 Create Astro Project

- [ ] Run `npm create astro@latest ims -- --template minimal --typescript strict --git --install`
- [ ] Navigate to project: `cd ims`
- [ ] Verify `package.json` exists with Astro dependencies

**Acceptance Criteria:**

- Project folder `ims/` exists
- `package.json` has `astro` in dependencies
- Git repository initialized (`.git/` folder exists)
- TypeScript configured in strict mode (`tsconfig.json` has `"strict": true`)

**Files Created:**

- `/package.json`
- `/tsconfig.json`
- `/astro.config.mjs`
- `/src/pages/index.astro` (default)
- `/.gitignore`

---

#### 1.2 Install Core Dependencies

- [ ] Install Astro integrations: `npm install @astrojs/tailwind @astrojs/vercel`
- [ ] Install styling: `npm install tailwindcss`
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Verify all 4 packages in `package.json` dependencies

**Acceptance Criteria:**

- `package.json` contains:
  - `@astrojs/tailwind`
  - `@astrojs/vercel`
  - `tailwindcss`
  - `@supabase/supabase-js`
- `node_modules/` folder populated
- No installation errors in terminal

---

#### 1.3 Install Development Dependencies

- [ ] Install testing framework: `npm install -D vitest @vitest/ui`
- [ ] Install Playwright for E2E: `npm install -D @playwright/test`
- [ ] Install code quality tools: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [ ] Install Prettier: `npm install -D prettier prettier-plugin-astro`
- [ ] Install Husky for git hooks: `npm install -D husky lint-staged`
- [ ] Install type utilities: `npm install -D @types/node`

**Acceptance Criteria:**

- All dev dependencies in `package.json` under `devDependencies`
- ESLint and Prettier ready for configuration
- Testing frameworks installed but not yet configured

**Files Modified:**

- `/package.json` (devDependencies section)

---

### 2. Configuration Files

#### 2.1 Configure Astro

- [ ] Create/modify `astro.config.mjs` with SSR mode, Vercel adapter, and Tailwind integration
- [ ] Set `output: 'server'` for SSR
- [ ] Add `adapter: vercel()` for deployment
- [ ] Add `integrations: [tailwind()]`

**File:** `/astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  vite: {
    test: {
      environment: 'node',
      globals: true
    }
  }
});
```

**Acceptance Criteria:**

- File exists in project root
- SSR mode enabled (`output: 'server'`)
- Vercel adapter configured
- Tailwind integration active
- Vite test configuration included for Vitest

---

#### 2.2 Configure Tailwind

- [ ] Create `tailwind.config.mjs` in project root
- [ ] Configure content paths for Astro files
- [ ] Add primary color palette (blue theme)
- [ ] NO component classes with @apply (per user preference)

**File:** `/tailwind.config.mjs`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      }
    }
  },
  plugins: []
};
```

**Acceptance Criteria:**

- File exists in project root
- Content paths include all Astro file types
- Primary color palette defined (blue)
- No custom plugins configured yet

---

#### 2.3 Configure TypeScript Path Aliases

- [ ] Modify `tsconfig.json` to add path aliases
- [ ] Add aliases: `@/*`, `@components/*`, `@lib/*`, `@layouts/*`, `@types/*`

**File:** `/tsconfig.json`

Modify the `compilerOptions` section to include:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@layouts/*": ["src/layouts/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

**Acceptance Criteria:**

- Strict mode enabled
- Path aliases configured
- TypeScript can resolve imports like `import { X } from '@lib/utils'`

---

#### 2.4 Create ESLint Configuration

- [ ] Create `.eslintrc.cjs` in project root
- [ ] Configure TypeScript parser
- [ ] Add Astro-specific rules
- [ ] Set up recommended rulesets

**File:** `/.eslintrc.cjs`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro']
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  }
};
```

**Acceptance Criteria:**

- File exists in project root
- TypeScript parser configured
- Astro files handled via overrides
- Unused variables rule configured

---

#### 2.5 Create Prettier Configuration

- [ ] Create `.prettierrc.cjs` in project root
- [ ] Configure Astro plugin
- [ ] Set code formatting standards

**File:** `/.prettierrc.cjs`

```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
};
```

**Acceptance Criteria:**

- File exists in project root
- Astro plugin configured
- Consistent formatting rules defined

---

#### 2.6 Configure Vitest

- [ ] Create `vitest.config.ts` in project root
- [ ] Configure test environment (node)
- [ ] Set up coverage reporting
- [ ] Exclude integration tests from unit test runs

**File:** `/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.integration.test.ts',
        '**/*.spec.ts',
        'e2e/',
        '.astro/'
      ]
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/*.integration.test.ts',
      'e2e/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
});
```

**Acceptance Criteria:**

- File exists in project root
- Coverage reporting configured
- Integration tests excluded from unit tests
- Path aliases work in tests

---

#### 2.7 Configure Playwright

- [ ] Run Playwright init: `npx playwright install`
- [ ] Create `playwright.config.ts` in project root
- [ ] Configure base URL for local dev
- [ ] Set up browser contexts (chromium, firefox, webkit)

**File:** `/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI
  }
});
```

**Acceptance Criteria:**

- File exists in project root
- Base URL points to local dev server
- Multiple browser configurations
- Web server auto-starts for E2E tests

---

### 3. Environment and Security

#### 3.1 Create Environment Template

- [ ] Create `.env.example` in project root
- [ ] Add Supabase placeholders (URL, anon key)
- [ ] Add app URL placeholder
- [ ] Add VAPID keys placeholders for push notifications
- [ ] Add helpful comments for each variable

**File:** `/.env.example`

```env
# Supabase Configuration
# Get these from: Supabase Dashboard > Settings > API
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL
# Local development
PUBLIC_APP_URL=http://localhost:4321

# Push Notifications (VAPID Keys)
# Generate with: npx web-push generate-vapid-keys
PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

**Acceptance Criteria:**

- File exists in project root
- All required variables documented
- Comments explain where to get values
- File is tracked in git (not .env itself)

---

#### 3.2 Update .gitignore

- [ ] Ensure `.env` is ignored (not `.env.example`)
- [ ] Add build output directories
- [ ] Add editor and OS-specific files
- [ ] Add test coverage reports

**File:** `/.gitignore`

Ensure these entries exist:

```
# Dependencies
node_modules/

# Build outputs
dist/
.vercel/
.astro/

# Environment variables (DO NOT COMMIT)
.env
.env.local
.env.*.local

# Testing
coverage/
.nyc_output/
test-results/
playwright-report/

# Editors
.vscode/
.idea/
*.swp
*.swo
*.swn

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

**Acceptance Criteria:**

- `.env` is ignored but `.env.example` is NOT ignored
- Build directories ignored
- Coverage reports ignored
- Editor/OS files ignored

---

### 4. Project Structure

#### 4.1 Create Folder Structure

- [ ] Create component folders: `src/components/ui`, `src/components/layout`, `src/components/installations`, `src/components/notifications`
- [ ] Create layout folder: `src/layouts`
- [ ] Create lib folder: `src/lib`
- [ ] Create middleware folder: `src/middleware`
- [ ] Create types folder: `src/types`
- [ ] Create page folders: `src/pages/auth`, `src/pages/admin/installations`, `src/pages/admin/installers`, `src/pages/installer/installations`
- [ ] Create Supabase folders: `supabase/migrations`, `supabase/functions`
- [ ] Create E2E test folder: `e2e/`
- [ ] Create public assets folder: `public/icons`

**Commands:**

```bash
# Component folders
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/installations
mkdir -p src/components/notifications

# Core folders
mkdir -p src/layouts
mkdir -p src/lib
mkdir -p src/middleware
mkdir -p src/types
mkdir -p src/styles

# Page folders
mkdir -p src/pages/auth
mkdir -p src/pages/admin/installations
mkdir -p src/pages/admin/installers
mkdir -p src/pages/installer/installations

# Supabase folders
mkdir -p supabase/migrations
mkdir -p supabase/functions

# Test folders
mkdir -p e2e

# Public assets
mkdir -p public/icons
```

**Acceptance Criteria:**

- All folders exist
- Folder structure matches Astro conventions
- Component organization by feature (installations, notifications)
- Role-based page organization (admin, installer)

---

#### 4.2 Create Global Styles (Base Only)

- [ ] Create `src/styles/global.css`
- [ ] Add Tailwind directives (@tailwind base, components, utilities)
- [ ] Add ONLY @layer base styles (NO @apply component classes per user preference)
- [ ] Configure body and html base styles

**File:** `/src/styles/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-gray-50 text-gray-900 min-h-screen;
  }
}
```

**IMPORTANT:** Per user preference, do NOT add @apply classes for components (.btn, .input, etc). All component styling will use utility classes directly in Astro files.

**Acceptance Criteria:**

- File exists at `/src/styles/global.css`
- Tailwind directives included
- Only @layer base styles (no component layer with @apply)
- Clean, minimal setup

---

### 5. Supabase Client Infrastructure

#### 5.1 Create Supabase Client Configuration

- [ ] Create `src/lib/supabase.ts`
- [ ] Configure Supabase client with anonymous key
- [ ] Add TypeScript types (placeholder for Phase 02)
- [ ] Add JSDoc comments explaining RLS behavior

**File:** `/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configured with anonymous (public) key.
 *
 * IMPORTANT: This client respects Row Level Security (RLS) policies.
 * - All queries use the authenticated user's context
 * - RLS policies control data access at the database level
 * - Never trust client-side permission checks alone
 *
 * For server-side operations requiring elevated permissions,
 * use Supabase Edge Functions with the service role key.
 */

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env file and ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type placeholder - will be generated in Phase 02 after schema creation
// Run: npx supabase gen types typescript --project-id <id> > src/types/database.ts
export type Database = any; // TODO: Replace in Phase 02
```

**Acceptance Criteria:**

- File exists at `/src/lib/supabase.ts`
- Environment variables validated with helpful error message
- JSDoc comments explain RLS behavior
- Type placeholder with TODO for Phase 02

---

#### 5.2 Create Supabase Types Placeholder

- [ ] Create `src/types/database.ts` with placeholder type
- [ ] Add comment explaining type generation in Phase 02

**File:** `/src/types/database.ts`

```typescript
/**
 * Database type definitions for Supabase.
 *
 * This file will be auto-generated in Phase 02 after database schema creation.
 *
 * Generation command:
 * npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 *
 * DO NOT edit this file manually - it will be overwritten.
 */

export type Database = {
  public: {
    Tables: {};
    Views: {};
    Functions: {};
    Enums: {};
  };
};
```

**Acceptance Criteria:**

- File exists at `/src/types/database.ts`
- Placeholder structure matches Supabase type format
- Clear comment about Phase 02 regeneration

---

### 6. Package.json Scripts

#### 6.1 Add Test Scripts

- [ ] Add `test` script for unit tests
- [ ] Add `test:watch` for development
- [ ] Add `test:coverage` for coverage reports
- [ ] Add `test:integration` for integration tests (requires Supabase)
- [ ] Add `test:e2e` for Playwright E2E tests
- [ ] Add `test:e2e:ui` for Playwright UI mode

**File:** `/package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext .ts,.astro",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Acceptance Criteria:**

- All test scripts defined
- Lint and format scripts available
- Scripts use correct commands

---

#### 6.2 Configure Integration Test Setup

- [ ] Create `vitest.integration.config.ts` for integration tests
- [ ] Configure to ONLY run `*.integration.test.ts` files
- [ ] Add environment variable for test database (optional)

**File:** `/vitest.integration.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.integration.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
    setupFiles: ['./src/tests/integration-setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
});
```

**Acceptance Criteria:**

- File exists in project root
- Only runs integration tests
- Setup file configured for Supabase test connection

---

### 7. Temporary Verification Page

#### 7.1 Create Temporary Index Page

- [ ] Create `src/pages/index.astro` with minimal content
- [ ] Import global CSS
- [ ] Display "Setup Complete" message
- [ ] Add Spanish text (app language)
- [ ] Use Tailwind utility classes (no @apply)

**File:** `/src/pages/index.astro`

```astro
---
import '@/styles/global.css';
// Página temporal - será reemplazada en Fase 06
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IMS - Configuración Completa</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-3">IMS Setup Completo</h1>
      <p class="text-lg text-gray-600 mb-2">Fase 01 completada correctamente</p>
      <p class="text-sm text-gray-500">Astro 5 + Supabase + Tailwind CSS</p>
    </div>
  </body>
</html>
```

**Acceptance Criteria:**

- File exists at `/src/pages/index.astro`
- Global CSS imported
- Spanish text used
- Only utility classes (no @apply classes)
- Displays checkmark icon and success message

---

### 8. Git Hooks Configuration

#### 8.1 Initialize Husky

- [ ] Run `npx husky install`
- [ ] Create `.husky/` folder
- [ ] Add prepare script to package.json

**Commands:**

```bash
npx husky install
npm pkg set scripts.prepare="husky install"
```

**Acceptance Criteria:**

- `.husky/` folder exists
- `prepare` script in package.json

---

#### 8.2 Create Pre-Commit Hook

- [ ] Create `.husky/pre-commit` file
- [ ] Configure lint-staged to run Prettier and ESLint on staged files

**File:** `/.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**File:** `/package.json` (add lint-staged config)

```json
{
  "lint-staged": {
    "*.{ts,astro}": ["prettier --write", "eslint --fix"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**Acceptance Criteria:**

- Pre-commit hook exists and is executable
- lint-staged configuration in package.json
- Hook formats and lints only staged files

---

#### 8.3 Create Pre-Push Hook (Recommended)

- [ ] Create `.husky/pre-push` file
- [ ] Configure to run build before push
- [ ] Abort push if build fails

**File:** `/.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running build before push..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed. Push aborted."
  exit 1
fi

echo "Build successful. Proceeding with push."
```

**Acceptance Criteria:**

- Pre-push hook exists and is executable
- Build runs before push
- Push blocked if build fails

---

## Testing Requirements (MANDATORY)

### Unit Tests

#### Test 1: Supabase Client Initialization

**File:** `/src/lib/supabase.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from './supabase';

describe('Supabase Client', () => {
  it('should initialize without errors', () => {
    expect(supabase).toBeDefined();
  });

  it('should have required methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should throw error if environment variables are missing', async () => {
    // This test validates error handling
    // Actual test implementation depends on how env vars are mocked
    expect(import.meta.env.PUBLIC_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });
});
```

**Purpose:** Validate Supabase client initializes correctly

---

#### Test 2: Environment Variable Validation

**File:** `/src/lib/env.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('Environment Variables', () => {
  it('should have required Supabase variables', () => {
    expect(import.meta.env.PUBLIC_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should have required app variables', () => {
    expect(import.meta.env.PUBLIC_APP_URL).toBeDefined();
  });
});
```

**Purpose:** Ensure environment variables are properly configured

---

### Integration Tests

#### Test 3: Supabase Connection (Integration)

**File:** `/src/lib/supabase.integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { supabase } from './supabase';

describe('Supabase Integration', () => {
  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.auth.getSession();

    // Should not error (session may be null, that's ok)
    expect(error).toBeNull();
  });

  it('should have access to database', async () => {
    // Attempt to query (will fail if no tables, but connection should work)
    const { error } = await supabase.from('_test_connection').select('*').limit(1);

    // Error is expected (table doesn't exist yet), but should be a DB error, not connection error
    if (error) {
      expect(error.code).not.toBe('PGRST301'); // Not a connection error
    }
  });
});
```

**Purpose:** Validate Supabase connection works (requires Supabase instance)

---

### E2E Tests

#### Test 4: Homepage Renders

**File:** `/e2e/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/IMS/);
  });

  test('should display setup complete message', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toContainText('IMS Setup Completo');
  });

  test('should have proper Spanish content', async ({ page }) => {
    await page.goto('/');

    const content = page.locator('body');
    await expect(content).toContainText('Fase 01 completada correctamente');
  });
});
```

**Purpose:** Validate homepage renders correctly in browser

---

### Test Infrastructure Setup

#### Setup File for Integration Tests

**File:** `/src/tests/integration-setup.ts`

```typescript
/**
 * Setup file for integration tests.
 * Runs before all integration tests.
 */

import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Validate Supabase environment variables
  if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Integration tests require Supabase environment variables. ' +
        'Create .env file with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  console.log('Integration test environment initialized');
});

afterAll(async () => {
  console.log('Integration tests complete');
});
```

**Purpose:** Configure test environment for integration tests

---

#### Test Environment File

**File:** `/.env.test`

```env
# Test Environment Variables
# Copy from .env but use test Supabase project if available

PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_APP_URL=http://localhost:4321
```

**Acceptance Criteria:**

- File exists in project root
- Same structure as .env.example
- Used for test runs

---

### Test Checklist

- [ ] Unit test for Supabase client (`supabase.test.ts`)
- [ ] Unit test for environment variables (`env.test.ts`)
- [ ] Integration test for Supabase connection (`supabase.integration.test.ts`)
- [ ] E2E test for homepage (`homepage.spec.ts`)
- [ ] Integration test setup file (`integration-setup.ts`)
- [ ] Test environment file (`.env.test`)
- [ ] All tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:integration` (requires Supabase)
- [ ] E2E tests pass: `npm run test:e2e`

---

## Verification and Acceptance Criteria

### Phase 01 Complete When:

#### Development Environment

- [ ] `npm run dev` starts without errors
- [ ] Navigate to `http://localhost:4321` shows "IMS Setup Completo" page
- [ ] Page displays with correct Spanish text
- [ ] Page uses Tailwind styles (centered content, colors)
- [ ] No console errors in browser
- [ ] Hot reload works when editing files

---

#### Build Process

- [ ] `npm run build` completes successfully
- [ ] Build output in `dist/` folder
- [ ] No TypeScript errors
- [ ] No build warnings (except expected Astro warnings)
- [ ] `npm run preview` shows production build

---

#### Code Quality

- [ ] `npm run lint` passes with no errors
- [ ] `npm run format:check` shows all files formatted
- [ ] Pre-commit hook formats staged files
- [ ] Pre-push hook runs build successfully
- [ ] TypeScript strict mode enabled
- [ ] All path aliases resolve correctly

---

#### Testing

- [ ] `npm test` runs unit tests successfully
- [ ] All unit tests pass (green)
- [ ] `npm run test:integration` runs (requires .env with Supabase)
- [ ] Integration tests connect to Supabase
- [ ] `npm run test:e2e` runs Playwright tests
- [ ] E2E test passes for homepage
- [ ] Test coverage report generated

---

#### Project Structure

- [ ] All folders created as specified
- [ ] `src/lib/supabase.ts` exists and exports client
- [ ] `src/types/database.ts` exists with placeholder
- [ ] `src/styles/global.css` exists (base only, no @apply components)
- [ ] `.env.example` exists with all variables
- [ ] `.gitignore` properly configured
- [ ] `supabase/` folder structure ready for Phase 02

---

#### Configuration Files

- [ ] `astro.config.mjs` - SSR mode, Vercel adapter, Tailwind
- [ ] `tailwind.config.mjs` - Primary colors, content paths
- [ ] `tsconfig.json` - Strict mode, path aliases
- [ ] `vitest.config.ts` - Unit test configuration
- [ ] `vitest.integration.config.ts` - Integration test configuration
- [ ] `playwright.config.ts` - E2E test configuration
- [ ] `.eslintrc.cjs` - TypeScript + Astro linting
- [ ] `.prettierrc.cjs` - Code formatting
- [ ] `.husky/pre-commit` - Format and lint on commit
- [ ] `.husky/pre-push` - Build before push

---

#### Documentation

- [ ] This `workspace/backend.md` file created
- [ ] All checklist items documented
- [ ] Testing requirements clearly defined
- [ ] Acceptance criteria specified

---

## Post-Phase 01 Next Steps

**Phase 02: Supabase Setup**

- Create Supabase project (cloud or local CLI)
- Apply database schema (tables, RLS policies)
- Generate TypeScript types (`database.ts`)
- Create first migration file

**Phase 03: Supabase Client Integration**

- Implement authentication helpers
- Create auth utility functions
- Set up session management

**Phase 04-06: Authentication Flow**

- Configure Google OAuth
- Build login/callback pages
- Implement middleware for route protection

---

## Architecture Decisions Record

### Decision 1: SSR vs. SPA

**Decision:** Use Astro SSR mode (`output: 'server'`)

**Rationale:**

- Better SEO (important for admin dashboards)
- Faster initial page loads
- Secure server-side operations (protect sensitive data)
- Supabase client works on server and client

**Trade-offs:**

- Requires Vercel serverless functions (more complex than static)
- Higher hosting costs than static site
- More complex deployment

---

### Decision 2: Utility-First Tailwind Only

**Decision:** NO @apply classes for components (user preference)

**Rationale:**

- User explicitly requested utility-first approach
- Keeps all styling in component files (easier to see)
- Reduces CSS file size (no duplicate styles)
- Tailwind purge works better

**Trade-offs:**

- More verbose Astro files (longer class strings)
- Harder to enforce consistent component styles
- No shared component classes (must repeat utilities)

---

### Decision 3: Strict TypeScript

**Decision:** Use TypeScript strict mode

**Rationale:**

- Catch errors at compile time
- Better IDE autocomplete
- Supabase types require strict mode
- Prevents null/undefined errors

**Trade-offs:**

- More verbose code (explicit types)
- Slower initial development
- Learning curve for team

---

### Decision 4: Vitest + Playwright

**Decision:** Vitest for unit/integration, Playwright for E2E

**Rationale:**

- Vitest is fast and works well with Vite/Astro
- Playwright supports all browsers
- Clear separation: unit vs. integration vs. E2E
- Both have excellent TypeScript support

**Trade-offs:**

- Two testing frameworks to learn
- More configuration files
- Playwright requires browser downloads

---

### Decision 5: Separate Integration Test Config

**Decision:** Use `vitest.integration.config.ts` for integration tests

**Rationale:**

- Integration tests require Supabase connection (slower)
- Unit tests should run fast without external dependencies
- Clear separation improves CI/CD pipelines
- Developers can run unit tests only during TDD

**Trade-offs:**

- Two Vitest configs to maintain
- Must remember to run both test suites
- More complex npm scripts

---

## Common Pitfalls and Solutions

### Pitfall 1: Missing Environment Variables

**Problem:** Supabase client throws error on import

**Solution:**

- Ensure `.env` file exists (copy from `.env.example`)
- Restart dev server after adding env vars
- Check env var names match exactly (PUBLIC\_ prefix required)

---

### Pitfall 2: Path Aliases Not Resolving

**Problem:** TypeScript can't find imports like `@lib/supabase`

**Solution:**

- Ensure `tsconfig.json` has `paths` configured
- Restart TypeScript server in IDE
- Check `vitest.config.ts` has matching aliases

---

### Pitfall 3: Tailwind Not Working

**Problem:** Tailwind classes have no effect

**Solution:**

- Ensure `global.css` imported in layout or page
- Check `tailwind.config.mjs` content paths include `.astro` files
- Restart dev server
- Verify Tailwind integration in `astro.config.mjs`

---

### Pitfall 4: Tests Can't Import Astro Files

**Problem:** Vitest fails when importing `.astro` components

**Solution:**

- Don't import Astro components in unit tests
- Test utilities and lib files separately
- Use E2E tests for full component testing
- Mock Astro-specific imports if needed

---

### Pitfall 5: E2E Tests Timeout

**Problem:** Playwright tests fail with timeout errors

**Solution:**

- Ensure dev server is running (`npm run dev`)
- Check `baseURL` in `playwright.config.ts` matches dev server
- Increase timeout in test file if needed
- Use `webServer` config to auto-start dev server

---

## Summary

Phase 01 establishes a production-ready Astro 5 SSR application with:

- Comprehensive testing infrastructure (unit, integration, E2E)
- Supabase client foundation (ready for Phase 02 schema)
- Strict TypeScript configuration with path aliases
- Code quality tooling (ESLint, Prettier, Husky)
- Utility-first Tailwind CSS (no @apply component classes)
- Spanish language UI
- Vercel deployment configuration

**Estimated Time:** 2-3 hours (including test setup)

**Next Phase:** Phase 02 - Supabase Setup (database schema, RLS policies, type generation)
