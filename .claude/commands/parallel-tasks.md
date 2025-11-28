# Agent Task Parallelizer

You coordinate a team of specialized agents to analyze and break down complex development tasks into parallelizable worktrees.

## Available Agents

- **senior-backend-architect**: Designs backend architecture and creates technical plans
- **senior-frontend-architect**: Designs frontend architecture and creates technical plans

## Task to Complete

$ARGUMENTS

## Execution Workflow

### 1. Requirements Analysis

**MANDATORY**: Before starting task breakdown, you MUST analyze the task to understand the requirements.

**Provide a feature summary and ask for user preferences:**

- Present a clear summary of what feature will be implemented
- Explain the main components and functionality
- Ask the user if they want anything implemented in a specific way
- Wait for user confirmation before proceeding to architects

After getting answers:

- Understand the scope, constraints, and acceptance criteria
- Identify if the task requires backend, frontend, or full-stack work
- Create a clear requirements summary before moving to next phase

### 2. Architecture Analysis (Parallel)

Call both architects simultaneously to analyze the task:

- **Backend Architect**: Analyze backend requirements and break down into independent **use case-based tasks**. Each task should represent a complete vertical slice including domain, application, infrastructure layers, tests, and HTTP endpoints if needed.
- **Frontend Architect**: Analyze frontend requirements and break down into independent tasks

**MANDATORY OUTPUT**: Each architect MUST create a task breakdown file in `workflow/`:

- `backend-tasks.md` - List of independent backend tasks that can be parallelized
- `frontend-tasks.md` - List of independent frontend tasks that can be parallelized

**Requirements for task breakdown files:**

**General Requirements:**

- Each task must be completely independent (no dependencies between tasks)
- Tasks should be achievable in 1-4 hours by a single developer
- Include clear acceptance criteria for each task
- Specify which files/components will be created or modified
- If a task has dependencies, merge it with dependent tasks into a single worktree
- Tasks must include comprehensive testing requirements
- Each task should result in working, testable code

**Backend-Specific Requirements:**

- **Use Case Grouping**: Backend tasks MUST be organized by complete use cases, not by architectural layers
- **Vertical Slices**: Each backend worktree should contain a full vertical slice:
  - Domain entities, value objects, and errors (e.g., `User.ts`, `UserId.ts`, `UserNotFoundError.ts`)
  - Repository interface in domain (e.g., `UserRepository.ts`)
  - Application services (e.g., `UserSearcher.ts`, `UserFinder.ts`)
  - Infrastructure implementation (e.g., `PostgresUserRepository.ts`)
  - All related unit and integration tests
  - HTTP endpoints if needed (e.g., `/api/users/[id]/route.ts`)
- **Complete Functionality**: Each worktree should implement a complete business capability
- **Example Groupings**:
  - "User Search" worktree: UserSearcher + User + UserRepository + PostgresUserRepository + tests + search endpoint
  - "Course Rating" worktree: CourseRater + Rating + RatingRepository + PostgresRatingRepository + tests + rating endpoint

### 3. Task Organization and Worktree Creation

**Task Numbering and Naming:**

- Tasks are numbered sequentially: 1, 2, 3, etc.
- Branch names follow pattern: `{num}-{task_name}`
- Subtasks follow pattern: `{parent_num}-{subtask_num}-{subtask_name}`

**Worktree Creation Process:**
For each independent task:

1. **Create Git Worktree:**

   ```bash
   git worktree add ../{num}-{task_name} -b {num}-{task_name}
   ```

2. **Generate task.sh Script:**
   Create a `task.sh` file in each worktree directory with:

   ```bash
   #!/bin/bash
   claude "@.agents/commands/execute-single-task.md" "{DETAILED_TASK_DESCRIPTION}"
   ```

3. **Task Dependencies:**
   - If tasks are independent: Create separate worktrees
   - If tasks have dependencies: Merge into single worktree with sequential execution
   - If a task needs to be split further: Allow the execute-single-task agent to create subtask worktrees

**Task.sh Content Structure:**

**For Backend Use Cases:**

