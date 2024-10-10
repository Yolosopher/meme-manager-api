import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  CreateUserDto,
  UpdateNameDto,
  AuthResultWithAvatar,
} from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './guards/auth.guard';
import { UniquesService } from 'src/uniques/uniques.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private uniquesService: UniquesService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() input: CreateUserDto): Promise<boolean> {
    const user = await this.usersService.create(input);
    if (!user) return false;
    return true;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() input: LoginUserDto): Promise<AuthResultWithAvatar> {
    const result = await this.authService.authenticate(input);
    const avatarUrl = this.uniquesService.getAvatarUrl(result.email);
    return { ...result, avatarUrl };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getSelf(@Req() request): Promise<AuthResultWithAvatar> {
    const self = request.user;
    const avatarUrl = this.uniquesService.getAvatarUrl(self.email);
    return { ...self, avatarUrl, accessToken: request.token };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete()
  async deleteSelf(@Req() request): Promise<boolean> {
    const id = request.user.id;
    const email = request.user.email;
    const user = await this.usersService.remove(id, email);
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
  ): Promise<AuthResultWithAvatar> {
    const id = request.user.id;
    const email = request.user.email;
    const token = request.token;
    await this.usersService.update(id, input);

    const result = await this.authService.updateToken(token);
    const avatarUrl = this.uniquesService.getAvatarUrl(email);
    return { ...result, avatarUrl };
  }
}
