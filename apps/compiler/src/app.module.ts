import { Module } from '@nestjs/common';
import { ProcessModule } from './process/process.module';
import { ExecuteModule } from './execute/execute.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [ProcessModule, ExecuteModule, FileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
