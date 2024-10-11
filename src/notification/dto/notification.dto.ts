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

export interface INotification extends Notification {
  fromUser: {
    id: number;
    email: string;
  };
  memeImageUrl?: string;
}
