import { Like } from '@prisma/client';

export class CreateLikeDto {
  userId: number;
  memeId: number;
}
export class FindMemeLikersDto {
  page?: number;
  memeId: number;
}
