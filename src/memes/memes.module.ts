import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesController } from './memes.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [ConfigModule, TokenModule, DatabaseModule, ImageModule],
  controllers: [MemesController],
  providers: [MemesService],
  exports: [MemesService],
})
export class MemesModule {}
