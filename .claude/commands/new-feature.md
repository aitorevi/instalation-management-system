# Implement New Feature (TDD + Documentation)

Implement a new feature following TDD cycle with comprehensive documentation and diagrams.

## Steps:

1. **Understand the feature**:
   - Ask user for detailed feature description
   - Clarify acceptance criteria
   - Check if scenario exists in Example Mapping (Notion)
   - Identify which layer(s) are affected:
     - Domain (entities, value objects, domain services) in `src/back-end/*/domain/`
     - Application (use cases, ports/repositories) in `src/back-end/*/application/`
     - Infrastructure (adapters, repository implementations) in `src/back-end/*/infrastructure/`
     - Frontend (React components) in `src/front-end/`
     - API routes in `src/app/api/`

2. **Design the solution**:
   - Sketch the architecture changes needed
   - Identify new classes/interfaces required
   - Consider hexagonal architecture boundaries (enforced by ESLint)
   - Apply DDD principles and ubiquitous language
   - Plan adapter strategy (memory/mongodb/notion/etc.)

3. **Create documentation FIRST**:
   - Create/update documentation in `docs/` folder
   - Include:
     - Feature description and rationale
     - Architecture diagram (Mermaid - hexagonal layers)
     - Sequence diagram (Mermaid - flow between components)
     - Class diagram if needed (Mermaid - new domain entities)
   - Example structure:

     ````markdown
     # Feature: [Name]

     ## Overview

     [Description]

     ## Architecture Impact

     ```mermaid
     graph TB
         subgraph Infrastructure
             A[Controller] --> B[Use Case]
         end
         subgraph Application
             B --> C[Domain Service]
         end
         subgraph Domain
             C --> D[Entity]
         end
     ```
     ````

     ## Flow Diagram

     ```mermaid
     sequenceDiagram
         participant Client
         participant Controller
         participant UseCase
         participant DomainService
         participant Repository

         Client->>Controller: Request
         Controller->>UseCase: Execute
         UseCase->>DomainService: Process
         DomainService->>Repository: Save
     ```

     ## Implementation Details
     - Key classes
     - Design decisions
     - Edge cases handled

     ```

     ```

4. **RED Phase - Write failing test first**:
   - Start with E2E test if it's a complete user flow: `npm run test:e2e:debug`
   - Or start with unit/integration test for backend logic
   - Write test using Given-When-Then structure with `describe()`/`it()` blocks
   - Use descriptive test names (snake_case or clear English)
   - Use Builder or Mother patterns for test data
   - Run test to see it fail: `npm test` (or `npm run test:watch`)
   - Verify it fails for the RIGHT reason

5. **GREEN Phase - Minimal implementation**:
   - Write just enough code to make test pass
   - Follow Sustainable Code principles:
     - Clear, human-friendly names
     - Small, focused functions
     - Single responsibility
     - Explicit over implicit
   - Keep hexagonal architecture boundaries clear (ESLint will help)
   - For repositories, implement memory adapter first, then real adapters
   - Run test to see it pass: `npm test`

6. **REFACTOR Phase**:
   - Improve code quality while keeping tests green
   - Extract methods/classes if needed
   - Apply DDD patterns where appropriate
   - Ensure code is readable and maintainable
   - Run tests after each refactor: `npm test`
   - Check linting: `npm run lint`

7. **Repeat TDD cycle** for each small increment:
   - Break feature into small testable pieces
   - One test at a time
   - Red → Green → Refactor for each piece

8. **Add unit tests** for edge cases:
   - Test happy path
   - Test error scenarios
   - Test boundary conditions
   - Test validation rules

9. **Verify architecture compliance**:
   - Run linter to check hexagonal architecture: `npm run lint`
   - ESLint will enforce:
     - Domain doesn't import from Infrastructure or Application
     - Application doesn't import from Infrastructure
     - Infrastructure can import from Application and Domain
   - Manually verify import statements use correct aliases (`@/`, `@backend/`)

10. **Add E2E tests** for complete user scenarios:
    - Create/update Playwright tests in `e2e/` directory
    - Test real user workflows end-to-end
    - Run: `npm run test:e2e` or `npm run test:e2e:debug`
    - E2E tests are MANDATORY per project requirements

11. **Update main README.md** if needed:
    - Link to new documentation in `docs/` folder
    - Update feature list if significant

12. **Generate commit message**:
    - Format: `✨ Add [feature name]`
    - Description should include:
      - What was added
      - Why it was needed
      - Key implementation details
      - Link to documentation
    - Use `/git-commit` command for proper format

## Example Flow:

```
User: "Add support for vacation tracking in absences"

1. Check Example Mapping scenario exists in Notion
2. Create docs/VACATION_TRACKING.md with:
   - Architecture diagram showing Vacation entity in domain layer
   - Sequence diagram of vacation request flow
   - Class diagram of Absence, Vacation, Employee relationships

3. Write failing E2E test in e2e/:
   test('employee should be able to request vacation', async ({ page }) => {
     // Given an employee is logged in
     // When they request vacation dates
     // Then vacation should be recorded
   })

4. Write failing unit test for domain logic
5. Implement Vacation entity (src/back-end/absences/domain/)
6. Create repository interface (src/back-end/absences/application/)
7. Implement memory adapter (src/back-end/absences/infrastructure/)
8. Create API route (src/app/api/absences/)
9. Create React component (src/front-end/employee-absences/)
10. Refactor and add edge case tests
11. Run: npm run lint (verify architecture)
12. Run: npm test (verify unit tests)
13. Run: npm run test:e2e (verify E2E tests)
14. Commit: ✨ Add vacation tracking feature
```

## Principles to Follow:

- **TDD is mandatory** - No implementation without tests first
- **Hexagonal Architecture** - Respect layer boundaries
- **Sustainable Code** - Human-friendly, clear, maintainable
- **DDD** - Use ubiquitous language, domain-driven design
- **English** - All code, tests, comments, documentation
- **Documentation with diagrams** - Make it visual and clear
