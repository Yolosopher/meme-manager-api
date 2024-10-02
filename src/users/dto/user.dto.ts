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
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;
}

export class UpdateNameDto {
  @IsString()
  name: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
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

export class SearchUsersDto {
  search: string;
  page: number;
}
