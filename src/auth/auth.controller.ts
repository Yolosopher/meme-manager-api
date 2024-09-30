import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  CreateUserDto,
  AuthResult,
  UpdateNameDto,
} from 'src/users/dto/user.dto';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return await this.usersService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<boolean> {
    const user = await this.usersService.remove(id);
    if (!user) return false;
    return true;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() input: CreateUserDto): Promise<boolean> {
    const user = await this.usersService.create(input);
    if (!user) return false;
    return true;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() input: LoginUserDto): Promise<AuthResult> {
    return await this.authService.authenticate(input);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getUserInfo(@Req() request) {
    const self = request.user;
    return self;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete()
  async deleteSelf(@Req() request): Promise<boolean> {
    const id = request.user.id;
    const user = await this.usersService.remove(id);
    if (!user) return false;
    return true;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() request): Promise<boolean> {
    const token = request.token;
    return await this.authService.deleteToken(token);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put()
  async update(
    @Req() request,
    @Body() input: UpdateNameDto,
  ): Promise<AuthResult> {
    const id = request.user.id;
    const token = request.token;
    await this.usersService.update(id, input);

    return await this.authService.updateToken(token);
  }
}
