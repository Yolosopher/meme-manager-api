import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateLikeDto, FindMemeLikersDto } from './dto/like.dto';
import { MemesService } from 'src/memes/memes.service';
import { UsersService } from 'src/users/users.service';
import { Meme } from '@prisma/client';
import { PaginationMeta } from 'src/common/interfaces';

@Injectable()
export class LikeService {
  private per_page: number = 20;
  constructor(
    private databaseService: DatabaseService,

    private memesService: MemesService,
    private usersService: UsersService,
  ) {}

  public async likeOrDislike({
    memeId,
    userId,
  }: CreateLikeDto): Promise<{ isLiked: boolean }> {
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

    // check if like already exists
    const like = await this.databaseService.like.findUnique({
      where: {
        userId_memeId: {
          userId,
          memeId,
        },
      },
    });
    if (like) {
      await this.dislike({ memeId, userId }, meme);
      return {
        isLiked: false,
      };
    }

    await this.like({ memeId, userId }, meme);

    return {
      isLiked: true,
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
