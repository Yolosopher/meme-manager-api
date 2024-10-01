import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateMemeDto, FindAllDto, UpdateMemeDto } from './dto/memes.dto';
import { Meme, Prisma } from '@prisma/client';

@Injectable()
export class MemesService {
  private per_page: number = 10;
  constructor(private databaseService: DatabaseService) {}

  async create(authorId: number, createMemeDto: CreateMemeDto): Promise<Meme> {
    return await this.databaseService.meme.create({
      data: {
        ...createMemeDto,
        authorId,
      },
    });
  }

  async findAll({ orderBy, page, authorId }: FindAllDto): Promise<Meme[]> {
    const where = authorId ? { authorId } : undefined;

    const result = await this.databaseService.meme.findMany({
      take: this.per_page,
      skip: (page - 1) * this.per_page,
      orderBy: orderBy
        ? orderBy
        : {
            createdAt: 'desc',
          },
      where,
    });

    if (result.length === 0) {
      throw new NotFoundException('No memes found');
    }
    return result;
  }

  async findOne(memeId: number): Promise<Meme> {
    const foundMeme = await this.databaseService.meme.findUnique({
      where: {
        id: memeId,
      },
    });
    if (!foundMeme) {
      throw new NotFoundException(`Meme with ID ${memeId} not found`);
    }
    return foundMeme;
  }

  async update(
    userId: number,
    memeId: number,
    updateMemeDto: UpdateMemeDto,
  ): Promise<Meme> {
    const foundMeme = await this.findOne(memeId);

    // Check if the user is the author of the meme
    if (foundMeme.authorId !== userId) {
      throw new ForbiddenException('You are not the author of this meme');
    }

    return await this.databaseService.meme.update({
      where: {
        id: memeId,
      },
      data: updateMemeDto,
    });
  }

  async remove(userId: number, memeId: number): Promise<Meme> {
    const foundMeme = await this.findOne(memeId);

    // Check if the user is the author of the meme
    if (foundMeme.authorId !== userId) {
      throw new ForbiddenException('You are not the author of this meme');
    }

    const meme = await this.databaseService.meme.delete({
      where: {
        id: memeId,
      },
    });
    return meme;
  }
}
