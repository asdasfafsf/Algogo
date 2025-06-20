import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsCollectController } from './problems-collect.controller';
import { ProblemsCollectService } from './problems-collect.service';

describe('ProblemsCollectController', () => {
  let controller: ProblemsCollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemsCollectController],
      providers: [ProblemsCollectService],
    }).compile();

    controller = module.get<ProblemsCollectController>(
      ProblemsCollectController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
