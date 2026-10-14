import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { ROLES } from './authorization.constants';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const createContext = (user: Record<string, unknown>) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  });

  it('allows employees to submit meeting requests', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['meetings.create']),
    };
    const guard = new PermissionsGuard(reflector as any);

    expect(
      guard.canActivate(
        createContext({ role: ROLES.EMPLOYEE, permissions: [] }) as any,
      ),
    ).toBe(true);
  });

  it('still denies permissions outside the employee defaults', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['users.delete']),
    };
    const guard = new PermissionsGuard(reflector as any);

    expect(() =>
      guard.canActivate(
        createContext({ role: ROLES.EMPLOYEE, permissions: [] }) as any,
      ),
    ).toThrow(ForbiddenException);
  });
});