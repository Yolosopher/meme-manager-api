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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MemesService } from './memes.service';
import {
  CreateMemeBase64Dto,
  CreateMemeDto,
  FindAllMemesDto,
  OrderByDir,
  UpdateMemeDto,
} from './dto/memes.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Meme } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/configuration/multer.config';
import { PaginationMeta } from 'src/common/interfaces';

@Controller('memes')
export class MemesController {
  constructor(private memesService: MemesService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('orderBy') orderBy?: keyof Meme,
    @Query('per_page') per_page?: string,
  ): Promise<{ data: Meme[]; meta: PaginationMeta }> {
    // check if page value is a number
    if (page && isNaN(+page)) {
      throw new BadRequestException('Invalid page number');
    }
    if (per_page && isNaN(+per_page)) {
      throw new BadRequestException('Invalid per_page number');
    }
    // check if authorId value is a number
    if (authorId && isNaN(+authorId)) {
      throw new BadRequestException('Invalid author ID');
    }
    // check if orderBy value is a valid column name
    if (orderBy && !['createdAt', 'updatedAt'].includes(orderBy)) {
      throw new BadRequestException('Invalid orderBy column');
    }
    const FindAllMemesDto: FindAllMemesDto = {
      page: 1,
      per_page: 10,
      orderBy: {
        createdAt: 'desc',
      } as Record<keyof Meme, OrderByDir>,
    };

    if (page) {
      FindAllMemesDto.page = +page;
    }
    if (per_page) {
      FindAllMemesDto.per_page = +per_page;
    }
    if (authorId) {
      FindAllMemesDto.authorId = +authorId;
    }
    if (orderBy) {
      const orderByDir: OrderByDir = orderBy.startsWith('-') ? 'desc' : 'asc';
      FindAllMemesDto.orderBy = {
        [orderBy]: orderByDir,
      } as Record<keyof Meme, OrderByDir>;
    }

    return this.memesService.findAll(FindAllMemesDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get(':memeId')
  findOne(
    @Param('memeId') memeId: string,
    @Query('populate') populate?: string,
  ): Promise<Meme> {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }

    if (populate && populate === 'true') {
      return this.memesService.findOne(+memeId, true);
    }

    return this.memesService.findOne(+memeId, false);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put(':memeId')
  update(
    @Req() request,
    @Param('memeId') memeId: string,
    @Body() updateMemeDto: UpdateMemeDto,
  ): Promise<Meme> {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }
    const userId = request.user.id;

    return this.memesService.update(+userId, +memeId, updateMemeDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete(':memeId')
  remove(@Req() request, @Param('memeId') memeId: string): Promise<Meme> {
    if (isNaN(+memeId)) {
      throw new BadRequestException('Invalid meme ID');
    }
    const userId = request.user.id;
    return this.memesService.remove(+userId, +memeId);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post('base64')
  createFromBase64(
    @Req() req,
    @Body() createMemeDto: CreateMemeBase64Dto,
  ): Promise<Meme> {
    const { base64String, description, title, fileName, mimeType } =
      createMemeDto;

    if (!base64String) {
      throw new BadRequestException('Image base64 string is required');
    }
    if (!fileName) {
      throw new BadRequestException('Image file name is required');
    }

    if (!mimeType) {
      throw new BadRequestException('Image MIME type is required');
    }

    const { id } = req.user;
    return this.memesService.createFrombase64(id, {
      base64String,
      description,
      title,
      fileName,
      mimeType,
    });
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @Post()
  create(
    @Req() req,
    @Body() createMemeDto: CreateMemeDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Meme> {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    const { id } = req.user;
    return this.memesService.create(id, createMemeDto, image);
  }
}
