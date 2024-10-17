import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo } from 'expo-server-sdk';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class PushNotificationService {
  private expo: Expo;
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {
    this.expo = new Expo({
      accessToken: this.configService.get('PUSH_NOTIFICATIONS_APP_TOKEN'),
    });
  }
  // private urlSingleIndie(userId: number) {
  //   const indieId = getUserRoomName(userId);
  //   return `${this.appURL}/expo/indie/sub/${this.appId}/${this.appToken}/${indieId}`;
  // }
  // private urlALLIndies() {
  //   return `${this.appURL}/expo/indie/subs/${this.appId}/${this.appToken}`;
  // }

  // private urlDeleteSingleIndie(userId: number) {
  //   const indieId = getUserRoomName(userId);
  //   return `${this.appURL}/app/indie/sub/${this.appId}/${this.appToken}/${indieId}`;
  // }

  // private urlIndieSend() {
  //   return `${this.appURL}/indie/notification`;
  // }

  public async checkIfPushTokenExists(
    userId: number,
  ): Promise<{ success: false } | { success: true; pushTokens: string[] }> {
    try {
      const result = await this.tokenService.fetchPushTokens(userId);
      if (result.length === 0) {
        return {
          success: false,
        };
      }
      return {
        success: true,
        pushTokens: result,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  public async sendIndiePushNotification(
    pushTokens: string[],
    {
      message,
      title,
      data,
    }: {
      title: string;
      message: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    const chunks = this.expo.chunkPushNotifications(
      pushTokens.map((pToken) => ({
        to: pToken,
        sound: 'default',
        body: message,
        title,
        data,
      })),
    );

    chunks.forEach(async (chunk) => {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(error);
      }
    });
  }
}
