import { Test, TestingModule } from '@nestjs/testing';
import { OauthV2Service } from './oauth-v2.service';
import { OauthV2Repository } from './oauth-v2.repository';
import { UsersService } from '../users/users.service';
import { AuthV2Service } from '../auth-v2/auth-v2.service';
import { OAUTH_STATE } from '../common/constants/oauth.contant';
import { OAuthConflictException } from '../common/errors/oauth/OAuthConflictException';

describe('OauthV2Service', () => {
  let service: OauthV2Service;
  let repository: jest.Mocked<OauthV2Repository>;
  let usersService: jest.Mocked<UsersService>;
  let authV2Service: jest.Mocked<AuthV2Service>;

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      createUserOAuth: jest.fn(),
      updateUserOAuth: jest.fn(),
    };

    const mockUsersService = {
      createUser: jest.fn(),
    };

    const mockAuthV2Service = {
      login: jest.fn().mockResolvedValue(mockTokens),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OauthV2Service,
        { provide: OauthV2Repository, useValue: mockRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthV2Service, useValue: mockAuthV2Service },
      ],
    }).compile();

    service = module.get(OauthV2Service);
    repository = module.get(OauthV2Repository) as jest.Mocked<OauthV2Repository>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    authV2Service = module.get(AuthV2Service) as jest.Mocked<AuthV2Service>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOAuthState', () => {
    it('OAuth 정보가 없으면 NEW 상태를 반환한다', async () => {
      // Given
      repository.findOne.mockResolvedValue(null);

      // When
      const result = await service.getOAuthState({ id: '123', provider: 'kakao' });

      // Then
      expect(result.state).toBe(OAUTH_STATE.NEW);
      expect(result.user).toBeNull();
    });

    it('활성 연동이고 같은 유저면 CONNECTED_AND_ACTIVE를 반환한다', async () => {
      // Given
      const oauth = { userUuid: 'user-1', isActive: true };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.getOAuthState({
        id: '123',
        provider: 'kakao',
        userUuid: 'user-1',
      });

      // Then
      expect(result.state).toBe(OAUTH_STATE.CONNECTED_AND_ACTIVE);
    });

    it('활성 연동이고 다른 유저면 CONNECTED_TO_OTHER_ACCOUNT를 반환한다', async () => {
      // Given
      const oauth = { userUuid: 'other-user', isActive: true };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.getOAuthState({
        id: '123',
        provider: 'kakao',
        userUuid: 'user-1',
      });

      // Then
      expect(result.state).toBe(OAUTH_STATE.CONNECTED_TO_OTHER_ACCOUNT);
    });

    it('비활성 연동이고 같은 유저면 CONNECTED_AND_INACTIVE를 반환한다', async () => {
      // Given
      const oauth = { userUuid: 'user-1', isActive: false };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.getOAuthState({
        id: '123',
        provider: 'kakao',
        userUuid: 'user-1',
      });

      // Then
      expect(result.state).toBe(OAUTH_STATE.CONNECTED_AND_INACTIVE);
    });

    it('비활성 연동이고 다른 유저면 DISCONNECTED_FROM_OTHER_ACCOUNT를 반환한다', async () => {
      // Given
      const oauth = { userUuid: 'other-user', isActive: false };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.getOAuthState({
        id: '123',
        provider: 'kakao',
        userUuid: 'user-1',
      });

      // Then
      expect(result.state).toBe(OAUTH_STATE.DISCONNECTED_FROM_OTHER_ACCOUNT);
    });
  });

  describe('registerOrLogin', () => {
    const params = {
      id: '123',
      provider: 'kakao' as const,
      name: '테스트',
      email: 'test@test.com',
      ip: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('NEW 상태면 유저 생성 후 토큰을 반환한다', async () => {
      // Given
      repository.findOne.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue({ uuid: 'new-uuid' } as never);

      // When
      const result = await service.registerOrLogin(params);

      // Then
      expect(usersService.createUser).toHaveBeenCalled();
      expect(authV2Service.login).toHaveBeenCalledWith(
        expect.objectContaining({ userUuid: 'new-uuid' }),
      );
      expect(result).toEqual(mockTokens);
    });

    it('CONNECTED_AND_ACTIVE 상태면 바로 로그인한다', async () => {
      // Given
      const oauth = { userUuid: 'existing-uuid', isActive: true };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.registerOrLogin(params);

      // Then
      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(authV2Service.login).toHaveBeenCalledWith(
        expect.objectContaining({ userUuid: 'existing-uuid' }),
      );
      expect(result).toEqual(mockTokens);
    });

    it('비활성 OAuth가 존재하면 활성화 후 로그인한다', async () => {
      // Given
      const oauth = { userUuid: 'inactive-uuid', isActive: false };
      repository.findOne.mockResolvedValue(oauth as never);

      // When
      const result = await service.registerOrLogin(params);

      // Then
      expect(repository.updateUserOAuth).toHaveBeenCalledWith({
        id: '123',
        provider: 'kakao',
        userUuid: 'inactive-uuid',
        isActive: true,
      });
      expect(authV2Service.login).toHaveBeenCalledWith(
        expect.objectContaining({ userUuid: 'inactive-uuid' }),
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('connectOAuthProvider', () => {
    const params = { id: '123', provider: 'kakao' as const, userUuid: 'user-1' };

    it('NEW 상태면 OAuth를 생성한다', async () => {
      // Given
      repository.findOne.mockResolvedValue(null);

      // When
      await service.connectOAuthProvider(params);

      // Then
      expect(repository.createUserOAuth).toHaveBeenCalledWith(params);
    });

    it('활성 OAuth가 존재하면 OAuthConflictException을 던진다', async () => {
      // Given
      const oauth = { userUuid: 'other-user', isActive: true };
      repository.findOne.mockResolvedValue(oauth as never);

      // When & Then
      await expect(service.connectOAuthProvider(params)).rejects.toThrow(
        OAuthConflictException,
      );
    });

    it('비활성 OAuth가 존재하면 OAuthConflictException을 던진다', async () => {
      // Given
      const oauth = { userUuid: 'other-user', isActive: false };
      repository.findOne.mockResolvedValue(oauth as never);

      // When & Then
      await expect(service.connectOAuthProvider(params)).rejects.toThrow(
        OAuthConflictException,
      );
    });
  });

  describe('disconnectOAuthProvider', () => {
    it('OAuth 연동을 해제한다', async () => {
      // Given
      const params = { id: '123', provider: 'kakao' as const, userUuid: 'user-1' };

      // When
      await service.disconnectOAuthProvider(params);

      // Then
      expect(repository.updateUserOAuth).toHaveBeenCalledWith({
        ...params,
        isActive: false,
      });
    });
  });
});
