# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMS (Installation Management System) is a Progressive Web Application for managing installations, built with Astro 5, Supabase, and TypeScript. The application uses server-side rendering and follows a pragmatic, component-based architecture.

**Tech Stack**:

- **Framework**: Astro 5 (SSR mode)
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: PostgreSQL via Supabase
- **Backend**: Supabase Edge Functions
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: To be configured (Vitest + Playwright recommended)
- **Deployment**: Vercel
- **PWA**: Service Worker + Web App Manifest

**Production**: To be deployed on Vercel

## Development Commands

```bash
# Setup (first time)
npm install
cp .env.example .env               # Edit and set Supabase credentials
npm run dev                        # Start dev server (http://localhost:4321)

# Testing (to be configured)
npm test                           # Unit tests
npm run test:watch                 # Watch mode
npm run test:integration           # Integration tests (requires Supabase connection)
npm run test:e2e                   # Playwright E2E tests
npm run test:e2e:debug             # Playwright UI mode
npm run test:coverage              # Coverage report

# Linting and Formatting
npm run lint                       # ESLint
npm run format                     # Format all files with Prettier
npm run format:check               # Check formatting without modifying files

# Building
npm run build                      # Production build (SSR + static assets)
npm run preview                    # Preview production build locally

# Supabase (local development)
npx supabase start                 # Start local Supabase instance
npx supabase stop                  # Stop local Supabase
npx supabase db reset              # Reset local database to latest migration
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts  # Generate types
npx supabase migration new <name>  # Create new migration
npx supabase db push               # Apply migrations to remote
```

## Testing a Single Test

```bash
# Run a specific test file (when tests are configured)
npx vitest run path/to/test-file.test.ts

# Watch a specific test file
npx vitest path/to/test-file.test.ts

# Run tests matching a pattern
npx vitest run -t "test description pattern"

# Run E2E test for a specific file
npx playwright test path/to/test-file.spec.ts
```

## Architecture

### Astro SSR + Supabase Architecture

The application uses Astro's server-side rendering with Supabase as the backend:

```
src/
├── pages/                      # File-based routing (Astro SSR)
│   ├── admin/                  # Admin-only pages (protected by middleware)
│   │   ├── installations/      # Installation management
│   │   └── installers/         # Installer management
│   ├── installer/              # Installer-only pages (protected by middleware)
│   │   └── installations/      # View and update assigned installations
│   └── auth/                   # Authentication flow (login, callback)
├── components/                 # Reusable Astro components
│   ├── ui/                     # Generic components
│   ├── layout/                 # Layout components
│   ├── installations/          # Installation-specific components
│   └── notifications/          # Push notification components
├── layouts/                    # Layout templates
├── lib/                        # Utilities and Supabase client
└── middleware/                 # Route protection and role-based access
```

**Key Environment Variables** (set in `.env`):

- `PUBLIC_SUPABASE_URL` - Supabase project URL (REQUIRED)
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public API key (REQUIRED)
- `PUBLIC_APP_URL` - Application base URL (REQUIRED)
- `PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` - VAPID private key (server-side only)
- `VAPID_SUBJECT` - VAPID subject email

### Supabase Integration Pattern

Supabase client is configured in `src/lib/supabase.ts`:

