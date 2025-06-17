import { Test, TestingModule } from '@nestjs/testing';
import { AuthV2Service } from './auth-v2.service';

describe('AuthV2Service', () => {
  let service: AuthV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthV2Service],
    }).compile();

    service = module.get<AuthV2Service>(AuthV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
