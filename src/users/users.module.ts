import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { HasherModule } from 'src/hasher/hasher.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { MemesModule } from 'src/memes/memes.module';
import { ImageModule } from 'src/image/image.module';
import { UniquesModule } from 'src/uniques/uniques.module';

@Module({
  imports: [
    ConfigModule,
    MemesModule,
    DatabaseModule,
    HasherModule,
    TokenModule,
    ImageModule,
    UniquesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
