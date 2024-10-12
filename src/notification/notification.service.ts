import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  INotification,
  NotificationCreateDto,
  NotificationDeleteDto,
} from './dto/notification.dto';
import { ImageService } from 'src/image/image.service';
import { Server } from 'socket.io';
import { getUserRoomName } from 'src/common/helpers';

@Injectable()
export class NotificationService {
  constructor(
    private databaseService: DatabaseService,
    private imageService: ImageService,
  ) {}

  public async getMyNotifications(userId: number): Promise<INotification[]> {
    const notifications = await this.databaseService.notification.findMany({
      where: {
        userId,
      },
      take: 10,
      include: {
        fromUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const notificationsWithMemes: INotification[] = [];

    for (const notification of notifications) {
      if (notification.memeId) {
        const meme = await this.databaseService.meme.findUnique({
          where: {
            id: notification.memeId,
          },
          select: {
            imageName: true,
          },
        });
        if (!meme) {
          notificationsWithMemes.push(notification);
        } else {
          const imageUrl = await this.imageService.getSignedUrl(meme.imageName);
          notificationsWithMemes.push({
            ...notification,
            memeImageUrl: imageUrl,
          });
        }
      } else {
        notificationsWithMemes.push(notification);
      }
    }

    return notificationsWithMemes;
  }

  public async createNotification(
    { userId, type, memeId, fromUserId }: NotificationCreateDto,
    server: Server,
  ): Promise<void> {
    try {
      const createdNotification =
        await this.databaseService.notification.create({
          data: {
            userId,
            fromUserId,
            type,
            // details
            memeId: memeId ? memeId : undefined,
          },

          include: {
            fromUser: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });
      if (!createdNotification) {
        throw new ConflictException('Notification already exists');
      }

      // Check if the user is online
      if (!this.isUserOnline(server, userId)) {
        console.log('User is not online');
        return;
      }

      if (memeId) {
        const meme = await this.databaseService.meme.findUnique({
          where: {
            id: memeId,
          },
          select: {
            imageName: true,
          },
        });
        if (!meme) {
          this.sendNewNotificationToUser(createdNotification, server);
        } else {
          const imageUrl = await this.imageService.getSignedUrl(meme.imageName);
          this.sendNewNotificationToUser(
            {
              ...createdNotification,
              memeImageUrl: imageUrl,
            },
            server,
          );
        }
      } else {
        this.sendNewNotificationToUser(createdNotification, server);
      }
    } catch (error) {
      console.log(error);
      throw new ConflictException('Notification already exists');
    }
  }

  public async deleteNotification({
    fromUserId,
    type,
    userId,
  }: NotificationDeleteDto): Promise<true> {
    const notification = await this.databaseService.notification.findFirst({
      where: {
        userId,
        fromUserId,
        type,
      },
    });
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    await this.databaseService.notification.delete({
      where: {
        id: notification.id,
      },
    });
    return true;
  }

  public async markAsRead(notificationId: number): Promise<true> {
    const notification = await this.databaseService.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    await this.databaseService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
    return true;
  }

  public sendNewNotificationToUser(
    notification: INotification,
    server: Server,
  ) {
    console.log('emmiting new notification');
    server
      .to(getUserRoomName(notification.userId))
      .emit('new_notification', notification);
  }

  public isUserOnline(server: Server, userId: number): boolean {
    const roomName = getUserRoomName(userId);
    const room = server.sockets.adapter.rooms.get(roomName);
    if (room) {
      return true;
    }
    return false;
  }
}
