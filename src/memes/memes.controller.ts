import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Req,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { MemesService } from './memes.service';
import {
  CreateMemeDto,
  FindAllDto,
  OrderByDir,
  UpdateMemeDto,
} from './dto/memes.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Meme } from '@prisma/client';

@Controller('memes')
export class MemesController {
  constructor(private memesService: MemesService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req, @Body() createMemeDto: CreateMemeDto) {
    const { id } = req.user;
    return this.memesService.create(id, createMemeDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('orderBy') orderBy?: keyof Meme,
  ) {
    const findAllDto: FindAllDto = {
      page: 1,
      orderBy: {
        createdAt: 'desc',
      } as Record<keyof Meme, OrderByDir>,
    };

    if (page) {
      findAllDto.page = +page;
    }
    if (authorId) {
      findAllDto.authorId = +authorId;
    }
    if (orderBy) {
      const orderByDir: OrderByDir = orderBy.startsWith('-') ? 'desc' : 'asc';
      findAllDto.orderBy = {
        [orderBy]: orderByDir,
      } as Record<keyof Meme, OrderByDir>;
    }

    return this.memesService.findAll(findAllDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get(':memeId')
  findOne(@Param('memeId') memeId: string) {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }
    return this.memesService.findOne(+memeId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put(':memeId')
  update(
    @Req() request,
    @Param('memeId') memeId: string,
    @Body() updateMemeDto: UpdateMemeDto,
  ) {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }
    const userId = request.user.id;

    return this.memesService.update(+userId, +memeId, updateMemeDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete(':memeId')
  remove(@Req() request, @Param('memeId') memeId: string) {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }
    const userId = request.user.id;
    return this.memesService.remove(+userId, +memeId);
  }
}
