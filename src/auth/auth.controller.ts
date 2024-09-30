import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotImplementedException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthInput, CreateUserDto } from 'src/users/dto/user.dto';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(200)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @HttpCode(201)
  @Post('register')
  async register(@Body() input: CreateUserDto): Promise<boolean> {
    const user = await this.usersService.create(input);
    if (!user) return false;
    return true;
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() input: AuthInput) {
    return await this.authService.authenticate(input);
  }

  @HttpCode(200)
  @Get('profile')
  async getUserInfo() {
    throw new NotImplementedException();
  }
}
