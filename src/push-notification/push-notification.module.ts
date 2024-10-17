import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [ConfigModule, TokenModule],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
