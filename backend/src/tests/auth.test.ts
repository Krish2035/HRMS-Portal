import { describe, it, expect } from 'vitest';
import { AuthService } from '../modules/auth/auth.service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('AuthService - Authentication & Cryptography Unit Tests', () => {
  it('should hash password with Argon2id and verify correctly', async () => {
    const rawPassword = 'SecurePassword2026!';
    const hash = await AuthService.hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await AuthService.verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await AuthService.verifyPassword('WrongPassword!', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate valid JWT access token with user payload', () => {
    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
      organizationId: '22222222-2222-2222-2222-222222222222',
      email: 'krish@hrms.internal',
      roles: ['employee'],
      permissions: ['work_sessions:read', 'work_sessions:create'],
    };

    const token = AuthService.generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as typeof payload & { exp: number };
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.organizationId).toBe(payload.organizationId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.roles).toContain('employee');
  });

  it('should fail token verification when signed with incorrect secret', () => {
    const token = AuthService.generateAccessToken({
      userId: 'test-user',
      organizationId: 'test-org',
      email: 'test@hrms.internal',
      roles: [],
      permissions: [],
    });

    expect(() => {
      jwt.verify(token, 'tampered_invalid_secret_key_12345');
    }).toThrow();
  });
});
