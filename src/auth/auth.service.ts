import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthInput,
  AuthResult,
  CreateUserDto,
  SignInData,
} from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(input: CreateUserDto): Promise<boolean> {
    const user = await this.usersService.create(input);
    if (!user) return false;
    return true;
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);

    const accessToken = await this.jwtService.signAsync(user);

    return { ...user, accessToken };
  }

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findUserByEmailAndPassword({
      email: input.email,
      password: input.password,
    });

    return {
      name: user.name,
      email: user.email,
      id: user.id,
      role: user.role,
    };
  }
}
