import { Module } from '@nestjs/common';
import { UniquesService } from './uniques.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [UniquesService],
  exports: [UniquesService],
})
export class UniquesModule {}
