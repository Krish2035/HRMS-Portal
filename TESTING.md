# HRMS Portal - Testing & Quality Assurance Documentation

## 1. Test Suite Overview

The platform includes automated testing at unit, integration, and API levels:

| Test File | Test Suite Focus | Test Cases |
|---|---|---|
| `backend/src/tests/auth.test.ts` | Argon2id hashing, password verification, JWT access tokens, secret tampering protection | 3 |
| `backend/src/tests/work-session.test.ts` | Authoritative elapsed time formula, break deduction, freeze on pause, clock skew guards, formatting | 4 |
| `backend/src/tests/api.test.ts` | Health probes, Request ID header propagation, 404 structured errors, Zod validation, Unauthorized guards | 5 |

**Total passing test cases**: **12 passed** (0 failing).

---

## 2. Running Tests Locally

### 2.1 Backend Tests (Vitest)
```bash
cd backend
npm test
```

### 2.2 Watch Mode (Test-Driven Development)
```bash
cd backend
npm run test:watch
```

---

## 3. Work Timer Correctness Verification

The test suite validates the core formula:
$$\text{Net Work Duration} = (\min(\text{CurrentTime}, \text{EndTime}) - \text{StartTime}) - \sum \text{ApprovedBreaks}$$

Key scenarios verified:
1. **Active Running Session**: Elapsed time increments based on server UTC start time.
2. **Paused Session**: Elapsed time remains frozen at the moment the break began.
3. **Resumed Session**: Break duration is computed, stored in `break_records`, and subtracted from ongoing duration.
4. **Ended Session**: Final duration is persisted to `work_sessions` and synced to daily `attendance_records`.
5. **Double-Click Idempotency**: Repeated calls to `/work-sessions/start` safely return the existing active session without creating duplicate rows.
