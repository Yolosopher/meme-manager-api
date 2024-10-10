import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { MemesModule } from 'src/memes/memes.module';
import { LikeGateway } from './like.gateway';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JwtModule,
    TokenModule,
    DatabaseModule,
    MemesModule,
  ],
  controllers: [LikeController],
  providers: [LikeService, LikeGateway],
})
export class LikeModule {}
