# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

> 📖 **IMPORTANT**: Before starting any work, read `workspace/context/PROJECT_CONTEXT.md` for a complete overview of the project structure, architecture, implementation phases, and current state. This will save tokens and provide essential context.

## Project Overview

IMS (Installation Management System) is a Progressive Web Application for managing installations, built with Astro 5, Supabase, and TypeScript. The application uses a pragmatic, component-based architecture with server-side rendering.

## Architecture

### Directory Structure

- **`src/pages/`**: File-based routing with Astro SSR
  - `admin/`: Admin-only pages (installations, installers management)
  - `installer/`: Installer-only pages (view assignments, update status)
  - `auth/`: Authentication flow (login, OAuth callback)
- **`src/components/`**: Reusable Astro components organized by domain
  - `ui/`: Generic components (Button, Input, Badge, Modal, Select)
  - `layout/`: Layout components (Header, Sidebar, MobileNav)
  - `installations/`: Installation-specific components
  - `notifications/`: Push notification components
- **`src/layouts/`**: Layout templates (BaseLayout, AuthLayout, DashboardLayout)
- **`src/lib/`**: Shared utilities and Supabase client configuration
- **`src/middleware/`**: Route protection and role-based access control
- **`supabase/`**: Database migrations and Edge Functions

### Supabase Backend

The application uses Supabase as the backend platform:

- **Database**: PostgreSQL with Row Level Security (RLS) policies
- **Authentication**: Google OAuth via Supabase Auth
- **Edge Functions**: Serverless functions for background tasks (e.g., push notifications)
- Data access is handled through Supabase client with TypeScript types generated from schema

### Configuration via Environment Variables

Required environment variables (see `.env.example`):

- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public API key
- `PUBLIC_APP_URL`: Application base URL
- `PUBLIC_VAPID_PUBLIC_KEY`: VAPID public key for push notifications
- `VAPID_PRIVATE_KEY`: VAPID private key (server-side only)
- `VAPID_SUBJECT`: VAPID subject email

### Progressive Web App (PWA)

The app is a PWA with:

- Service Worker for offline support and caching
- Web App Manifest for installability
- Push notifications via Web Push API

## Development Commands

### Running the Application

```bash
npm run dev              # Start development server (port 4321)
npm run build            # Build for production (SSR + static assets)
npm run preview          # Preview production build locally
```

### Testing

```bash
npm test                        # Run unit tests (to be configured with Vitest)
npm run test:watch              # Run tests in watch mode
npm run test:integration        # Run integration tests (requires Supabase connection)
npm run test:e2e                # Run E2E tests (to be configured with Playwright)
npm run test:e2e:debug          # Playwright UI mode
npm run test:coverage           # Coverage report
```

**Important**: Integration tests require connection to Supabase (local or remote).

**Note**: Testing framework is not yet configured. Commands above represent the planned testing setup.

### Supabase

```bash
# Local development (requires Supabase CLI)
npx supabase start           # Start local Supabase instance
npx supabase stop            # Stop local Supabase instance
npx supabase db reset        # Reset local database to latest migration

# Type generation
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

# Migrations
npx supabase migration new <migration-name>  # Create new migration
npx supabase db push                         # Apply migrations to remote
```

### Linting & Formatting

```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## Testing Philosophy

- **Unit tests**: Test individual components and utility functions in isolation
- **Integration tests**: Test Supabase queries, authentication flows, and Edge Functions
- **E2E tests**: Test complete user flows (admin creating installation, installer updating status)

**Note**: Testing configuration is not yet implemented. When setting up tests, use Vitest for unit/integration and Playwright for E2E.

## Path Aliases

TypeScript uses these aliases (configured in `tsconfig.json`):

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@lib/*` → `src/lib/*`
- `@layouts/*` → `src/layouts/*`
- `@types/*` → `src/types/*`

## File Naming Conventions

The project follows these TypeScript/Astro naming conventions for files:

### PascalCase (ComponentName.astro, ClassName.ts)

Used for Astro components and TypeScript classes:

- **Astro Components**: `Button.astro`, `InstallationCard.astro`, `DashboardLayout.astro`
- **Classes/Types**: `Installation.ts`, `Installer.ts` (if using class-based models)

### kebab-case (file-name.ts, file-name.astro)

Used for utilities, configuration, and non-component files:

- **Utilities**: `supabase.ts`, `auth.ts`, `push.ts`
- **Middleware**: `index.ts` (in middleware folder)
- **Routes**: `index.astro`, `[id].astro` (Astro file-based routing)

### camelCase (fileName.ts)

Used for TypeScript helper files and scripts:

- **Helpers**: `getCurrentUser.ts`, `formatDate.ts`

