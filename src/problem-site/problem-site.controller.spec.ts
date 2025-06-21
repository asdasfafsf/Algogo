import { Test, TestingModule } from '@nestjs/testing';
import { ProblemSiteController } from './problem-site.controller';

describe('ProblemSiteController', () => {
  let controller: ProblemSiteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemSiteController],
    }).compile();

    controller = module.get<ProblemSiteController>(ProblemSiteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
