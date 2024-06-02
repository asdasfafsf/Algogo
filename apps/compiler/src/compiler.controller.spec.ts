import { Test, TestingModule } from '@nestjs/testing';
import { CompilerController } from './compiler.controller';
import { CompilerService } from './compiler.service';

describe('CompilerController', () => {
  let compilerController: CompilerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CompilerController],
      providers: [CompilerService],
    }).compile();

    compilerController = app.get<CompilerController>(CompilerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(compilerController.getHello()).toBe('Hello World!');
    });
  });
});
