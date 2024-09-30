import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { HasherService } from 'src/hasher/hasher.service';
import { CreateUserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private hasherService: HasherService,
  ) {}
  async initAdmin() {
    console.log('Initializing admin user...');
    const admin = await this.databaseService.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    });

    if (!admin) {
      console.log('Admin user not found, creating one...');
      await this.databaseService.user.create({
        data: {
          email: this.configService.get('ADMIN_EMAIL'),
          password: await this.hasherService.hash(
            this.configService.get('ADMIN_PASSWORD'),
          ),
          role: Role.ADMIN,
          name: this.configService.get('ADMIN_NAME'),
        },
      });
      console.log(
        'Admin user created with email',
        this.configService.get('ADMIN_EMAIL'),
      );
    }
    console.log('Admin user already exists');
  }

  async create(createUserDto: CreateUserDto) {
    // check if user already exists
    const foundUser = await this.findUserByEmail(createUserDto.email);

    if (foundUser) {
      throw new ConflictException('Email already exists');
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

  async findAll(role?: 'USER' | 'ADMIN') {
    if (role) {
      return await this.databaseService.user.findMany({
        where: {
          role,
        },
      });
    }
    return await this.databaseService.user.findMany();
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

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
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
}
