# Mini AI-HRMS - Architecture Blueprint

This document defines the production-first architecture for a Mini AI-HRMS platform with AI and Web3 integration.

## Stack

- Frontend: Next.js + Tailwind CSS
- Backend: Node.js + Express
- Database/Auth: Supabase (PostgreSQL + JWT)
- AI: Gemini API
- Blockchain: Ethereum
- Wallet: MetaMask
- Smart Contract: Solidity (recommended)

## PART 1: High-Level Architecture

### 1) System Components

**Presentation Layer (Next.js)**
- App Router pages and client components for auth, dashboard, employees, tasks, AI, and Web3.
- Tailwind UI layer with role-aware navigation and organization-scoped data views.
- API consumption via fetch/React Query against backend endpoints.

**BFF/API Layer (Next.js API Routes, optional)**
- Thin backend-for-frontend for token forwarding, response shaping, and edge caching.
- Can proxy to Express for centralized policy enforcement.

**Core API Layer (Express)**
- REST controllers for auth, organizations, employees, tasks, dashboards, AI, and Web3.
- Middleware chain: auth, org scope, RBAC, validation, rate limit, audit logging.

**Domain Services**
- `AuthService`, `OrganizationService`, `EmployeeService`, `TaskService`, `AIService`, `Web3Service`.
- All business rules in services, not in route handlers.

**Data Layer**
- Supabase PostgreSQL for relational data and strong consistency.
- Supabase Auth for JWT issuance and identity.
- Realtime channels for task/employee updates (optional).

**AI Layer**
- Gemini prompt orchestration for productivity scoring, skill-gap analysis, and assignment recommendations.
- Response schema validation and TTL-based caching.

### 2) Interaction Flow (End-to-End)

1. User performs action in Next.js UI (create employee/task, update status, request AI recommendation).
2. Request reaches Express API (direct or through BFF).
3. JWT verified and tenant (`org_id`) extracted.
4. Route validation and RBAC checks pass.
5. Service executes domain logic and queries Supabase.
6. Optional side effects:
   - AI inference via Gemini.
   - On-chain logging via Web3 service.
7. Typed JSON response returned to frontend.
8. Frontend updates local state and dashboard metrics.

### 3) Request Lifecycle

1. **Ingress**: HTTPS request enters API.
2. **Security**: JWT + role + org scope checks.
3. **Validation**: Zod schema validation on input.
4. **Execution**: Domain service transaction.
5. **Persistence**: PostgreSQL write/read with org filtering.
6. **Async side effects**: AI/web3 can run in queue/background when needed.
7. **Observability**: Structured logs + metrics + trace IDs.
8. **Response**: Standardized status/error contract.

### 4) Separation of Concerns

- Frontend handles rendering and UX only.
- Express controllers handle protocol responsibilities.
- Services handle business rules and orchestration.
- Repositories/data access layer encapsulates queries.
- AI and Web3 adapters isolate external integrations.

## PART 2: Microservice Layer Breakdown

### API Layer

- Endpoints:
  - `/api/v1/auth/*`
  - `/api/v1/organizations/*`
  - `/api/v1/employees/*`
  - `/api/v1/tasks/*`
  - `/api/v1/dashboard/*`
  - `/api/v1/ai/*`
  - `/api/v1/web3/*`
- Middleware:
  - `helmet`, `cors`, `requestId`, `rateLimit`, `auth`, `orgScope`, `requireRole`, `validate`, `errorHandler`.

### AI Service Layer

- Responsibilities:
  - Build role-aware prompts from normalized employee/task context.
  - Validate Gemini JSON output against schemas.
  - Cache deterministic responses (score/report) with TTL.
  - Expose pure service methods to API layer.

### Web3 Service Layer

- Responsibilities:
  - Generate and verify sign-in challenge messages.
  - Connect provider/signer/contract safely.
  - Log task completion events and persist tx hash to DB.
  - Retry and dead-letter failed transactions.

### Auth Layer

- Supabase Auth manages users and tokens.
- JWT claims include `org_id` and app-level role.
- Backend enforces RBAC and tenant isolation per request.

