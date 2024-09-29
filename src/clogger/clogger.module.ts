import { Module } from '@nestjs/common';
import { CloggerService } from './clogger.service';

@Module({
  providers: [CloggerService],
  exports: [CloggerService],
})
export class CloggerModule {}
