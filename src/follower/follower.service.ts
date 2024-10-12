import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { FoundUser } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { FindMyFollowersDto, FindMyFollowsDto } from './dto/follower.dto';
import { PaginationMeta } from 'src/common/interfaces';

@Injectable()
export class FollowerService {
  private per_page: number = 10;
  constructor(
    private usersService: UsersService,
    private databaseService: DatabaseService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}
  public async isAlreadyFollowing(
    followerId: number,
    targetId: number,
  ): Promise<boolean> {
    const follow = await this.databaseService.follows.findFirst({
      where: {
        followedById: followerId,
        followingId: targetId,
      },
    });
    return follow ? true : false;
  }
  public async followUser(followerId: number, targetId: number): Promise<true> {
    const targetUser = await this.usersService.findOne(targetId);
    if (!targetUser) {
      throw new BadRequestException('Target user not found');
    }
    const isAlreadyFollowing = await this.isAlreadyFollowing(
      followerId,
      targetId,
    );
    if (isAlreadyFollowing) {
      throw new BadRequestException('Already following this user');
    }
    await this.databaseService.follows.create({
      data: {
        followedById: followerId,
        followingId: targetId,
      },
    });

    //  Create a notification for the target user
    const socketIoServer = this.notificationGateway.server;
    await this.notificationService.createNotification(
      {
        fromUserId: followerId,
        userId: targetId,
        type: NotificationType.FOLLOW,
      },
      socketIoServer,
    );

    return true;
  }
  public async unfollowUser(
    followerId: number,
    targetId: number,
  ): Promise<true> {
    const targetUser = await this.usersService.findOne(targetId);
    if (!targetUser) {
      throw new BadRequestException('Target user not found');
    }
    const isAlreadyFollowing = await this.isAlreadyFollowing(
      followerId,
      targetId,
    );
    if (!isAlreadyFollowing) {
      throw new BadRequestException('Not following this user');
    }

    await this.databaseService.follows.delete({
      where: {
        followingId_followedById: {
          followingId: targetId,
          followedById: followerId,
        },
      },
    });

    // Delete the notification for the target user
    await this.notificationService.deleteNotification({
      fromUserId: followerId,
      type: NotificationType.FOLLOW,
      userId: targetId,
    });

    return true;
  }

  public async getUserFollowers({ userId, page }: FindMyFollowersDto): Promise<{
    data: FoundUser[];
    meta: PaginationMeta;
  }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const where = {
      followingId: userId,
    };
    const followers = await this.databaseService.follows.findMany({
      take: this.per_page,
      skip: (page - 1) * this.per_page,
      orderBy: {
        followedBy: {
          name: 'asc',
        },
      },
      select: {
        followedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      where,
    });

    const total = await this.databaseService.follows.count({ where });

    return {
      meta: {
        total,
        page,
        per_page: this.per_page,
        next_page: total > page * this.per_page ? page + 1 : undefined,
        prev_page: page > 1 ? page - 1 : undefined,
      },
      data: followers.map((follower) => follower.followedBy),
    };
  }

  public async getUserFollowing({ userId, page }: FindMyFollowsDto): Promise<{
    data: FoundUser[];
    meta: PaginationMeta;
  }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: any = {
      followedById: userId,
    };
    const following = await this.databaseService.follows.findMany({
      take: this.per_page,
      skip: (page - 1) * this.per_page,
      orderBy: {
        following: {
          name: 'asc',
        },
      },
      select: {
        following: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      where,
    });
    const total = await this.databaseService.follows.count({ where });
    return {
      meta: {
        total,
        page,
        per_page: this.per_page,
        next_page: total > page * this.per_page ? page + 1 : undefined,
        prev_page: page > 1 ? page - 1 : undefined,
      },
      data: following.map((follow) => follow.following),
    };
  }
}
