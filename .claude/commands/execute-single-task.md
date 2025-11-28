# Single Task Executor

You execute a single, well-defined development task in an isolated worktree environment.

## Available Agents

- **senior-backend-architect**: For backend architecture decisions
- **senior-backend-dev**: For backend implementation
- **senior-frontend-architect**: For frontend architecture decisions
- **senior-frontend-dev**: For frontend implementation
- **senior-code-reviewer**: For code quality review

## Task to Execute

$ARGUMENTS

## Execution Workflow

### 1. Task Analysis

- Parse the provided task description and requirements
- Understand acceptance criteria and scope
- Identify if this is a backend, frontend, or full-stack task
- Determine if the task is too complex and needs to be split

### 2. Complexity Assessment

**If the task is too complex for a single developer (>4 hours estimated):**

- Break it down into independent subtasks
- Create subtask worktrees using pattern: `{parent_num}-{subtask_num}-{subtask_name}`
- Each subtask gets its own worktree and task.sh script
- Exit after creating subtasks (let them execute independently)

**Subtask Creation Process:**

```bash
# For each subtask, create worktree from current location
git worktree add ../{parent_num}-{subtask_num}-{subtask_name} -b {parent_num}-{subtask_num}-{subtask_name}

# Create task.sh in each subtask worktree
cat > ../{parent_num}-{subtask_num}-{subtask_name}/task.sh << 'EOF'
#!/bin/bash
claude "@.agents/commands/execute-single-task.md" "{SUBTASK_DESCRIPTION}"
EOF

chmod +x ../{parent_num}-{subtask_num}-{subtask_name}/task.sh
```

### 3. Implementation (if task is manageable size)

**Step 1: Architecture Planning**

- Call appropriate architect(s) based on task type:
  - Backend tasks: Call `senior-backend-architect`
  - Frontend tasks: Call `senior-frontend-architect`
  - Full-stack tasks: Call both architects in parallel

**Step 2: Development**

- Call appropriate developer(s):
  - Backend implementation: `senior-backend-dev`
  - Frontend implementation: `senior-frontend-dev`
  - Follow the architectural plan precisely

**Step 3: Testing**

- Implement all required tests (unit, integration, e2e as needed)
- Ensure all tests pass before proceeding
- Tests are MANDATORY, not optional

**Step 4: Code Review**

- Call `senior-code-reviewer` for final quality check
- Address any issues found
- Repeat until code review passes

### 4. Task Completion

**Success Criteria:**

- All acceptance criteria met
- Code follows project conventions
- All tests implemented and passing
- No TypeScript `any` types
- No TODO comments in production code
- Code is self-documenting
- Architecture review passed
- Code quality review passed

**Output Summary:**
Provide a brief summary of:

- What was implemented
- Files created/modified
- Tests added
- Any important notes for integration

### 5. Next Task Generation (if applicable)

**If this task creates dependencies for other tasks:**

- Create a new worktree for the dependent task
- Generate appropriate task.sh script
- Document the dependency relationship

**Next Task Creation:**

```bash
# Create worktree for dependent task
git worktree add ../{next_num}-{next_task_name} -b {next_num}-{next_task_name}

# Create task.sh
cat > ../{next_num}-{next_task_name}/task.sh << 'EOF'
#!/bin/bash
claude "@.agents/commands/execute-single-task.md" "{DEPENDENT_TASK_DESCRIPTION}"
EOF

chmod +x ../{next_num}-{next_task_name}/task.sh
```

## Important Guidelines

### Task Splitting Criteria

Split a task if it:

- Requires more than 4 hours of work
- Touches multiple unrelated components
- Has multiple distinct deliverables
- Can be naturally divided into independent parts

### Keep Tasks Together If:

- They modify the same files extensively
- One directly depends on the other's output
- They form a cohesive feature that should be tested together
- Splitting would create artificial coupling

### Worktree Management

- Work only in the current worktree directory
- Don't modify files outside the worktree scope
- Each worktree should be completely independent
- Test everything within the worktree context

### Quality Standards

- All code must pass existing project lints/typechecks
- Follow established project patterns and conventions
- Write self-documenting code without excessive comments
- Ensure comprehensive test coverage
- No temporary or placeholder implementations

## Error Handling

- If tests fail: Fix them before completing the task
- If linting fails: Fix all issues before completing
- If blocked by missing dependencies: Document the blocker and pause
- If task scope is unclear: Ask for clarification rather than assuming

This executor ensures each task is completed to production quality standards while maintaining the independence required for parallel execution.
