import {
  BadRequestException,
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
  FoundUser,
  SearchUsersDto,
  UpdateNameDto,
} from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';
import { PaginationMeta } from 'src/common/interfaces';
import { FollowerService } from 'src/follower/follower.service';

@Injectable()
export class UsersService {
  private per_page: number = 10;
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private hasherService: HasherService,
    private tokenService: TokenService,
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
    return await this.databaseService.user.create({
      data: payload,
    });
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

  async findOne(id: number) {
    return await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateNameDto): Promise<User> {
    return await this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.user.delete({
      where: {
        id,
      },
    });
  }

  async search({
    search,
    page,
    selfId,
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
    const foundUsers = await this.databaseService.user.findMany({
      take: this.per_page,
      skip: (page - 1) * this.per_page,
      orderBy: {
        createdAt: 'desc',
      },
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // check if empty array and throw not found exception
    if (foundUsers.length < 1) {
      throw new NotFoundException('No users found');
    }

    const total = await this.databaseService.user.count({ where });
    const meta: PaginationMeta = {
      total,
      page,
      per_page: this.per_page,
      next_page: total > page * this.per_page ? page + 1 : undefined,
      prev_page: page > 1 ? page - 1 : undefined,
    };

    return { meta, data: foundUsers };
  }
}
