import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUserRoomName } from 'src/common/helpers';
import axios from 'axios';

@Injectable()
export class PushNotificationService {
  private appId: string;
  private appToken: string;
  private appURL: string;
  constructor(private configService: ConfigService) {
    this.appId = this.configService.get('PUSH_NOTIFICATIONS_APP_ID');
    this.appToken = this.configService.get('PUSH_NOTIFICATIONS_APP_TOKEN');
    this.appURL = this.configService.get('PUSH_NOTIFICATIONS_APP_URL');
  }
  private urlSingleIndie(userId: number) {
    const indieId = getUserRoomName(userId);
    return `${this.appURL}/expo/indie/sub/${this.appId}/${this.appToken}/${indieId}`;
  }
  private urlALLIndies() {
    return `${this.appURL}/expo/indie/subs/${this.appId}/${this.appToken}`;
  }

  private urlDeleteSingleIndie(userId: number) {
    const indieId = getUserRoomName(userId);
    return `${this.appURL}/app/indie/sub/${this.appId}/${this.appToken}/${indieId}`;
  }

  private urlIndieSend() {
    return `${this.appURL}/indie/notification`;
  }

  public async deleteSingleIndie(userId: number) {
    const url = this.urlDeleteSingleIndie(userId);
    axios.delete(url).catch((error) => {
      console.log(`Error deleting single indie: ${error}`);
    });
  }

  public async checkIfPushTokenExists(userId: number): Promise<boolean> {
    const url = this.urlSingleIndie(userId);
    try {
      const response = await axios.get(url);
      const subIdObject = response.data[0];
      if (!subIdObject) {
        return false;
      }
      const {
        expo_ios_token,
        ios_apn_token,
        expo_android_token,
        android_fcm_token,
      } = subIdObject;
      if (
        !expo_ios_token &&
        !ios_apn_token &&
        !expo_android_token?.length &&
        !android_fcm_token?.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async sendIndiePushNotification({
    message,
    title,
    userId,
    data,
  }: {
    userId: number;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const indieId = getUserRoomName(userId);
    const payload: any = {
      subID: indieId,
      appId: this.appId,
      appToken: this.appToken,
      title,
      message,
    };
    if (data) {
      payload.pushData = JSON.stringify(data);
    }
    axios.post(this.urlIndieSend(), payload).catch((error) => {
      console.log(`Error sending indie push notification: ${error}`);
    });
  }
}
