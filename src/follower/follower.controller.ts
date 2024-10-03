import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FoundUser } from 'src/users/dto/user.dto';
import { FollowerService } from './follower.service';

@Controller('follower')
export class FollowerController {
  constructor(private followerService: FollowerService) {}

  @HttpCode(HttpStatus.OK)
  @Get('followers')
  @UseGuards(AuthGuard)
  async getFollowers(@Req() request: any): Promise<FoundUser[]> {
    const userId = request.user.id;
    return this.followerService.getUserFollowers(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('following')
  @UseGuards(AuthGuard)
  async getFollowing(@Req() request: any): Promise<FoundUser[]> {
    const userId = request.user.id;
    return this.followerService.getUserFollowing(userId);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Get('follow/:targetId')
  async followUser(
    @Req() request: any,
    @Param('targetId') targetId: string,
  ): Promise<true> {
    const followerId = request.user.id;

    if (!targetId) {
      throw new BadRequestException('Target ID is required');
    }

    // check if targetId is not number
    if (isNaN(+targetId)) {
      throw new BadRequestException('Invalid target ID');
    }

    return this.followerService.followUser(+followerId, +targetId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('/unfollow/:targetId')
  async unfollowUser(
    @Req() request: any,
    @Param('targetId') targetId: string,
  ): Promise<true> {
    const followerId = request.user.id;

    if (!targetId) {
      throw new BadRequestException('Target ID is required');
    }

    // check if targetId is not number
    if (isNaN(+targetId)) {
      throw new BadRequestException('Invalid target ID');
    }

    return this.followerService.unfollowUser(+followerId, +targetId);
  }
}
