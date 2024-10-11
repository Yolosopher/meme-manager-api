export class CreateLikeDto {
  userId: number;
  memeId: number;
}
export class FindMemeLikersDto {
  page?: number;
  memeId: number;
}
