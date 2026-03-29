# Mini AI-HRMS - Execution-Driven Build Plan

This is a phase-by-phase implementation plan aligned with production delivery.

## PHASE 1: System Architecture Planning

### Target Folder Structure

```text
app/
  api/
    auth/
    organizations/
    employees/
    tasks/
    ai/
    ai/
components/
  auth/
  dashboard/
  employees/
  tasks/
  ai/
  ai/
lib/
  types.ts
  store.ts
  mock-data.ts
architecture/
  ARCHITECTURE_FIRST.md
  EXECUTION_PHASE_PLAN.md
visual-edits/
  VisualEditsMessenger.tsx
  index.ts
```

### API Structure

- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/refresh`
- Employee CRUD:
  - `GET /api/v1/employees`
  - `POST /api/v1/employees`
  - `GET /api/v1/employees/:id`
  - `PATCH /api/v1/employees/:id`
  - `DELETE /api/v1/employees/:id`
- Tasks:
  - `GET /api/v1/tasks`
  - `POST /api/v1/tasks`
  - `PATCH /api/v1/tasks/:id`
  - `PATCH /api/v1/tasks/:id/complete`
- Dashboard:
  - `GET /api/v1/dashboard/metrics`
- AI:
  - `POST /api/v1/ai/score/:employeeId`
  - `POST /api/v1/ai/skill-gap/:employeeId`
  - `POST /api/v1/ai/suggest-assignment`
- Web3:
  - `POST /api/v1/ai/suggest-assignment`

### Layered Design

- Controller layer -> service layer -> repository/data layer.
- Keep HTTP, business rules, and persistence concerns separated.

## PHASE 2: Database Schema Design

### Tables

- `organizations(id, name, slug, created_at, updated_at)`
- `users(id, auth_user_id, org_id, email, role_id, created_at)`
- `roles(id, org_id, name)`
- `employees(id, org_id, user_id, full_name, department, is_active, created_at, updated_at)`
- `skills(id, org_id, name, category)`
- `employee_skills(employee_id, skill_id, proficiency)`
- `tasks(id, org_id, title, description, assigned_to, status, priority, deadline, completed_at, created_at, updated_at)`
- `task_history(id, task_id, from_status, to_status, changed_by, changed_at)`
- `performance_metrics(id, org_id, employee_id, score, trend, computed_at)`
- `performance_metrics(id, org_id, employee_id, score, trend, computed_at)`

### Key Constraints

- PK: UUID on primary entities.
- FK:
  - org-scoped references on all tenant data.
  - task-to-employee, metrics-to-employee, logs-to-task.
- Unique:
  - `organizations.slug`
  - `organizations.slug`

### Indexes

- `employees(org_id)`
- `tasks(org_id, status)`
- `tasks(org_id, assigned_to, status)`
- `performance_metrics(employee_id, computed_at desc)`
- `task_history(task_id, changed_at desc)`

## PHASE 3: Backend API Design

### Middleware Pipeline

1. request ID
2. security headers
3. CORS
4. rate limit
5. auth + claim extraction
6. org scoping
7. role guard
8. schema validation
9. controller execution
10. error normalization

### Validation

- Use Zod per endpoint for input contracts.
- Reject unknown fields on sensitive endpoints.

## PHASE 4: AI Workforce Intelligence

### Productivity Scoring Logic

- Inputs:
  - completed tasks, overdue tasks, average completion time, complexity distribution, collaboration activity.
- Output:
  - `score`, `trend`, `top_strength`, `top_risk`, `summary`.

### Skill Gap Logic

- Compare role-required skills with employee skill matrix.
- Use proficiency threshold to detect upskill candidates.
- Ask Gemini to prioritize and recommend a learning path.

### Smart Assignment Logic

- Rule-based pre-filtering (availability + skills + priority).
- Gemini final ranking with confidence.
- Manual override + audit trail.

### Prompt Template Rules

- Always pass normalized JSON context.
- Force strict JSON response schema.
- Add fallback default behavior on parse failure.


## PHASE 6: Frontend Architecture

### Pages

- Auth page
- Dashboard page
- Employees page
- Tasks page
- AI insights page
- AI insights page

### Components

- Keep each page as composition root with reusable cards/tables/modals.
- Store global auth/session in Zustand.
- Use server calls for source of truth; client state for UI interactions.

### Dashboard Rendering

- Metrics cards:
  - total employees, active employees, assigned tasks, completed tasks, productivity average.
- Time-series and status distributions for quick insight.

## PHASE 7: Deployment Architecture

### Hosting

- Frontend: Vercel
- API: Render/Railway/AWS ECS
- DB/Auth: Supabase
- Cache/Queue: Redis

### Environment Variables

- `NEXT_PUBLIC_API_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (if custom tokens used)
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_API_URL`

### CI/CD

- PR pipeline:
  - typecheck, lint, test, build.
- Main deploy:
  - web deploy + api deploy + migrations.

### Scaling

- Scale stateless app/API replicas horizontally.
- Push heavy AI jobs to background workers.
- Add read replicas and partitioning for growth.

