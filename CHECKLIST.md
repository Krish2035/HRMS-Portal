# HRMS Master Implementation Checklist & Progress Tracker

## Status Legend
- [ ] Not Started
- [x] Completed
- [/] In Progress

---

### Phase 1: Architecture, Specifications & Planning
- [x] Inspect repository environment & establish Git tracking
- [x] System Architecture & Topology Design (`ARCHITECTURE.md`)
- [x] Database ERD & Schema Design (`DATABASE.md`)
- [x] Root & Multi-App Directory Layout Blueprint
- [x] Authentication & Session Strategy Definition
- [x] Work-Session State Machine & API Specification
- [x] Windows Startup & Desktop Companion Strategy
- [x] Environment Variables (`.env.example`) & Git Rules (`.gitignore`)
- [x] Docker Compose Specification (`docker-compose.yml`)
- [x] Master Implementation Checklist (`CHECKLIST.md`)

---

### Phase 2: Local Development Foundation
- [ ] Initialize Backend Project (`/backend`) with TypeScript, Express, Drizzle ORM, Zod, and Pino
- [ ] Configure PostgreSQL 16 & Redis 7 Docker services and test connectivity
- [ ] Configure Drizzle schema, DB client connection pooling, and migration runner
- [ ] Setup Redis connection, health check endpoints, and Graceful Shutdown handling
- [ ] Initialize Employee Portal (`/frontend/employee-app`) with Next.js App Router, Tailwind CSS, TanStack Query
- [ ] Initialize Admin Portal (`/frontend/admin-app`) with React + Vite, Tailwind CSS, TanStack Query

---

### Phase 3: Authentication & Authorization (RBAC)
- [ ] Argon2id password hashing utility
- [ ] JWT Access Token generator & rotating Refresh Token service in Redis
- [ ] Cookie-based session management (`HttpOnly`, `SameSite=Lax`, CSRF protection)
- [ ] Route authentication middleware (`authenticate.ts`)
- [ ] Role-Based Access Control middleware (`authorize.ts`)
- [ ] Redis distributed rate-limiting middleware for auth endpoints
- [ ] Auth endpoints: Register/Invite, Login, Refresh, Logout, Current User (`/api/v1/auth/*`)
- [ ] Automated tests for token rotation, reuse detection, and session revocation

---

### Phase 4: Employee Work Timer (Core Feature)
- [ ] Drizzle migrations for `work_sessions`, `break_records`, `work_session_events`, and `time_correction_requests`
- [ ] PostgreSQL unique partial index to prevent concurrent active sessions
- [ ] Authoritative UTC elapsed-time calculation engine
- [ ] Work-Session Service & Controller (`start`, `pause`, `resume`, `end`, `current`, `summary`, `history`)
- [ ] Transaction-safe session state transitions and idempotency protection
- [ ] Time correction request workflow (submit, approve, reject)
- [ ] Employee Portal Timer UI: Elapsed counter, Start/Pause/Resume/End buttons, break selector
- [ ] Prominent Login Reminder banner ("Start Work" vs "Remind Me Later")
- [ ] Automated tests: Browser refresh resilience, concurrency, double-click idempotency

---

### Phase 5: Automatic Startup & Desktop Companion
- [ ] Desktop Companion project structure (`/desktop/employee-companion`)
- [ ] Windows Startup registration (Windows Registry Run key / Startup folder)
- [ ] System Tray integration (Status display: Active, Break, Idle)
- [ ] Periodic session sync with HRMS backend
- [ ] Native Windows toast notifications ("Timer not started", "Break reminder")
- [ ] "Open HRMS Portal" deep link to browser
- [ ] Fallback browser-only startup documentation and batch script (`shell:startup`)
- [ ] Privacy & Security compliance verification (zero spyware guarantee)

---

### Phase 6: Core HRMS Business Modules
- [ ] Organization & Company Settings API (working hours, holidays, policies)
- [ ] Departments, Designations & Hierarchy Management
- [ ] Employee Directory & Detailed Profile Management
- [ ] Daily Attendance consolidation & rollup engine
- [ ] Leave Types, Balances & Leave Application Workflow
- [ ] Manager Team Dashboard & Approval workflows

---

### Phase 7: Advanced Business Modules
- [ ] Payroll Preparation: Salary structures, allowances, deductions, and payslip generation
- [ ] Performance Reviews & Employee KPI / Goal tracking
- [ ] BullMQ asynchronous background jobs & scheduled notifications
- [ ] Comprehensive Audit Logging for HR compliance

---

### Phase 8: Database & Performance Optimization
- [ ] Query analysis with EXPLAIN ANALYZE on session and attendance queries
- [ ] Composite and partial indexes for high-frequency queries
- [ ] Redis caching layers with TTL and cache stampede protections
- [ ] PostgreSQL Read-Replica connection separation design

---

### Phase 9: Scaling, Load Balancing & Containerization
- [ ] Multi-stage production Dockerfiles for Backend, Employee App, and Admin App
- [ ] NGINX reverse proxy & load balancer configuration with sticky session bypass verification
- [ ] Multiple backend instance verification with distributed Redis session verification
- [ ] Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, HPA)

---

### Phase 10: Production Readiness & Quality Assurance
- [ ] Vitest unit and integration test suite coverage
- [ ] Supertest API test suite
- [ ] End-to-end user journey tests
- [ ] Security audit (headers, injection prevention, rate limits, token revocation)
- [ ] Operational runbooks: DB backup/restore, credential rotation, disaster recovery
