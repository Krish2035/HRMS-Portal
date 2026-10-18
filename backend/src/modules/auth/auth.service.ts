import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { users, refreshTokens, employeeProfiles, userRoles, roles } from '../../db/schema';
import { TokenPayload, AuthResponse } from './auth.types';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });
  }

  static async issueRefreshToken(
    userId: string,
    existingFamily?: string
  ): Promise<{ token: string; tokenHash: string; family: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const family = existingFamily || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(refreshTokens).values({
      userId,
      tokenFamily: family,
      tokenHash,
      isRevoked: 'false',
      expiresAt,
    });

    return { token: `${rawToken}.${family}`, tokenHash, family, expiresAt };
  }

  static async rotateRefreshToken(tokenWithFamily: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const [rawToken, family] = tokenWithFamily.split('.');
    if (!rawToken || !family) {
      throw new Error('Invalid refresh token format');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [foundToken] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenFamily, family), eq(refreshTokens.tokenHash, tokenHash)))
      .limit(1);

    if (!foundToken) {
      // Possible reuse attack or forged token! Revoke family for security
      await db
        .update(refreshTokens)
        .set({ isRevoked: 'true' })
        .where(eq(refreshTokens.tokenFamily, family));
      throw new Error('Refresh token invalid or already rotated');
    }

    if (foundToken.isRevoked === 'true' || foundToken.expiresAt < new Date()) {
      // Immediate token reuse detection! Invalidate whole family!
      await db
        .update(refreshTokens)
        .set({ isRevoked: 'true' })
        .where(eq(refreshTokens.tokenFamily, family));
      throw new Error('Revoked refresh token reuse detected. Family invalidated.');
    }

    // Invalidate old token
    await db
      .update(refreshTokens)
      .set({ isRevoked: 'true' })
      .where(eq(refreshTokens.id, foundToken.id));

    // Fetch user & employee profile
    const [user] = await db.select().from(users).where(eq(users.id, foundToken.userId)).limit(1);
    if (!user || user.status !== 'active') {
      throw new Error('User inactive or not found');
    }

    // Fetch roles
    const assignedRoles = await db
      .select({ slug: roles.slug })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const roleSlugs = assignedRoles.map((r) => r.slug);

    // Issue new access and refresh tokens
    const accessToken = this.generateAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email,
      roles: roleSlugs,
      permissions: [],
    });

    const newRefresh = await this.issueRefreshToken(user.id, family);

    return {
      accessToken,
      newRefreshToken: newRefresh.token,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is suspended or inactive');
    }

    const isMatch = await this.verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed attempts
      await db
        .update(users)
        .set({ failedLoginAttempts: user.failedLoginAttempts + 1 })
        .where(eq(users.id, user.id));
      throw new Error('Invalid email or password');
    }

    // Reset failed attempts & update last login
    await db
      .update(users)
      .set({ failedLoginAttempts: 0, lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Fetch roles
    const assignedRoles = await db
      .select({ slug: roles.slug })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const roleSlugs = assignedRoles.map((r) => r.slug);

    // Fetch employee profile
    const [employee] = await db
      .select()
      .from(employeeProfiles)
      .where(eq(employeeProfiles.userId, user.id))
      .limit(1);

    const accessToken = this.generateAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email,
      roles: roleSlugs,
      permissions: [],
    });

    const refresh = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refresh.token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        status: user.status,
        roles: roleSlugs,
      },
      employee: employee
        ? {
            id: employee.id,
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            departmentId: employee.departmentId,
            designationId: employee.designationId,
            workLocation: employee.workLocation,
          }
        : null,
    };
  }

  static async revokeSession(tokenWithFamily: string): Promise<void> {
    const [, family] = tokenWithFamily.split('.');
    if (family) {
      await db
        .update(refreshTokens)
        .set({ isRevoked: 'true' })
        .where(eq(refreshTokens.tokenFamily, family));
    }
  }
}
