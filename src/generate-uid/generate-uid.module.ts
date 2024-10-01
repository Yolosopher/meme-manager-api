import { Module } from '@nestjs/common';
import { GenerateUidService } from './generate-uid.service';

@Module({
  providers: [GenerateUidService],
  exports: [GenerateUidService],
})
export class GenerateUidModule {}