```typescript
// Client with anonymous key (respects RLS policies)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

**Data Access Pattern**:

- Use Supabase client with anonymous key in Astro pages/components (respects RLS)
- For server-side operations needing elevated permissions, use Edge Functions with service role key
- Apply Row Level Security (RLS) policies in Supabase for authorization
- Never trust client-side permission checks
- Use middleware for route-level protection

**Note**: After running `npx supabase start`, local credentials will be displayed in the terminal. Update `.env` with these values for local development.

### Path Aliases

TypeScript uses these aliases (configured in `tsconfig.json`):

```typescript
import { ... } from '@/...'           // src/
import { ... } from '@components/...' // src/components/
import { ... } from '@lib/...'        // src/lib/
import { ... } from '@layouts/...'    // src/layouts/
import { ... } from '@types/...'      // src/types/
```

## Testing Strategy

### Test File Naming Convention

The project uses a standard naming convention for tests (to be configured):

- **Unit tests**: `*.test.ts` - Fast tests with no external dependencies (use mocks)
- **Integration tests**: `*.integration.test.ts` - Tests that connect to Supabase (database, auth, edge functions)
- **E2E tests**: `*.spec.ts` in `e2e/` folder - Tests complete user flows with Playwright

**Important**:

- Unit tests should exclude `*.integration.test.ts` files
- Integration tests require Supabase connection (local or remote)
- When creating tests that connect to Supabase, always use `.integration.test.ts` extension

### Test Isolation

Integration tests will connect to Supabase (local instance recommended via Supabase CLI).

**Examples**:

- ✅ `auth.integration.test.ts` - Tests authentication flow with Supabase Auth
- ✅ `installations.integration.test.ts` - Tests database operations via Supabase
- ✅ `notify-installer.integration.test.ts` - Tests Edge Functions

### Authentication in Tests

**Development/Testing Login**:

- Use Supabase test users created in local instance
- Configure test credentials in `.env.test`
- E2E tests should use real authentication flow

### E2E Tests

To be located in `e2e/`. Use Playwright with the following commands:

- `npm run test:e2e` - Headless execution
- `npm run test:e2e:debug` - UI mode (recommended for development)
- `npx playwright test --ui` - Playwright UI mode

## Git Hooks

The project will use Husky to manage Git hooks for code quality (to be configured during project setup).

### Pre-commit Hook (to be configured)

Will automatically run before each commit:

- Format staged files using Prettier via `lint-staged`
- Run ESLint on TypeScript/Astro files
- Only process code files (`.ts`, `.astro`, `.json`, `.css`)

### Recommended Pre-push Hook

Automatically run before each push:

- Execute `npm run build` to ensure the project builds successfully
- Abort push if build fails
- Prevent pushing broken code to remote repository

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]
```

**Common types:**

- `feat:` → New features
- `fix:` → Bug fixes
- `docs:` → Documentation changes
- `style:` → Code style changes (formatting, etc.)
- `refactor:` → Code refactoring
- `test:` → Test changes
- `chore:` → Build/tooling changes

**Examples:**

```bash
feat: add installation status tracking
feat(auth): implement Google OAuth login
fix: correct installer assignment logic
docs: update README with setup instructions
```

## Contribution workflow

Key requirements when contributing:

1. **Plan First**: Review implementation phases in `workspace/planning/` before coding
2. **Branch**: `feature/<phase-number>-<description>` or `fix/<description>` from `main`
3. **Tests**: Write tests for new functionality (unit + E2E when applicable)
4. **Documentation**: Update relevant documentation when adding new patterns or libraries
5. **Code Review**: Ensure code follows clean code principles before committing

**PR Requirements**:

- Clear and descriptive title
- Tests for new functionality
- Documentation updates if needed
- Code follows ESLint and Prettier rules

**Commit Message Requirements**:

