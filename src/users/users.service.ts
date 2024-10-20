import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { HasherService } from 'src/hasher/hasher.service';
import {
  CreateUserDto,
  DetailedSelf,
  FoundUser,
  SearchUsersDto,
  UpdateNameDto,
} from './dto/user.dto';
import { PaginationMeta } from 'src/common/interfaces';
import { MemesService } from 'src/memes/memes.service';
import { ImageService } from 'src/image/image.service';
import { UniquesService } from 'src/uniques/uniques.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private hasherService: HasherService,
    private memesService: MemesService,
    private imageService: ImageService,
    private uniquesService: UniquesService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // check if user already exists
    const foundUser = await this.findUserByEmail(createUserDto.email);

    if (foundUser) {
      throw new ConflictException(
        `Email already exists ${createUserDto.email}`,
      );
    }

    const payload = {
      ...createUserDto,
      password: await this.hasherService.hash(createUserDto.password),
      role: Role.USER,
    };
    const result = await this.databaseService.user.create({
      data: payload,
    });
    // create user avatar
    await this.uniquesService.generateAvatar(createUserDto.email);

    return result;
  }

  async findUserByEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const foundUser = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hasherService.compare(
      password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return foundUser;
  }

  async findUserByEmail(email: string) {
    return await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getDetailed(id: number): Promise<DetailedSelf> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            myMemes: true,
            followedBy: true,
            following: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateNameDto): Promise<User> {
    return await this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: number, email: string): Promise<User> {
    try {
      // delete meme images from s3
      const memeImageNames = await this.memesService.findUserMemeImageNames(id);

      if (memeImageNames.length > 0) {
        await this.imageService.deleteMultipleImages(memeImageNames);
      }
    } catch (error) {
      console.log(
        `Error deleting meme images after user got deleted: ${error}`,
      );
    }

    // delete user avatar
    try {
      await this.uniquesService.deleteAvatar(email);
    } catch (error) {
      // do nothing
    }

    const result = await this.databaseService.user.delete({
      where: {
        id,
      },
    });
    return result;
  }

  async search({
    search,
    page,
    selfId,
    per_page,
  }: SearchUsersDto): Promise<{ data: FoundUser[]; meta: PaginationMeta }> {
    const where = {
      AND: [
        {
          id: {
            not: selfId,
          },
        },
        {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
        },
      ],
    };
    const payload = {
      take: per_page,
      skip: (page - 1) * per_page,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    };
    if (search) {
      payload['where'] = where;
    }
    const foundUsers = await this.databaseService.user.findMany();

    const total = await this.databaseService.user.count(
      search ? { where } : null,
    );
    const meta: PaginationMeta = {
      total,
      page,
      per_page: per_page,
      next_page: total > page * per_page ? page + 1 : undefined,
      prev_page: page > 1 ? page - 1 : undefined,
    };

    return {
      meta,
      data: foundUsers,
    };
  }
}
