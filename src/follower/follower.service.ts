import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UniquesService } from 'src/uniques/uniques.service';
import { FoundUser } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FollowerService {
  constructor(
    private usersService: UsersService,
    private databaseService: DatabaseService,
    private uniquesService: UniquesService,
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
    return true;
  }
  public async getUserFollowers(userId: number): Promise<FoundUser[]> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const followers = await this.databaseService.follows.findMany({
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
      where: {
        followingId: userId,
      },
    });

    const followedBys = followers.map((follower) => follower.followedBy);

    return followedBys.map((user) => ({
      ...user,
      avatarUrl: this.uniquesService.getAvatarUrl(user.email),
    }));
  }

  public async getUserFollowing(userId: number): Promise<FoundUser[]> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const following = await this.databaseService.follows.findMany({
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
      where: {
        followedById: userId,
      },
    });

    const followings = following.map((follow) => follow.following);

    return followings.map((user) => ({
      ...user,
      avatarUrl: this.uniquesService.getAvatarUrl(user.email),
    }));
  }
}
