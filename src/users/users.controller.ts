import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  @Get('detailed/:targetId?')
  @UseGuards(AuthGuard)
  async getDetailed(
    @Req() req,
    @Param('targetId') targetId?: string,
  ): Promise<DetailedSelf> {
    const userId = req.user.id;
    if (!targetId) {
      return await this.usersService.getDetailed(userId);
    }

    // check if targetId is not number
    if (isNaN(+targetId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.usersService.getDetailed(+targetId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(AuthGuard)
  async search(
    @Req() req,
    @Query('search') search: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
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
    // check if page value is a number
    if (per_page && isNaN(+per_page)) {
      throw new BadRequestException('Invalid per_page number');
    }

    const searchUsersDto: SearchUsersDto = {
      selfId,
      search: '',
      page: 1,
      per_page: 10,
    };

    searchUsersDto.search = search.trim();
    if (page) {
      searchUsersDto.page = +page;
    }
    if (per_page) {
      searchUsersDto.per_page = +per_page;
    }

    return this.usersService.search(searchUsersDto);
  }
}
