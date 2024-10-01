import { Meme } from '@prisma/client';
import { IsDefined, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateMemeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class UpdateMemeDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @ValidateIf((o) => !o.title && !o.description)
  @IsDefined({
    message: 'At least one field must be defined',
  })
  protected readonly atLeastOne: undefined;
}

export type OrderByDir = 'asc' | 'desc';

export class FindAllDto {
  page?: number;
  orderBy?: Record<keyof Meme, OrderByDir>;
  authorId?: number;
}
