import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

@Module({
  providers: [AllExceptionsFilter],
  exports: [AllExceptionsFilter],
})
export class FilterModule {}