```bash
#!/bin/bash
# Task: Implement User Search Use Case
# Description: Complete implementation of user search functionality including domain, application, infrastructure, and HTTP layers
# Acceptance Criteria:
# - User entity and UserId value object implemented
# - UserRepository interface in domain
# - UserSearcher application service implemented
# - PostgresUserRepository infrastructure implementation
# - Unit tests for all components
# - Integration tests for repository
# - HTTP endpoint at /api/users/search implemented
# Files to create:
# - src/contexts/mooc/users/domain/User.ts
# - src/contexts/mooc/users/domain/UserId.ts
# - src/contexts/mooc/users/domain/UserRepository.ts
# - src/contexts/mooc/users/application/search/UserSearcher.ts
# - src/contexts/mooc/users/infrastructure/PostgresUserRepository.ts
# - src/app/api/users/search/route.ts
# - tests/contexts/mooc/users/domain/UserMother.ts
# - tests/contexts/mooc/users/application/search/UserSearcher.test.ts
# - tests/contexts/mooc/users/infrastructure/PostgresUserRepository.test.ts

claude "@.agents/commands/execute-single-task.md" "
Task: Implement User Search Use Case

Description:
Implement complete user search functionality following DDD architecture with vertical slice approach. This includes all layers from domain to infrastructure, comprehensive testing, and HTTP endpoint.

Acceptance Criteria:
- User domain entity with proper value objects and business rules
- UserRepository interface defined in domain layer
- UserSearcher application service with search logic
- PostgresUserRepository implementing the repository interface
- Unit tests for domain and application layers
- Integration tests for infrastructure layer
- HTTP endpoint for user search with proper error handling

Files to work with:
- Domain: User.ts, UserId.ts, UserRepository.ts
- Application: UserSearcher.ts
- Infrastructure: PostgresUserRepository.ts
- HTTP: /api/users/search/route.ts
- Tests: UserMother.ts, UserSearcher.test.ts, PostgresUserRepository.test.ts

Testing Requirements:
- Unit tests for User entity business logic
- Unit tests for UserSearcher service
- Integration tests for PostgresUserRepository
- HTTP endpoint tests with Playwright

Additional Context:
Follow existing patterns in src/contexts/mooc/courses for consistency. Use the same error handling patterns and repository interface structure.
"
```

**For Frontend Components:**

```bash
#!/bin/bash
# Task: {TASK_NAME}
# Description: {DETAILED_DESCRIPTION}
# Acceptance Criteria:
# - {CRITERIA_1}
# - {CRITERIA_2}
# Files to modify/create: {FILE_LIST}
# Tests required: {TEST_REQUIREMENTS}

claude "@.agents/commands/execute-single-task.md" "
Task: {TASK_NAME}

Description:
{DETAILED_TASK_DESCRIPTION}

Acceptance Criteria:
- {CRITERIA_1}
- {CRITERIA_2}

Files to work with:
- {FILE_LIST}

Testing Requirements:
- {TEST_REQUIREMENTS}

Additional Context:
{ANY_ADDITIONAL_CONTEXT}
"
```

### 4. Output Summary

After creating all worktrees, provide:

1. **Task Summary:**
   - List of all created worktrees
   - Brief description of each task
   - Estimated execution order (if any dependencies exist)

2. **Execution Instructions:**

   ```bash
   # To execute all tasks in parallel:
   cd ../1-task-name && ./task.sh &
   cd ../2-task-name && ./task.sh &
   # ... etc

   # Wait for all to complete:
   wait
   ```

3. **Integration Notes:**
   - How to merge completed worktrees back to main
   - Any manual integration steps required
   - Testing strategy for combined features

## Success Criteria

- All tasks are completely independent and parallelizable
- Each worktree has a properly configured task.sh script
- Task descriptions are clear and actionable
- All testing requirements are specified
- No circular dependencies between tasks
- Each task can be executed in isolation
- Clear instructions for parallel execution provided

## Important Notes

- **No Dependencies**: Tasks must be completely independent
- **Atomic Tasks**: Each task should produce working, testable code
- **Clear Scope**: Each task should have well-defined boundaries
- **Testing**: Every task must include comprehensive test requirements
- **Subtask Support**: If a task is too complex, the execute-single-task agent can create subtask worktrees
- **Sequential Fallback**: If dependencies exist, merge tasks into sequential worktrees
