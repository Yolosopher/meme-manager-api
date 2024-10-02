import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FoundUser, SearchUsersDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { User } from '@prisma/client';
import { PaginationMeta } from 'src/common/interfaces';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @Get('/admin')
  async findAllAdmin(): Promise<Omit<User, 'password'>[]> {
    return await this.usersService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(AuthGuard)
  async search(
    @Query('search') search: string,
    @Query('page') page: string,
  ): Promise<{ data: FoundUser[]; meta: PaginationMeta }> {
    if (!search) {
      throw new BadRequestException('Search query is required');
    }
    if (search.length < 3) {
      throw new BadRequestException(
        'Search query is too short (minimum 3 characters)',
      );
    }

    // check if page value is a number
    if (page && isNaN(+page)) {
      throw new BadRequestException('Invalid page number');
    }

    const searchUsersDto: SearchUsersDto = {
      search: '',
      page: 1,
    };

    searchUsersDto.search = search;
    if (page) {
      searchUsersDto.page = +page;
    }

    return this.usersService.search(searchUsersDto);
  }
}
