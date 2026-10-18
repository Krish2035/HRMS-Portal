# HRMS Enterprise - REST API Specification

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
Authenticates user, sets HttpOnly refresh cookie, and returns access token.
- **Body**: `{ "email": "krish@hrms.internal", "password": "Password123!" }`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": { "id": "...", "email": "krish@hrms.internal", "roles": ["employee"] },
      "employee": { "id": "...", "employeeCode": "EMP003", "firstName": "Krish", "lastName": "Patel" }
    }
  }
  ```

### `POST /auth/refresh`
Rotates refresh token in cookie and returns a new access JWT.

### `POST /auth/logout`
Revokes active session family and clears cookie.

### `GET /auth/me`
Returns currently authenticated user token payload.

---

## 2. Work Sessions & Timer (`/work-sessions`)

### `POST /work-sessions/start`
Starts a new work timer (idempotent; returns existing if already active).
- **Body**: `{ "notes": "Starting daily engineering sprint" }`

### `GET /work-sessions/current`
Returns active session with server-calculated elapsed seconds.

### `POST /work-sessions/:sessionId/pause`
Pauses running session and records a break record (`coffee`, `lunch`, `meeting`, `general`).

### `POST /work-sessions/:sessionId/resume`
Resumes paused session, closes break record, and resumes elapsed duration calculation.

### `POST /work-sessions/:sessionId/end`
Ends active session, finalizes `netWorkDurationSeconds`, and updates today's attendance record.

### `GET /work-sessions/summary`
Returns today's total tracked work seconds, break seconds, and formatted hours.

### `POST /work-sessions/:sessionId/correction-requests`
Submits manual correction request with proposed start and end times.

---

## 3. Employee Directory (`/employees`)

### `GET /employees`
Search and filter employees by department or keyword.

### `GET /employees/:id`
Retrieves detailed employee profile with primary manager and designation.

### `GET /employees/:id/team`
Returns direct reports for a manager.

---

## 4. Leaves & Approvals (`/leaves`)

### `GET /leaves/types`
Lists organization leave categories and annual quotas.

### `GET /leaves/balances`
Retrieves employee's allocated, used, and pending days for current year.

### `POST /leaves/requests`
Submits new leave request.

### `GET /leaves/requests`
Lists pending and historical leave requests.

### `PATCH /leaves/requests/:id/review`
Manager/HR approval or rejection with atomic balance adjustment.

---

## 5. Attendance Management (`/attendance`)

### `GET /attendance/my`
Employee monthly attendance sheet and punch logs.

### `GET /attendance/daily-sheet`
Organization-wide daily attendance rollup.

---

## 6. Payroll Preparation (`/payroll`)

### `GET /payroll/periods`
Lists payroll periods.

### `POST /payroll/periods`
Creates a new payroll cycle.

### `POST /payroll/periods/:periodId/run`
Computes salary breakdown and payslips for all organization employees.

### `GET /payroll/my-payslips`
Personal payslip history for employees.

---

## 7. Performance Reviews & Goals (`/performance`)

### `GET /performance/goals`
Lists active employee goals.

### `POST /performance/goals`
Creates a new goal.

### `PATCH /performance/goals/:id`
Updates goal progress (0–100%) or status.

### `GET /performance/reviews`
Lists employee performance reviews.

### `POST /performance/reviews`
Manager submits review with ratings and feedback.

---

## 8. Audit Logs (`/audit`)

### `GET /audit`
Paginated audit log records for administrative compliance.