## PART 3: Database Design

### Core Tables

- `organizations`
- `users` (Supabase auth reference metadata)
- `employees`
- `roles`
- `skills`
- `employee_skills`
- `tasks`
- `task_history`
- `performance_metrics`
- `blockchain_logs`

### Relationship Model

- One organization has many employees, roles, tasks.
- Employees have many skills via `employee_skills`.
- Tasks belong to organization and are assigned to employees.
- Task status transitions are tracked in `task_history`.
- AI scores and trends stored in `performance_metrics`.
- On-chain tx references stored in `blockchain_logs`.

### Indexing Strategy

- Tenant/organization indexes on all org-scoped tables.
- Composite indexes for dashboard and task filters:
  - `(org_id, status)`, `(org_id, assigned_to)`, `(org_id, department_id)`.
- Time-series indexes on metrics and history tables by `created_at`.

### Scalability Notes

- Partition `task_history` and `performance_metrics` by month.
- Use read replicas for dashboard/report-heavy workloads.
- Prefer append-only event tables for analytics and audit.

## PART 4: AI Architecture

### Productivity Score

Weighted model:
- Completion rate: 30%
- On-time rate: 25%
- Skill-task match: 20%
- Complexity handled: 15%
- Collaboration signal: 10%

Output:
- score (0-100), trend, strengths, risks, short narrative.

### Skill Gap Detection

1. Gather role-required skills and org strategic skills.
2. Compare with employee skill profile and proficiency.
3. Detect missing/low proficiency skills.
4. Ask Gemini to prioritize gaps and recommend a plan.

### Smart Task Assignment

1. SQL pre-filter candidates (active + capacity + skill overlap).
2. Send top candidates + task context to Gemini.
3. Persist recommendation and confidence score.
4. Keep manual override path for managers.

### Gemini Integration

- Guardrails:
  - deterministic temperature, strict JSON schema, fallback logic.
- Reliability:
  - timeout, retry, idempotency key, cached responses.

## PART 5: Web3 Architecture

### Wallet Authentication

1. Client connects MetaMask.
2. Backend issues nonce challenge.
3. Client signs challenge.
4. Backend verifies signature and maps wallet to employee identity.
5. JWT session is established.

### Smart Contract (Solidity)

Recommended event:
- `TaskCompleted(taskIdHash, employeeAddress, orgAddress, completedAt, metadataHash)`

### Event Logging Flow

- Task marked complete in API.
- API enqueues/logs on-chain event.
- Tx hash + chain metadata stored in `blockchain_logs`.
- UI displays proof link and tx status.

### Gas Optimization

- Use events over storage when possible.
- Use `bytes32` hashes instead of long strings.
- Batch event writes for high volume.
- Consider L2 (Polygon/Base) for production costs.

## PART 6: Security Architecture

### JWT Flow

- Access token short TTL, refresh token secure flow.
- Backend validates token and extracts claims per request.

### RBAC

Roles:
- `admin`, `hr_manager`, `manager`, `employee`.

Policies:
- Endpoint-level permission checks + resource-level org ownership checks.

### API Protection

- Zod validation for body/query/params.
- Strict CORS allowlist.
- Rate limits by IP and user.
- Secure headers with helmet.
- Audit logs for privileged operations.

### Wallet Signature Verification

- EIP-191 compatible message.
- One-time nonce, short expiry.
- Replay prevention and rate limiting.

## PART 7: Scalability & Production Design

### Horizontal Scaling

- Stateless Next.js and Express instances behind load balancer.
- Shared state only in PostgreSQL/Redis.

### Caching

- CDN caching for static assets.
- API response cache for dashboard aggregates.
- Redis caching for AI output and nonce storage.

### Load Balancing

- Round-robin + health checks.
- Canary/blue-green rollout for safe releases.

### Future Microservices Migration

- Phase 1: modular monolith.
- Phase 2: extract AI service.
- Phase 3: extract Web3 tx worker.
- Phase 4: dedicated auth/notifications/analytics services.

