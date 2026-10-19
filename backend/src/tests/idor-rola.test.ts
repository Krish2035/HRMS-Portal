import { describe, it, expect } from 'vitest';

describe('IDOR & ROLA Security Authorization Engine - Unit Tests', () => {
  // Test Mock State
  const tenantA_Id = '11111111-1111-1111-1111-111111111111';
  const tenantB_Id = '22222222-2222-2222-2222-222222222222';

  const userAlice = {
    userId: 'user-alice',
    employeeId: 'emp-alice',
    organizationId: tenantA_Id,
    roles: ['employee'],
  };

  const userBob = {
    userId: 'user-bob',
    employeeId: 'emp-bob',
    organizationId: tenantA_Id,
    roles: ['employee'],
  };

  const managerCharlie = {
    userId: 'user-charlie',
    employeeId: 'emp-charlie',
    organizationId: tenantA_Id,
    roles: ['manager'],
  };

  const managerDiana = {
    userId: 'user-diana',
    employeeId: 'emp-diana',
    organizationId: tenantA_Id,
    roles: ['manager'],
  };

  const superAdminEve = {
    userId: 'user-eve',
    employeeId: 'emp-eve',
    organizationId: tenantA_Id,
    roles: ['super_admin'],
  };

  const attackerMallory = {
    userId: 'user-mallory',
    employeeId: 'emp-mallory',
    organizationId: tenantB_Id, // Cross-tenant attacker
    roles: ['super_admin'], // Even with super_admin role in Tenant B
  };

  // Alice's Work Session in Tenant A
  const aliceWorkSession = {
    id: 'session-alice-01',
    organizationId: tenantA_Id,
    employeeId: 'emp-alice',
    status: 'running',
  };

  // Bob's Leave Request in Tenant A (reports to Charlie)
  const bobLeaveRequest = {
    id: 'leave-bob-01',
    organizationId: tenantA_Id,
    employeeId: 'emp-bob',
    status: 'pending',
  };

  // Manager reporting registry (Charlie manages Bob, but Diana does not)
  const managerRegistry: Record<string, string[]> = {
    'emp-charlie': ['emp-bob'], // Charlie manages Bob
    'emp-diana': ['emp-alice'], // Diana manages Alice
  };

  const evaluateIdorRola = (
    user: { userId: string; employeeId: string; organizationId: string; roles: string[] },
    resource: { organizationId: string; employeeId?: string },
    options: {
      allowRoles?: string[];
      allowSelf?: boolean;
      checkManagerRelationship?: boolean;
    }
  ): { allowed: boolean; code?: string; reason?: string } => {
    // 1. IDOR: Multi-Tenant Boundary Check
    if (user.organizationId !== resource.organizationId) {
      return {
        allowed: false,
        code: 'IDOR_ACCESS_DENIED',
        reason: 'Cross-tenant direct reference strictly blocked',
      };
    }

    // 2. Global Role Authority (Super Admin)
    if (user.roles.includes('super_admin') || (options.allowRoles && user.roles.some((r) => options.allowRoles?.includes(r)))) {
      return { allowed: true };
    }

    // 3. Self-Ownership Check
    if (options.allowSelf && resource.employeeId === user.employeeId) {
      return { allowed: true };
    }

    // 4. ROLA: Contextual Manager Hierarchy Check
    if (user.roles.includes('manager') && options.checkManagerRelationship && resource.employeeId) {
      const managedEmployees = managerRegistry[user.employeeId] || [];
      if (managedEmployees.includes(resource.employeeId)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        code: 'ROLA_OBJECT_AUTHORIZATION_FAILED',
        reason: 'User is not the designated manager for this specific employee record',
      };
    }

    // 5. Default Ownership Violation
    return {
      allowed: false,
      code: 'IDOR_OWNERSHIP_VIOLATION',
      reason: 'User does not possess ownership of this object',
    };
  };

  it('Anti-IDOR: should block cross-tenant direct object references even for foreign super admins', () => {
    // Attacker from Tenant B tries accessing Alice's session in Tenant A
    const result = evaluateIdorRola(attackerMallory, aliceWorkSession, {
      allowRoles: ['super_admin'],
      allowSelf: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('IDOR_ACCESS_DENIED');
  });

  it('Anti-IDOR: should prevent employees from tampering with another employee work session', () => {
    // Bob tries to manipulate Alice's active work session
    const result = evaluateIdorRola(userBob, aliceWorkSession, {
      allowSelf: true,
      checkManagerRelationship: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('IDOR_OWNERSHIP_VIOLATION');
  });

  it('Self-Ownership: should allow an employee to control their own work session', () => {
    // Alice pauses her own active work session
    const result = evaluateIdorRola(userAlice, aliceWorkSession, {
      allowSelf: true,
    });

    expect(result.allowed).toBe(true);
  });

  it('ROLA: should allow designated manager to review their direct report leave request', () => {
    // Charlie manages Bob, so Charlie can approve Bob's leave request
    const result = evaluateIdorRola(managerCharlie, bobLeaveRequest, {
      checkManagerRelationship: true,
      allowSelf: false,
    });

    expect(result.allowed).toBe(true);
  });

  it('ROLA: should deny unauthorized manager from reviewing a different team member request', () => {
    // Diana does NOT manage Bob (she manages Alice). Diana should be blocked by ROLA!
    const result = evaluateIdorRola(managerDiana, bobLeaveRequest, {
      checkManagerRelationship: true,
      allowSelf: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('ROLA_OBJECT_AUTHORIZATION_FAILED');
  });

  it('Super Admin: should maintain full organizational authority across all tenant objects', () => {
    // Eve is Super Admin in Tenant A, can manage Bob's leave request
    const result = evaluateIdorRola(superAdminEve, bobLeaveRequest, {
      allowRoles: ['super_admin'],
      checkManagerRelationship: true,
    });

    expect(result.allowed).toBe(true);
  });
});
