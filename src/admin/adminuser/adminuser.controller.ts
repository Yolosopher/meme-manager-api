import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { PaginationMeta } from 'src/common/interfaces';
import { FoundUser, SearchUsersDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('adminuser')
export class AdminuserController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/users')
  async getUsers(
    @Req() req,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ): Promise<{
    data: FoundUser[];
    meta: PaginationMeta;
  }> {
    const selfId = req.user.id;

    if (search && search.length < 3) {
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

    if (search) {
      searchUsersDto.search = search.trim();
    }
    if (page) {
      searchUsersDto.page = +page;
    }
    if (per_page) {
      searchUsersDto.per_page = +per_page;
    }

    return this.usersService.search(searchUsersDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:deleteUserId')
  async getUser(@Param('deleteUserId') deleteUserId: string): Promise<boolean> {
    if (!deleteUserId || isNaN(+deleteUserId)) {
      throw new BadRequestException('Invali ');
    }
    const foundUser = await this.usersService.findOne(+deleteUserId);

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.remove(+deleteUserId, foundUser.email);
    return true;
  }
}
