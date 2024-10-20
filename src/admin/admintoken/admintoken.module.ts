import { Module } from '@nestjs/common';
import { AdmintokenController } from './admintoken.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [TokenModule],
  controllers: [AdmintokenController],
})
export class AdmintokenModule {}
