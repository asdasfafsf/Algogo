import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { CustomForbiddenException } from '../common/errors/CustomForbiddenException';
import { Roles } from '../common/decorators/authorization/roles.decorator';
import { Role } from '../common/types/roles.type';
import { ROLES } from '../common/constants/roles.constants';

describe('RolesGuard 단위 테스트', () => {
  let guard: RolesGuard;

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (user: any = {}): ExecutionContext => {
    const mockRequest = {
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('필요한 역할이 없으면 true를 반환한다 (역할 검사 생략)', () => {
      // Arrange
      const mockContext = createMockContext();
      mockReflector.get.mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockReflector.get).toHaveBeenCalledWith(
        Roles,
        mockContext.getHandler(),
      );
    });

    it('필요한 역할이 빈 배열이면 true를 반환한다', () => {
      // Arrange
      const mockContext = createMockContext();
      mockReflector.get.mockReturnValue([]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('사용자가 없으면 CustomForbiddenException을 던진다', () => {
      // Arrange
      const mockContext = createMockContext(null);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('사용자가 필요한 역할을 가지고 있으면 true를 반환한다', () => {
      // Arrange
      const userWithRoles = {
        sub: 'user-uuid',
        roles: [ROLES.ADMIN, ROLES.USER] as Role[],
      };
      const mockContext = createMockContext(userWithRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('사용자가 필요한 역할을 가지고 있지 않으면 CustomForbiddenException을 던진다', () => {
      // Arrange
      const userWithRoles = {
        sub: 'user-uuid',
        roles: [ROLES.USER] as Role[],
      };
      const mockContext = createMockContext(userWithRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('사용자의 roles가 undefined이면 CustomForbiddenException을 던진다', () => {
      // Arrange
      const userWithoutRoles = {
        sub: 'user-uuid',
        // roles 속성 없음
      };
      const mockContext = createMockContext(userWithoutRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('사용자의 roles가 null이면 CustomForbiddenException을 던진다', () => {
      // Arrange
      const userWithNullRoles = {
        sub: 'user-uuid',
        roles: null,
      };
      const mockContext = createMockContext(userWithNullRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('사용자의 roles가 빈 배열이면 CustomForbiddenException을 던진다', () => {
      // Arrange
      const userWithEmptyRoles = {
        sub: 'user-uuid',
        roles: [] as Role[],
      };
      const mockContext = createMockContext(userWithEmptyRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('대소문자를 구분하여 역할을 비교한다', () => {
      // Arrange
      const userWithRoles = {
        sub: 'user-uuid',
        roles: ['admin'] as any[], // 소문자 (올바른 Role 타입이 아님)
      };
      const mockContext = createMockContext(userWithRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN]); // 'ADMIN' (대문자)

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        CustomForbiddenException,
      );
    });

    it('사용자가 필요한 역할 중 하나라도 가지고 있으면 true를 반환한다', () => {
      // Arrange
      const userWithRoles = {
        sub: 'user-uuid',
        roles: [ROLES.VIP] as Role[],
      };
      const mockContext = createMockContext(userWithRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN, ROLES.VIP, ROLES.USER]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('여러 역할이 필요하고 사용자가 모든 역할을 가지고 있으면 true를 반환한다', () => {
      // Arrange
      const userWithRoles = {
        sub: 'user-uuid',
        roles: [ROLES.ADMIN, ROLES.VIP, ROLES.USER] as Role[],
      };
      const mockContext = createMockContext(userWithRoles);
      mockReflector.get.mockReturnValue([ROLES.ADMIN, ROLES.VIP]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('Reflector가 올바른 데코레이터와 핸들러로 호출되는지 확인한다', () => {
      // Arrange
      const mockContext = createMockContext();
      const mockHandler = mockContext.getHandler();
      mockReflector.get.mockReturnValue(undefined);

      // Act
      guard.canActivate(mockContext);

      // Assert
      expect(mockReflector.get).toHaveBeenCalledWith(Roles, mockHandler);
    });
  });
});
