import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  CreateMemeDto,
  FindAllMemesDto,
  IMeme,
  IMemeWithLikes,
  UpdateMemeDto,
} from './dto/memes.dto';
import { Meme } from '@prisma/client';
import { ImageService } from 'src/image/image.service';
import { PaginationMeta } from 'src/common/interfaces';

@Injectable()
export class MemesService {
  private per_page: number = 10;
  constructor(
    private databaseService: DatabaseService,
    private imageService: ImageService,
  ) {}

  public async create(
    authorId: number,
    createMemeDto: CreateMemeDto,
    image: Express.Multer.File,
  ): Promise<Meme> {
    // upload image to s3
    try {
      await this.imageService.uploadImage(image);
    } catch (error) {
      throw new HttpException(
        'Error uploading image to S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // save meme in database
    const result = await this.databaseService.meme.create({
      data: {
        ...createMemeDto,
        authorId,
        imageName: image.filename,
      },
    });
    // delete local image

    this.imageService.deleteLocalImage(image.filename);

    return result;
  }

  public async findAll({ orderBy, page, authorId }: FindAllMemesDto): Promise<{
    data: IMeme[];
    meta: PaginationMeta;
  }> {
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

    const memesWithSignedUrls: IMeme[] = [];

    for (const meme of result) {
      const imageUrl = await this.imageService.getSignedUrl(meme.imageName);
      memesWithSignedUrls.push({ ...meme, imageUrl });
    }

    const total = await this.databaseService.meme.count({ where });
    return {
      meta: {
        total,
        page,
        per_page: this.per_page,
        next_page: total > page * this.per_page ? page + 1 : undefined,
        prev_page: page > 1 ? page - 1 : undefined,
      },
      data: memesWithSignedUrls,
    };
  }

  public async findOne<T extends boolean>(
    memeId: number,
    populateLikes: T,
  ): Promise<T extends true ? IMemeWithLikes : IMeme> {
    let include = undefined;
    if (populateLikes) {
      include = {
        likes: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            createdAt: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      };
    }
    const foundMeme = await this.databaseService.meme.findUnique({
      where: {
        id: memeId,
      },
      include,
    });
    if (!foundMeme) {
      throw new NotFoundException(`Meme with ID ${memeId} not found`);
    }
    const imageUrl = await this.imageService.getSignedUrl(foundMeme.imageName);
    return { ...foundMeme, imageUrl } as T extends true
      ? IMemeWithLikes
      : IMeme;
  }

  public async update(
    userId: number,
    memeId: number,
    updateMemeDto: UpdateMemeDto,
  ): Promise<Meme> {
    const foundMeme = await this.findOne(memeId, false);

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

  public async updateLikesCount(
    memeId: number,
    likesCount: number,
  ): Promise<Meme> {
    return await this.databaseService.meme.update({
      where: {
        id: memeId,
      },
      data: {
        likesCount,
      },
    });
  }

  public async remove(userId: number, memeId: number): Promise<Meme> {
    const foundMeme = await this.findOne(memeId, false);

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