### Test Files

- **Unit tests**: Match the source file with `.test.ts` suffix: `auth.test.ts`, `supabase.test.ts`
- **Integration tests**: Match the source file with `.integration.test.ts` suffix: `installations.integration.test.ts`
- **E2E tests**: Descriptive names in `e2e/` folder: `admin-create-installation.spec.ts`

**Rationale**: This convention provides clear visual distinction between different types of files and aligns with Astro/TypeScript ecosystem standards.

## Contribution workflow

Follow this workflow when contributing:

- Check implementation phases in `workspace/planning/` before starting work
- Create tasks on GitHub Board (if applicable)
- Branch naming: `feature/<phase-number>-<description>` or `fix/<description>`
- PR title format: Clear description of the change
- New functionality requires tests (unit + E2E when applicable)
- New libraries/patterns require documentation updates
- Pair validation recommended for architectural decisions

## Requirements

- Node.js >=18.0.0
- npm >=9.0.0
- Supabase account (for deployment)
- Vercel account (for deployment)

## 💻 Development Principles & Conventions

### Test-Driven Development (TDD)

**RECOMMENDED:** When implementing new flows or features, follow the TDD cycle:

1. ✍️ Write a failing test first (Red)
2. ✅ Write minimal code to make it pass (Green)
3. ♻️ Refactor while keeping tests green (Refactor)

**Note**: While TDD is highly recommended, focus on ensuring comprehensive test coverage even if not following strict TDD.

### Code Quality Standards

Follow these guidelines in order of priority:

1. **Carlos Blé's Sustainable Code** principles
2. **Clean Code** by Robert C. Martin

**Key Principles:**

- Human-friendly code: clear names, easy to understand
- Prefer functional programming for object mappings when it improves clarity
- Small, focused functions with single responsibility
- Explicit over implicit
- Domain language in code (ubiquitous language)

#### Code Comments Philosophy

**IMPORTANT**: Avoid redundant comments. Write semantic, self-documenting code with clear names instead.

**❌ Avoid:**

```typescript
// Loop through all installations
installations.forEach((installation) => {
  // Check if installation is pending
  if (installation.status === 'pending') {
    // Send notification
    sendNotification(installation);
  }
});
```

**✅ Prefer:**

```typescript
const pendingInstallations = installations.filter((i) => i.isPending);
pendingInstallations.forEach(sendNotificationFor);

// Or if context is truly needed, explain WHY:
// Using legacy Supabase RPC until new Edge Function is deployed (ticket #123)
const response = await supabase.rpc('legacy_get_installations', { userId });
```

**Guidelines:**

- Descriptive names over comments: `userAuthToken` not `token // for auth`
- Descriptive functions: `calculateTotalWithTax()` not `calc() // total + tax`
- Descriptive tests: `should return empty array when no installations match status` not `test1`
- Only comment **WHY**, not **WHAT**
- Remove dead code (trust git history)
- Business rules and complex algorithms may justify comments

### Testing Strategy

**Test Pyramid:**

- 🔹 **Many unit tests**: Fast, isolated, testing business logic and utilities
- 🔸 **Integration tests**: Testing Supabase interactions, authentication, Edge Functions
- 🔷 **E2E tests**: Testing complete user flows with real browser

### Code Language

- **All code, tests, comments, and technical documentation**: English
- **Communication with team members**: Spanish (if applicable)
- **Planning documents** (`workspace/` folder): Spanish

### Internationalization

Internationalization can be added in the future if needed. For now, the app is built in a single language (Spanish or English, to be decided). If i18n is needed later, consider using:

- Astro's built-in i18n routing
- `astro-i18next` or similar libraries

### Documentation & Commits

- **Documentation**: When creating new processes or fixing bugs, create appropriate documentation in `workspace/` folder when convenient
- **README Updates**: Link new documentation to the main `README.md` when necessary
- **Commit Messages**: After each major change, provide:
  - Commit title with conventional commits format (in English): `feat:`, `fix:`, `docs:`, etc.
  - Detailed description of changes (in English)
  - NO AI assistant mentions
  - NO mentions of Co-Authored-By for AI assistants

---

**Remember:**

- Follow TDD when implementing new features (recommended)
- Keep architecture clean and components focused
- Write human-friendly, sustainable code
- Test thoroughly at multiple levels
- Use Supabase RLS for authorization (never trust client-side checks alone)

## RULES

- NEVER write code without concrete functionality
- NEVER skip tests for new features (unit + E2E when applicable)
- NEVER mention AI assistants in commits
- ALWAYS apply ESLint + Prettier
- ALWAYS use Supabase RLS for data security
- ALWAYS validate user permissions server-side
