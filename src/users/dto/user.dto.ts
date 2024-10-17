import { Role, User } from '@prisma/client';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5, {
    message: 'Name is too short (minimum 5 characters)',
  })
  name: string;

  @IsString()
  @MinLength(6, {
    message: 'Password is too short (minimum 6 characters)',
  })
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;
}

export class UpdateNameDto {
  @IsString()
  @MinLength(5, {
    message: 'Name is too short (minimum 5 characters)',
  })
  name: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  pushToken: string;
}

export type SignInData = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type AuthResult = SignInData & { accessToken: string };

export interface FoundUser
  extends Pick<User, 'name' | 'email' | 'id' | 'role'> {}

export interface SearchUsersDto {
  selfId: number;
  search: string;
  page: number;
  per_page: number;
}

export interface DetailedSelf {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  role: Role;
  _count: {
    myMemes: number;
    followedBy: number;
    following: number;
  };
}
