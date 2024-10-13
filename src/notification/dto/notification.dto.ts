import { NotificationType, Notification } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class NotificationCreateDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  fromUserId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNumber()
  @IsOptional()
  memeId?: number;
}

export class NotificationDeleteDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  fromUserId: number;

  @IsEnum(NotificationType)
  type: NotificationType;
}

export class NotificationReadDto {
  @IsNumber()
  notificationId: number;
}
export interface INotification extends Notification {
  fromUser: {
    id: number;
    email: string;
    name: string;
  };
  memeImageUrl?: string;
}
