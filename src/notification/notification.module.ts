import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { MemesModule } from 'src/memes/memes.module';
import { ImageModule } from 'src/image/image.module';
import { NotificationGateway } from './notification.gateway';

import { TokenModule } from 'src/token/token.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TokenModule,
    UsersModule,
    MemesModule,
    ImageModule,
    AuthModule,
  ],
  providers: [NotificationService, NotificationGateway, AuthGuard],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
