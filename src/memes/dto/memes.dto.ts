import { Meme } from '@prisma/client';
import {
  IsBase64,
  IsDefined,
  IsMimeType,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateMemeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class CreateMemeBase64Dto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  fileName: string;

  @IsBase64()
  base64String: string;

  @IsMimeType()
  mimeType: string;
}

export class UpdateMemeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateIf((o) => !o.title && !o.description)
  @IsDefined({
    message: 'At least one field must be defined',
  })
  protected readonly atLeastOne: undefined;
}

export type OrderByDir = 'asc' | 'desc';

export class FindAllMemesDto {
  page: number;
  per_page: number;
  orderBy?: Record<keyof Meme, OrderByDir>;
  authorId?: number;
}

export interface IMeme extends Meme {
  imageUrl: string;
}

export interface IMemeWithLikes extends IMeme {
  likes: { user: { id: number; email: string; name: string } }[];
}
