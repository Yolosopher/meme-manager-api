import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { MemesModule } from 'src/memes/memes.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TokenModule,
    DatabaseModule,
    MemesModule,
    NotificationModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
