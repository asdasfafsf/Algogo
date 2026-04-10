import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserNotFoundException } from '../common/errors/user/UserNotFoundException';
import { UserInactiveException } from '../common/errors/user/UserInactiveException';
import { USER_STATE } from '../common/constants/user.constant';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findUser: jest.fn(),
      createUser: jest.fn(),
      findUserSummaryByUuid: jest.fn(),
      insertLoginHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('유저가 존재하면 반환한다', async () => {
      // Given
      const user = { uuid: 'test-uuid', name: '테스트' };
      repository.findUser.mockResolvedValue(user as never);

      // When
      const result = await service.getUser({ userUuid: 'test-uuid' });

      // Then
      expect(result).toEqual(user);
      expect(repository.findUser).toHaveBeenCalledWith({ userUuid: 'test-uuid' });
    });

    it('유저가 없으면 UserNotFoundException을 던진다', async () => {
      // Given
      repository.findUser.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getUser({ userUuid: 'none' })).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('유저를 생성하고 반환한다', async () => {
      // Given
      const params = { provider: 'kakao' as const, id: '123', name: '테스트', email: 'test@test.com' };
      const created = { uuid: 'new-uuid', ...params };
      repository.createUser.mockResolvedValue(created as never);

      // When
      const result = await service.createUser(params);

      // Then
      expect(result).toEqual(created);
      expect(repository.createUser).toHaveBeenCalledWith(params);
    });
  });

  describe('validateUser', () => {
    it('활성 유저면 UserSummary를 반환한다', async () => {
      // Given
      const user = {
        uuid: 'test-uuid',
        name: '테스트',
        state: USER_STATE.ACTIVE,
        userRoleList: [{ role: 'USER' }],
      };
      repository.findUserSummaryByUuid.mockResolvedValue(user as never);

      // When
      const result = await service.validateUser('test-uuid');

      // Then
      expect(result.roles).toEqual(['USER']);
      expect(result.state).toBe(USER_STATE.ACTIVE);
    });

    it('유저가 없으면 UserNotFoundException을 던진다', async () => {
      // Given
      repository.findUserSummaryByUuid.mockResolvedValue(null as never);

      // When & Then
      await expect(service.validateUser('none')).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('비활성 유저면 UserInactiveException을 던진다', async () => {
      // Given
      const user = {
        uuid: 'test-uuid',
        name: '테스트',
        state: USER_STATE.INACTIVE,
        userRoleList: [],
      };
      repository.findUserSummaryByUuid.mockResolvedValue(user as never);

      // When & Then
      await expect(service.validateUser('test-uuid')).rejects.toThrow(
        UserInactiveException,
      );
    });
  });

  describe('insertLoginHistory', () => {
    it('로그인 이력을 저장한다', async () => {
      // Given
      const params = {
        userUuid: 'test-uuid',
        type: 'KAKAO',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };
      repository.insertLoginHistory.mockResolvedValue(undefined as never);

      // When
      await service.insertLoginHistory(params);

      // Then
      expect(repository.insertLoginHistory).toHaveBeenCalledWith(params);
    });
  });
});
