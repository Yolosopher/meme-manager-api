import { Role } from '@prisma/client';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export type SignInData = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type AuthResult = SignInData & { accessToken: string };
