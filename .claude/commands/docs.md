# Create or Update Documentation

Create comprehensive documentation with diagrams (Mermaid) for processes, features, or architecture.

## Steps:

1. **Understand what needs documentation**:
   - Ask user what to document:
     - New feature
     - Process or workflow
     - Architecture component
     - Troubleshooting guide
     - Setup/configuration
     - Bug fix explanation
     - New library or technical concept (must go in `docs/SELF.md`)
   - Determine the audience (developers, ops, users)

2. **Gather context**:
   - Read related source code
   - Review existing documentation in `docs/`
   - Check README.md for current structure
   - Understand the flow and dependencies
   - Check if Example Mapping scenario exists in Notion

3. **Determine if diagrams are needed**:
   - **Architecture diagrams**: For new components or layers
   - **Sequence diagrams**: For flows between multiple components
   - **Class diagrams**: For domain models or complex relationships
   - **State diagrams**: For lifecycle or state transitions
   - **Flowcharts**: For decision trees or process flows
   - **Entity-Relationship diagrams**: For data models

4. **Create documentation structure**:
   - Choose appropriate location in `docs/` folder
   - Follow existing naming conventions (UPPERCASE.md)
   - For new libraries/concepts, add to `docs/SELF.md`
   - Structure with clear sections:

     ```markdown
     # [Title]

     ## Overview

     Brief description of what this documents

     ## Context / Problem

     Why this exists, what problem it solves

     ## Architecture / Design

     [Mermaid diagram if needed]

     ## Flow / Process

     [Sequence or flow diagram if needed]

     ## Implementation Details

     Key classes, methods, patterns used

     ## Configuration

     How to configure (if applicable)

     ## Examples

     Code examples or usage examples

     ## Testing

     How to test this feature/component

     ## Troubleshooting

     Common issues and solutions

     ## Related Documentation

     Links to related docs
     ```

5. **Create Mermaid diagrams** when needed:

   ### Architecture Diagram (Hexagonal):

   ```mermaid
   graph TB
       subgraph Infrastructure["Infrastructure Layer (src/back-end/*/infrastructure/)"]
           A[API Route Handler]
           B[TimeTracksMongodbRepository]
           C[ProjectsNotionRepository]
       end

       subgraph Application["Application Layer (src/back-end/*/application/)"]
           D[TimeTracksRepository Interface]
           E[ProjectsRepository Interface]
       end

       subgraph Domain["Domain Layer (src/back-end/*/domain/)"]
           F[TimeTrack Entity]
           G[Project Entity]
           H[Business Rules]
       end

       A -->|uses| D
       D -->|defines contract| F
       B -->|implements| D
       C -->|implements| E
       B -->|persists| F
   ```

   ### Sequence Diagram (Flow):

   ```mermaid
   sequenceDiagram
       participant Client
       participant API as API Route
       participant UseCase
       participant Domain as Domain Entity
       participant Repo as Repository
       participant DB as Database

       Client->>API: POST /api/time-tracks
       API->>UseCase: create time track
       UseCase->>Domain: validate business rules
       Domain-->>UseCase: ✅ valid
       UseCase->>Repo: save(timeTrack)
       Repo->>DB: persist
       DB-->>Repo: success
       Repo-->>UseCase: saved
       UseCase-->>API: TimeTrack created
       API-->>Client: 200 OK
   ```

   ### Class Diagram (Domain Model):

   ```mermaid
   classDiagram
       class TimeTrack {
           -string id
           -string employeeId
           -string projectId
           -Date startTime
           -Date endTime
           +isInProgress() boolean
           +duration() number
       }

       class Project {
           -string id
           -string name
           -boolean isActive
       }

       class Employee {
           -string id
           -string email
           -string name
       }

       TimeTrack --> Employee
       TimeTrack --> Project
   ```

   ### State Diagram (Lifecycle):

   ```mermaid
   stateDiagram-v2
       [*] --> Received: Webhook arrives
       Received --> Validating: Start validation
       Validating --> Processing: Valid
       Validating --> Rejected: Invalid HMAC
       Processing --> EmailSending: Order created
       EmailSending --> Completed: Email sent
       EmailSending --> Failed: Email error
       Failed --> Retry: Retry logic
       Retry --> EmailSending: Attempt again
       Retry --> PermanentFailure: Max retries
       Completed --> [*]
       Rejected --> [*]
       PermanentFailure --> [*]
   ```

   ### Flowchart (Decision Flow):

   ```mermaid
   flowchart TD
       Start([Webhook Received]) --> ValidateHMAC{HMAC Valid?}
       ValidateHMAC -->|No| Reject[Return 401]
       ValidateHMAC -->|Yes| CheckDuplicate{Duplicate?}
       CheckDuplicate -->|Yes| Ignore[Return 200 - Already Processed]
       CheckDuplicate -->|No| ProcessOrder[Process Order]
       ProcessOrder --> CreateZip[Create ZIP with books]
       CreateZip --> CheckSize{File > 20MB?}
       CheckSize -->|Yes| Error[Return Error - File too large]
       CheckSize -->|No| SendEmail[Send Email via Gmail]
       SendEmail --> Success[Return 200 OK]

       Reject --> End([End])
       Ignore --> End
       Error --> End
       Success --> End
   ```

