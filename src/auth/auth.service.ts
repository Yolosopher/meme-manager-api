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

  public async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);

    return await this.signIn(user);
  }

  private async signIn(user: SignInData): Promise<AuthResult> {
    const accessToken = await this.jwtService.signAsync(user);

    return { ...user, accessToken };
  }

  private async validateUser(input: AuthInput): Promise<SignInData | null> {
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
