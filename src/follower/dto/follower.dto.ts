export interface FindMyFollowersDto {
  per_page?: number;
  page?: number;
  userId: number;
}

export interface FindMyFollowsDto extends FindMyFollowersDto {}