- **IMPORTANT**: DO NOT add any AI assistant attribution, co-author tags, or "Generated with AI" messages to commits
- Use [Conventional Commits](https://www.conventionalcommits.org/) format
- Keep commits focused and atomic
- Write clear, descriptive commit messages

## Key Documentation Files

- `workspace/context/PROJECT_CONTEXT.md` - Project overview and implementation plan
- `workspace/planning/` - Implementation phases (00-15)
- `.env.example` - Required environment variables template
- `README.md` - Project setup and basic information

## Common Pitfalls

1. **Missing Environment Variables**: Ensure `.env` has all required Supabase credentials (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, etc.).
2. **RLS Not Configured**: Always configure Row Level Security policies in Supabase. Never rely only on client-side checks.
3. **Type Mismatches**: Regenerate TypeScript types (`npx supabase gen types`) after schema changes.
4. **Middleware Not Protecting Routes**: Ensure middleware is properly configured to protect admin/installer routes.
5. **Local Supabase Not Running**: Local development with Supabase CLI requires `npx supabase start` before testing.

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

## Code Language Policy

- **All code, tests, comments, and technical documentation**: English
- **Communication with team members**: Spanish (if applicable)
- **Planning documents** (`workspace/` folder): Spanish

## Internationalization

Internationalization can be added in the future if needed. For now, the app is built in a single language (Spanish or English, to be decided). If i18n is needed later, consider using:

- Astro's built-in i18n routing
- `astro-i18next` or similar libraries

## Custom Agents

The project can include specialized Claude Code agents in `.claude/agents/` (to be configured):

- **clean-code-reviewer** - Reviews code quality, naming conventions, and clean code principles
- **documentation-keeper** - Ensures documentation stays updated with code changes
- **supabase-expert** - Assists with Supabase schema design, RLS policies, and Edge Functions
- **astro-specialist** - Guides Astro SSR best practices and component patterns

## workspace

The project follows a phased implementation approach. See `workspace/planning/` for detailed phases.

### 1. Task Clarification

Once I tell you the task I want you to do:

1. If you have **any kind of doubts**, ask me **before starting** so you can do it correctly.
2. If the task involves **multiple-choice questions**, present them in an **interactive way**, allowing me to select the correct option.
3. The **last response** in the flow should allow me to **write freely** any comment or answer.

### 2. Confirmation and Kickoff

Once everything is clear, you say **"Vamos niño!!!"** and start working.

### 3. Branch Setup

The first thing you need to do:

- Update your local branch with `main`
- Create a new branch with the task number and name
- Format: `feature/12-task-name`
- Make all changes there

### 4. Assignment on GitHub

You must **assign the task to me** on GitHub, so there’s a record that I’m the one who gave it to you.

### 5. Move to "In Progress"

Once assigned, move the task to **"In Progress"** on the GitHub Projects board before starting it.

### 6. Progress File (WIP.md)

When you start the task:

- Create a temporary file called `WIP.md`
- Write down what you plan to do and your current progress
- **REMEMBER** Each time you complete a step, update the file WIP.md and mark it as done
- **Purpose**: If you lose your token or connection, you won’t lose your progress
- Once everything is finished and committed, **delete that temporary file**

### 7. Research and Questions

- If you have any doubts during development, **feel free to search online**
- There’s plenty of information on the web
- If you can’t find an answer, ask me

### 8. Testing

- For new functionalities, **you must write tests**
- If possible, follow the **TDD (Test-Driven Development)** cycle
- That way, you ensure everything works properly

### 9. Best Practices

Remember to follow software development best practices:

- ✅ TDD (Test-Driven Development) when possible
- ✅ Complete test coverage (unit + integration + E2E)
- ✅ Clean component architecture (Astro best practices)
- ✅ Supabase RLS for security (never trust client-side checks)
- ✅ Semantic, self-documenting code
- ✅ Everything that comes with good software design

**Documentation**: Everything is documented in the `workspace/` folder — **always review them**.

#### Code Comments Philosophy

**IMPORTANT**: Avoid redundant comments in code. Instead, write semantic, self-documenting code with clear names.

**❌ Don't do this:**

```typescript
// Create a new date with the year, month and day
const date = new Date(year, month - 1, day);

// Check if the date is today
function isToday(date: Date): boolean {
  // Return true if it's today
  return date.getDate() === today.getDate();
}
```

**✅ Do this instead:**

```typescript
const date = new Date(year, month - 1, day);

function isToday(date: Date): boolean {
  return date.getDate() === today.getDate();
}

// Or if truly needed, explain WHY, not WHAT:
function getDaysInMonth(month: number, year: number): Date[] {
  // Month is 0-indexed in JavaScript Date API
  const firstDay = new Date(year, month - 1, 1);
  return days;
}
```

**Guidelines:**

- Use descriptive variable names: `userAuthenticationToken` instead of `token // for user auth`
- Use descriptive function names: `calculateTotalPriceWithTax()` instead of `calculate() // gets total with tax`
- Use descriptive test names: `should display events in year view` instead of `test1 // checks year events`
- Use descriptive class names: `UserAuthenticationService` instead of `Service // handles user auth`
- Only add comments to explain **WHY** something is done, not **WHAT** is being done
- Remove commented-out code (use git history instead)
- Comments explaining business rules or complex algorithms are acceptable

### 10. Pre-Commit Review

When you finish the task, **before making any commit**:

1. **Run the build** to ensure the project compiles correctly:

   ```bash
   npm run build
   ```

   - The build must complete successfully without errors

2. **Run all tests** to ensure everything passes (when tests are configured):

   ```bash
   npm test                      # Unit tests must pass
   npm run test:integration      # Integration tests must pass (if applicable)
   npm run test:e2e              # E2E tests must pass (if applicable)
   ```

   - All tests must be green ✅
   - No failing tests allowed ❌

3. **Once build and tests are passing**, notify me so I can review what you're about to commit.

### 11. Commit and Pull Request

Once I give you the OK:

- Make the commit and push to your branch
- Create a pull request
- **Do everything as if you were me**
- **NEVER mention yourself as co-author** or anything similar. That is not done.