6. **Write clear, concise content**:
   - Use active voice
   - Be specific and precise
   - Include code examples where helpful
   - Use bullet points for lists
   - Use tables for comparisons or configuration
   - Add warnings/notes with proper formatting:

     ```markdown
     ⚠️ **WARNING**: This requires 1GB of RAM minimum

     💡 **TIP**: Use swap for servers with <2GB RAM

     ✅ **BEST PRACTICE**: Always run tests before deployment
     ```

7. **Add code examples** when relevant:

   ````markdown
   ## Example Usage

   ```typescript
   // Create a time track
   const timeTrack: NewTimeTrack = {
     employeeId: employee.id,
     projectId: project.id,
     startTime: new Date()
   };
   await timeTracksRepository.create(timeTrack);
   ```
   ````

   ## Example Configuration

   ```bash
   # .env.local
   TIME_TRACKS_ADAPTER_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/leantrack
   ```

   ```

   ```

8. **Link documentation appropriately**:
   - If major feature, add link to main README.md
   - Cross-reference related docs
   - Link to external resources if needed

9. **Update README.md** if necessary:
   - Add new documentation to relevant section
   - Update table of contents if exists
   - Keep links organized by category

10. **Review and validate**:
    - Check Mermaid diagrams render correctly
    - Verify all links work
    - Ensure formatting is consistent
    - Read through as if you don't know the topic

11. **Suggest commit message**:
    - Format: `📝 Add documentation for [topic]` or `📝 Update [topic] documentation`
    - Include what was documented and why

## Documentation Categories:

### Features

- What it does
- Why it exists
- Architecture diagram (hexagonal layers)
- Sequence diagram (flow)
- Class diagram (domain model)
- Configuration
- Examples

### Processes/Workflows

- Flowchart diagram
- Step-by-step instructions
- Decision points
- Error handling

### Architecture

- Component diagram
- Layer diagram (hexagonal)
- Dependency graph
- Design patterns used

### Troubleshooting

- Symptom → Cause → Solution format
- Diagnostic commands
- Common errors
- How to investigate

### Setup/Configuration

- Prerequisites
- Step-by-step guide
- Configuration options table
- Examples
- Verification steps

## Mermaid Best Practices:

- ✅ Keep diagrams focused (one concept per diagram)
- ✅ Use clear, descriptive labels
- ✅ Show only relevant details (hide complexity)
- ✅ Use color/styling sparingly for emphasis
- ✅ Add legend if diagram is complex
- ✅ Test that diagram renders in GitHub/Markdown viewer

## Remember:

- Documentation is for humans (be clear and helpful)
- Diagrams should simplify, not complicate
- Examples are more valuable than long explanations
- Update docs when code changes
- Link related documentation
- Use English for all documentation
