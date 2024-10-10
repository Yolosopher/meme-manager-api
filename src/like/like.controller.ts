import {
  Controller,
  Get,
  UseGuards,
  Param,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { FindMemeLikersDto } from './dto/like.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationMeta } from 'src/common/interfaces';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @HttpCode(HttpStatus.OK)
  @Get('toggle/:memeId')
  @UseGuards(AuthGuard)
  async likeOrDislike(
    @Req() request: any,
    @Param('memeId') memeId: string,
  ): Promise<{ isLiked: boolean }> {
    const userId = request.user.id;

    if (!memeId) {
      throw new BadRequestException('Meme ID is required');
    }

    // check if targetId is not number
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }

    return this.likeService.likeOrDislike({
      memeId: +memeId,
      userId,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('likers/:memeId')
  @UseGuards(AuthGuard)
  async findMemeLikers(
    @Param('memeId') memeId: string,
    @Query('page') page?: string,
  ): Promise<{
    memeId: number;
    meta: PaginationMeta;
    data: {
      id: number;
      name: string;
      email: string;
    }[];
  }> {
    if (!memeId) {
      throw new BadRequestException('Meme ID is required');
    }

    // check if memeId is not number
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }

    // check if page value is a number
    if (page && isNaN(+page)) {
      throw new BadRequestException('Invalid page number');
    }

    const findMemeLikersDto: FindMemeLikersDto = {
      page: 1,
      memeId: +memeId,
    };
    if (page) {
      findMemeLikersDto.page = +page;
    }

    return await this.likeService.findMemeLikers(findMemeLikersDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('status/:memeId')
  @UseGuards(AuthGuard)
  async likeStatus(
    @Req() request: any,
    @Param('memeId') memeId: string,
  ): Promise<{ isLiked: boolean }> {
    const userId = request.user.id;

    if (!memeId) {
      throw new BadRequestException('Meme ID is required');
    }

    // check if targetId is not number
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }

    return await this.likeService.getCurrentLikeStatus({
      memeId: +memeId,
      userId,
    });
  }
}
