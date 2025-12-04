# E2E Testing Guide - Phase 06

This guide explains how to set up and run end-to-end tests for the IMS authentication system.

## Prerequisites

- Supabase project configured (local or remote)
- Node.js and npm installed
- Project dependencies installed (`npm install`)

## Test User Setup

**IMPORTANT**: Many tests require authenticated users with specific roles. Follow these steps to create test users in Supabase.

### Creating Test Users

#### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" → "Users"

2. **Create Admin User**:
   - Click "Add User" or "Invite User"
   - **Email**: Use your Google account email (the one you'll use for OAuth)
   - **Auto Confirm User**: Enable this option
   - Click "Create User"

3. **Add Admin Role to Database**:
   - Go to "Table Editor" → "users" table
   - Find the user you just created (by email)
   - Set the `role` column to `'admin'`
   - Set the `full_name` column to your desired name (e.g., "Admin User")

4. **Create Installer User** (Optional, for complete test coverage):
   - Repeat steps 2-3 with a different Google account
   - Set `role` to `'installer'`
   - Set `full_name` to "Installer User" (or similar)

#### Option 2: Using SQL (Advanced)

Run this SQL in Supabase SQL Editor after the user authenticates via Google OAuth for the first time:

```sql
-- Update existing user to admin role
UPDATE users
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'your-admin-email@gmail.com';

-- Update existing user to installer role (if applicable)
UPDATE users
SET role = 'installer', full_name = 'Installer User'
WHERE email = 'your-installer-email@gmail.com';
```

### Verifying Test Users

After creating test users, verify them in the Supabase dashboard:

1. Go to "Table Editor" → "users"
2. Confirm the following columns are set correctly:
   - `email`: Your Google account email
   - `role`: Either `'admin'` or `'installer'`
   - `full_name`: A readable name
   - `auth_id`: Should be populated (UUID from Supabase Auth)

## Test Structure

### Test Files

- **auth-middleware.spec.ts**: Route protection and role-based access tests
- **error-handling.spec.ts**: Error page display and functionality tests
- **session-expiry.spec.ts**: Session expiry flow and messaging tests
- **user-info-display.spec.ts**: User info display on dashboards (requires authenticated users)
- **login-errors.spec.ts**: Login page error message tests
- **homepage.spec.ts**: Basic homepage tests

### Helper Files

- **e2e/helpers/auth.ts**: Authentication helper functions
  - `loginAsAdmin(page)`: Login as admin user
  - `loginAsInstaller(page)`: Login as installer user
  - `logout(page)`: Logout current user
  - `clearAuthCookies(page)`: Clear authentication cookies
  - `simulateSessionExpiry(page)`: Simulate session expiry

- **e2e/fixtures/users.ts**: Test user data
  - `ADMIN_USER`: Admin user credentials
  - `INSTALLER_USER`: Installer user credentials

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test e2e/error-handling.spec.ts
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Skipped Tests

Many tests are currently skipped due to the requirement for authenticated test users. These tests have `.skip()` and include TODO comments explaining what's needed.

### Tests That Require Admin User

These tests are skipped until an admin test user is configured:

- `auth-middleware.spec.ts`:
  - "admin user can access /admin routes"
  - "admin user accessing /installer redirects to /admin"
  - "admin user accessing / redirects to /admin"

- `user-info-display.spec.ts`:
  - "admin dashboard displays user full name and role"
  - "admin dashboard displays user initials avatar"
  - "admin dashboard has working logout link"
  - All responsive tests for admin dashboard

### Tests That Require Installer User

These tests are skipped until an installer test user is configured:

- `auth-middleware.spec.ts`:
  - "installer user can access /installer routes"
  - "installer user accessing /admin redirects to /installer"
  - "installer user accessing / redirects to /installer"

- `user-info-display.spec.ts`:
  - "installer dashboard displays user full name and role"
  - "installer dashboard displays user initials avatar"
  - "installer dashboard has working logout link"
  - All responsive tests for installer dashboard

### Enabling Skipped Tests

Once you've created test users:

1. **Update `e2e/fixtures/users.ts`** with actual test user credentials:

```typescript
export const ADMIN_USER: TestUser = {
  email: 'your-actual-admin@gmail.com',
  fullName: 'Your Admin Name',
  role: 'admin'
};

export const INSTALLER_USER: TestUser = {
  email: 'your-actual-installer@gmail.com',
  fullName: 'Your Installer Name',
  role: 'installer'
};
```

2. **Update helper functions** in `e2e/helpers/auth.ts` if needed to match your OAuth flow

3. **Remove `.skip()`** from test cases you want to enable

4. **Run the tests** to verify everything works

## Test Best Practices

### Authentication Flow

- **DO NOT** hardcode passwords (we use OAuth)
- **DO** use helper functions for login/logout
- **DO** clean up authentication state between tests
- **DO** use Playwright's storage state for session persistence

### Test Isolation

- Each test should be independent
- Use `beforeEach` hooks to reset state
- Clear cookies/storage between tests when needed

### Assertions

- Use semantic selectors (roles, labels, text)
- Avoid brittle CSS selectors when possible
- Test user-visible behavior, not implementation details

### Debugging

- Use `page.pause()` to stop execution and inspect
- Use `--debug` flag for step-by-step execution
- Check screenshots in `test-results/` on failure

## Continuous Integration

Tests are configured to run in CI environments with:

- Retries: 2 attempts on failure
- Single worker for stability
- Screenshots on failure
- HTML report generation

## Common Issues

### Issue: "Test timed out waiting for navigation"

**Solution**: Ensure dev server is running (`npm run dev`) and accessible at `http://localhost:4321`

### Issue: "Cannot find role=alert"

**Solution**: Check that error page query parameters are correct and error type is valid

### Issue: "User info not displayed on dashboard"

**Solution**: Verify test user exists in database with correct role and full_name

### Issue: "OAuth login fails"

**Solution**:

1. Check Supabase OAuth configuration
2. Verify redirect URLs are correct
3. Ensure test user has correct Google account

## Test Coverage

Current test coverage:

- ✅ Route protection for unauthenticated users
- ✅ Error page display and functionality
- ✅ Error page accessibility (ARIA roles)
- ✅ Login page error messages
- ✅ Session expiry messaging
- ✅ Responsive design (mobile and desktop)
- ⏸️ Role-based access (skipped, requires test users)
- ⏸️ User info display (skipped, requires test users)
- ⏸️ Full authentication flow (skipped, requires OAuth setup)

## Next Steps

1. **Create admin test user** following the guide above
2. **Create installer test user** (optional, for complete coverage)
3. **Update `e2e/fixtures/users.ts`** with actual credentials
4. **Enable skipped tests** by removing `.skip()`
5. **Run all tests** to verify authentication flows

## Support

If you encounter issues:

1. Check Supabase logs for authentication errors
2. Verify database schema matches expected structure
3. Ensure RLS policies are configured correctly
4. Review Playwright trace files in `test-results/`

For more information on Playwright, visit: https://playwright.dev/
