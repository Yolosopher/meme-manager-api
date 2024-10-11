import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DetailedSelf, FoundUser, SearchUsersDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationMeta } from 'src/common/interfaces';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(AuthGuard)
  async search(
    @Req() req,
    @Query('search') search: string,
    @Query('page') page?: string,
  ): Promise<{ data: FoundUser[]; meta: PaginationMeta }> {
    const selfId = req.user.id;
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
      selfId,
      search: '',
      page: 1,
    };

    searchUsersDto.search = search;
    if (page) {
      searchUsersDto.page = +page;
    }

    return this.usersService.search(searchUsersDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('detailed')
  @UseGuards(AuthGuard)
  async getDetailed(@Req() req): Promise<DetailedSelf> {
    const userId = req.user.id;
    return await this.usersService.getDetailedSelf(userId);
  }
}
