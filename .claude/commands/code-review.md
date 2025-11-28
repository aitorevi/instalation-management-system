# Code Review

Review code changes for quality, architecture compliance, and adherence to project principles.

## Steps:

1. **Identify what to review**:
   - Ask user what to review, or
   - Review recent changes: `git diff HEAD~1`
   - Review uncommitted changes: `git diff`
   - Review specific file if provided

2. **Read the code changes**:
   - Read modified files completely
   - Read related test files
   - Understand the context and intent

3. **Check Architecture Compliance** (Hexagonal Architecture):
   - ✅ **Domain Layer** (`domain/`):
     - Contains only business logic
     - No dependencies on Infrastructure or Application
     - Uses ubiquitous language
     - Entities, Value Objects, Domain Services
     - Check: No imports from `infrastructure` or `application` packages
   - ✅ **Application Layer** (`application/`):
     - Orchestrates domain logic
     - Defines ports (interfaces)
     - Use cases are focused and single-purpose
     - Check: No imports from `infrastructure` package
   - ✅ **Infrastructure Layer** (`infrastructure/`):
     - Implements ports (adapters)
     - Controllers, Repositories, External Services
     - Depends on Application/Domain (inward)
     - Check: Can import from `application` and `domain`
   - Manually verify import statements in changed files

4. **Check Code Quality** (Sustainable Code > Clean Code > DDD):

   **Sustainable Code Principles** (Carlos Blé):
   - ✅ Human-friendly: Clear names, easy to understand
   - ✅ Small functions: One thing well (prefer <15 lines)
   - ✅ Explicit over implicit: Intent is obvious
   - ✅ Functional style for mappings when clearer
   - ✅ No premature optimization
   - ✅ Code is for humans, not machines

   **Clean Code** (Robert C. Martin):
   - ✅ Meaningful names (intention-revealing)
   - ✅ Functions do one thing (Single Responsibility)
   - ✅ No side effects
   - ✅ DRY (Don't Repeat Yourself)
   - ✅ Error handling is clear

   **DDD** (Domain-Driven Design):
   - ✅ Ubiquitous language in code
   - ✅ Value Objects over primitives
   - ✅ Aggregates protect invariants
   - ✅ Domain Services for complex operations
   - ✅ Repository pattern for persistence

5. **Check Test Quality**:
   - ✅ Tests exist for new/changed code
   - ✅ Tests follow Given-When-Then structure with `describe()`/`it()` blocks
   - ✅ Test names are clear and descriptive (English)
   - ✅ Tests are isolated and repeatable
   - ✅ Use Builder or Mother patterns for test data
   - ✅ Prefer test doubles over mocks when clearer
   - ✅ Tests are readable (tell a story)
   - ✅ E2E tests exist for user scenarios (MANDATORY)
   - Run: `npm test` to verify unit tests pass
   - Run: `npm run test:e2e` to verify E2E tests pass
   - Check coverage: `npm run test:coverage`

6. **Check Language & Documentation**:
   - ✅ All code in English (classes, methods, variables, comments)
   - ✅ All tests in English
   - ✅ All documentation in English
   - ✅ Comments explain WHY, not WHAT (code should be self-explanatory)
   - ✅ Documentation updated if needed (`docs/` folder)
   - ✅ New concepts documented in `docs/SELF.md` if applicable

7. **Check for Code Smells**:
   - 🔴 Long methods (>15-20 lines)
   - 🔴 God classes (too many responsibilities)
   - 🔴 Primitive obsession (missing Value Objects)
   - 🔴 Feature envy (method using another class's data)
   - 🔴 Duplicated code
   - 🔴 Magic numbers/strings (use named constants)
   - 🔴 Deep nesting (>3 levels)
   - 🔴 Too many parameters (>3)
   - 🔴 Comments explaining bad code (refactor instead)

8. **Check Commit Quality** (if reviewing for commit):
   - ✅ GitMoji prefix appropriate for change type
   - ✅ Commit message in English
   - ✅ Title is clear and concise
   - ✅ Description explains what, why, and how

9. **Provide Feedback**:
   - **Positives**: What's good (celebrate good practices)
   - **Issues**: What violates principles (must fix)
   - **Suggestions**: What could be better (optional improvements)
   - **Questions**: What's unclear (seek clarification)

   Format feedback by category:

   ```markdown
   ## ✅ Strengths

   - Clear naming in OrderService
   - Good test coverage with Given-When-Then

   ## 🔴 Issues (Must Fix)

   - EmailService in Domain layer depends on Infrastructure (Gmail API)
   - Missing test for edge case: invalid email format

   ## 💡 Suggestions (Consider)

   - Extract email validation to Value Object: Email
   - Consider using Builder pattern for complex Order creation in tests

   ## ❓ Questions

   - Why is deduplication logic in Controller instead of Use Case?
   ```

10. **Suggest Improvements**:
    - Provide specific refactoring suggestions
    - Show code examples when helpful
    - Reference Sustainable Code / Clean Code / DDD principles
    - Prioritize: Critical issues → Important suggestions → Nice-to-haves

11. **Verify Tests Pass**:
    - Ensure: `npm test` passes
    - Ensure: `npm run test:e2e` passes for user scenarios
    - Run: `npm run lint` to verify architecture compliance
    - Check test coverage if critical area changed: `npm run test:coverage`

## Review Checklist:

### Architecture ✅

- [ ] Hexagonal architecture boundaries respected
- [ ] Dependencies point inward (Infrastructure → Application → Domain)
- [ ] No domain logic in Infrastructure layer
- [ ] Import statements follow architecture rules

### Code Quality ✅

- [ ] Human-friendly and readable (Sustainable Code)
- [ ] Clear, intention-revealing names
- [ ] Small, focused functions
- [ ] Explicit over implicit
- [ ] No code smells
- [ ] Follows DDD patterns where appropriate

### Testing ✅

- [ ] Tests exist and pass
- [ ] Tests are clear and maintainable
- [ ] Given-When-Then structure
- [ ] Good coverage of edge cases
- [ ] Tests are isolated

### Language ✅

- [ ] All code in English
- [ ] All tests in English
- [ ] Documentation updated if needed

### Commit ✅

- [ ] Appropriate GitMoji prefix
- [ ] Clear message in English
- [ ] Describes what and why

## Principles Priority:

1. **Sustainable Code** (Carlos Blé) - Human-friendly, maintainable
2. **Clean Code** (Robert C. Martin) - Professional, quality
3. **DDD** (Eric Evans) - Domain-driven, ubiquitous language

## Remember:

- Be constructive and specific
- Celebrate good practices
- Explain WHY something should change
- Provide examples when suggesting improvements
- Focus on principles, not personal preferences
