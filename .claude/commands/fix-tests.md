# Fix Failing Tests

Analyze and fix failing tests in the project.

## Steps:

1. **Run all tests** and capture failures:
   - Unit tests: `npm test`
   - Integration tests: `npm run test:with-integration` (requires MongoDB running)
   - E2E tests: `npm run test:e2e`
   - Capture full output including stack traces

2. **Analyze failures**:
   - Identify root causes from error messages
   - Check if failures are due to:
     - Business logic bugs
     - Test setup issues
     - Environment/configuration problems (env vars, database)
     - Flaky tests (timing, randomness)
     - Missing mock data or test fixtures

3. **Check environment requirements**:
   - For integration tests: MongoDB must be running (`npm run database:up`)
   - Check `.env.local.test` for test environment variables
   - Verify adapter types are set correctly for tests (usually `memory`)

4. **Read relevant source files**:
   - Read the failing test file
   - Read the implementation being tested
   - Understand the expected vs actual behavior
   - Check if hexagonal architecture rules are violated (run `npm run lint`)

5. **Suggest fixes**:
   - Explain what's wrong
   - Propose solution following TDD principles
   - Maintain Sustainable Code practices
   - Keep tests readable and maintainable
   - For repository tests, check if correct adapter is being used

6. **Apply fixes** (after approval):
   - Fix the issue (test or implementation)
   - Re-run tests to verify: `npm test`
   - If integration test: `npm run test:with-integration`
   - If E2E test: `npm run test:e2e`
   - Ensure all tests pass

7. **Verify no regression**:
   - Run full test suite: `npm test`
   - Run linter: `npm run lint`
   - Verify all tests pass and no new failures introduced

8. **Suggest commit message**:
   - Format: `🩹 Fix failing tests: <description>`
   - Include what was fixed and why
   - Use `/git-commit` command for proper format

## Important:

- Follow existing test patterns (`describe()`/`it()` blocks, Given-When-Then)
- Use descriptive test names in English
- Keep tests focused and isolated
- Prefer test doubles over complex mocking when it improves clarity
- Remember: Unit tests use memory adapters, integration tests use real databases
