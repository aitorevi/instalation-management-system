# Refactor Code

Refactor code following Sustainable Code, Clean Code, and DDD principles while maintaining functionality.

## Steps:

1. **Identify refactoring target**:
   - Ask user what to refactor, or
   - Analyze recent changes for code smells:
     - Long methods (>15 lines)
     - God classes (too many responsibilities)
     - Primitive obsession (missing value objects)
     - Feature envy (method using another class's data too much)
     - Duplicated code
     - Poor naming
     - Tight coupling
     - Violation of hexagonal architecture boundaries

2. **Ensure test coverage exists**:
   - Check that tests exist for the code to refactor
   - Run tests to confirm they pass: `npm test`
   - If tests missing, write them FIRST before refactoring
   - Check coverage if needed: `npm run test:coverage`

3. **Plan the refactoring**:
   - Identify the code smell or issue
   - Decide on the refactoring technique:
     - Extract Method
     - Extract Class
     - Introduce Value Object (DDD)
     - Move Method to correct layer (Hexagonal Architecture)
     - Rename for clarity
     - Replace conditional with polymorphism
     - Simplify complex logic
   - Explain the plan to user

4. **Apply refactoring incrementally**:
   - Make ONE small change at a time
   - Run tests after EACH change: `npm test` (or use `npm run test:watch`)
   - Keep tests green throughout (RED = STOP and revert)
   - Follow Sustainable Code principles:
     - Clear, human-friendly names
     - Small, focused functions (one thing well)
     - Explicit over implicit
     - Prefer functional style for mappings when clearer
     - Domain language in code

5. **Check architecture compliance**:
   - Run linter: `npm run lint`
   - ESLint enforces hexagonal architecture rules:
     - Domain doesn't depend on Infrastructure or Application
     - Application doesn't depend on Infrastructure
     - Infrastructure adapts external systems
   - Manually verify import statements use path aliases (`@/`, `@backend/`, `@frontend/`)

6. **Verify no behavior change**:
   - Run full test suite: `npm test`
   - Run integration tests if applicable: `npm run test:with-integration`
   - Run E2E tests if refactoring affects user flows: `npm run test:e2e`
   - All tests should still pass
   - No new functionality should be added
   - No functionality should be removed

7. **Review the result**:
   - Code is more readable?
   - Responsibilities are clearer?
   - Easier to understand and maintain?
   - Follows DDD and Sustainable Code principles?

8. **Suggest commit message**:
   - Format: `♻️ Refactor [what]: [brief description]`
   - Example: `♻️ Refactor OrderService: extract email sending to separate use case`
   - Include:
     - What was refactored
     - Why (what improved)
     - Pattern/principle applied

## Refactoring Patterns to Consider:

### Domain Layer (DDD):

- **Extract Value Object**: Replace primitives with domain concepts
  ```typescript
  // Before: string email
  // After: Email email (value object with validation)
  ```
- **Extract Domain Service**: Complex business logic that doesn't belong to an entity
- **Introduce Aggregate Root**: Group related entities under one root

### Application Layer:

- **Extract Use Case**: Separate business operations into focused use cases
- **Apply Command/Query Separation**: Read vs Write operations

### General:

- **Extract Method**: Break down long methods
- **Rename**: Use ubiquitous language, clear intent
- **Replace Magic Numbers**: Use named constants
- **Simplify Conditionals**: Guard clauses, early returns

## Important Rules:

- ✅ **Tests MUST pass before starting**
- ✅ **Tests MUST stay green during refactoring**
- ✅ **No new features during refactoring**
- ✅ **Small steps with frequent test runs**
- ✅ **Respect hexagonal architecture boundaries**
- ✅ **Follow Sustainable Code > Clean Code > DDD principles**
- ✅ **All code and comments in English**

## Red Flag - STOP if:

- Tests fail during refactoring (revert and try smaller step)
- You're adding new behavior (that's a feature, not refactoring)
- Violating hexagonal boundaries (check imports)
- You can't explain what improved
