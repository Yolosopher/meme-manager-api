import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FoundUser } from 'src/users/dto/user.dto';
import { FollowerService } from './follower.service';
import { PaginationMeta } from 'src/common/interfaces';
import { FindMyFollowersDto, FindMyFollowsDto } from './dto/follower.dto';

@Controller('follower')
export class FollowerController {
  constructor(private followerService: FollowerService) {}

  @HttpCode(HttpStatus.OK)
  @Get('followers')
  @UseGuards(AuthGuard)
  async getFollowers(
    @Req() request: any,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ): Promise<{
    data: FoundUser[];
    meta: PaginationMeta;
  }> {
    const userId = request.user.id as number;
    // check if page value is a number
    if (page && isNaN(+page)) {
      throw new BadRequestException('Invalid page number');
    }
    if (per_page && isNaN(+per_page)) {
      throw new BadRequestException('Invalid per_page number');
    }
    const findMyFollowersDto: FindMyFollowersDto = {
      page: 1,
      per_page: 10,
      userId,
    };
    if (page) {
      findMyFollowersDto.page = +page;
    }
    if (per_page) {
      findMyFollowersDto.per_page = +per_page;
    }
    return this.followerService.getUserFollowers(findMyFollowersDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('following')
  @UseGuards(AuthGuard)
  async getFollowing(
    @Req() request: any,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ): Promise<{
    data: FoundUser[];
    meta: PaginationMeta;
  }> {
    const userId = request.user.id as number;
    // check if page value is a number
    if (page && isNaN(+page)) {
      throw new BadRequestException('Invalid page number');
    }
    if (per_page && isNaN(+per_page)) {
      throw new BadRequestException('Invalid per_page number');
    }
    const findMyFollowsDto: FindMyFollowsDto = {
      page: 1,
      per_page: 10,
      userId,
    };
    if (page) {
      findMyFollowsDto.page = +page;
    }
    if (per_page) {
      findMyFollowsDto.per_page = +per_page;
    }
    return this.followerService.getUserFollowing(findMyFollowsDto);
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
