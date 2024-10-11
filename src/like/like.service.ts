import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateLikeDto, FindMemeLikersDto } from './dto/like.dto';
import { MemesService } from 'src/memes/memes.service';
import { UsersService } from 'src/users/users.service';
import { Meme, NotificationType } from '@prisma/client';
import { PaginationMeta } from 'src/common/interfaces';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class LikeService {
  private per_page: number = 20;
  constructor(
    private databaseService: DatabaseService,
    private memesService: MemesService,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  public async getCurrentLikeStatus({
    memeId,
    userId,
  }: CreateLikeDto): Promise<{ isLiked: boolean; likesCount: number }> {
    const meme = await this.memesService.findOne(memeId, false);
    if (!meme) {
      throw new NotFoundException('Meme not found');
    }
    // check if like already exists
    const like = await this.databaseService.like.findFirst({
      where: {
        userId,
        memeId,
      },
      include: {
        meme: {
          select: {
            likesCount: true,
          },
        },
      },
    });
    return {
      isLiked: !!like,
      likesCount: meme.likesCount,
    };
  }

  public async likeOrDislike({
    memeId,
    userId,
  }: CreateLikeDto): Promise<{ isLiked: boolean; likesCount: number }> {
    // check if meme exists
    const meme = await this.memesService.findOne(memeId, false);
    if (!meme) {
      throw new BadRequestException('Meme not found');
    }
    // check if user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const like = await this.getCurrentLikeStatus({ memeId, userId });
    if (like.isLiked) {
      await this.dislike({ memeId, userId }, meme);
      return {
        isLiked: false,
        likesCount: meme.likesCount - 1,
      };
    }

    await this.like({ memeId, userId }, meme);

    return {
      isLiked: true,
      likesCount: meme.likesCount + 1,
    };
  }

  private async like(
    { memeId, userId }: CreateLikeDto,
    meme: Meme,
  ): Promise<void> {
    await this.databaseService.like.create({
      data: {
        userId,
        memeId,
      },
    });
    await this.memesService.updateLikesCount(memeId, meme.likesCount + 1);

    // create notification
    const socketIoServer = this.notificationGateway.server;

    await this.notificationService.createNotification(
      {
        userId: meme.authorId,
        fromUserId: userId,
        type: NotificationType.LIKE,
        memeId,
      },
      socketIoServer,
    );
  }
  private async dislike(
    { memeId, userId }: CreateLikeDto,
    meme: Meme,
  ): Promise<void> {
    await this.databaseService.like.delete({
      where: {
        userId_memeId: {
          userId,
          memeId,
        },
      },
    });
    await this.memesService.updateLikesCount(memeId, meme.likesCount - 1);

    // delete notification
    await this.notificationService.deleteNotification({
      userId: meme.authorId,
      fromUserId: userId,
      type: NotificationType.LIKE,
    });
  }

  public async findMemeLikers({ memeId, page }: FindMemeLikersDto): Promise<{
    memeId: number;
    meta: PaginationMeta;
    data: {
      id: number;
      name: string;
      email: string;
    }[];
  }> {
    const where = {
      memeId,
    };
    const result = await this.databaseService.like.findMany({
      where,
      take: this.per_page,
      skip: (page - 1) * this.per_page,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (result.length === 0) {
      throw new BadRequestException('No likes found');
    }

    const total = await this.databaseService.like.count({
      where,
    });

    const likers = result.map((like) => like.user);

    return {
      memeId,
      meta: {
        total,
        page,
        per_page: this.per_page,
        next_page: total > page * this.per_page ? page + 1 : undefined,
        prev_page: page > 1 ? page - 1 : undefined,
      },
      data: likers,
    };
  }
}
