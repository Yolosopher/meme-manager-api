import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/token/token.service';
import { LoginUserDto, AuthResult, SignInData } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  public async authenticate(input: LoginUserDto): Promise<AuthResult> {
    const user = await this.validateUser(input);

    const authResult = await this.signIn(user);
    await this.tokenService.saveToken(authResult.accessToken, user.id);
    return authResult;
  }

  public async deleteToken(token: string): Promise<boolean> {
    const deletedToken = await this.tokenService.deleteToken(token);
    return !!deletedToken;
  }

  private async signIn(user: SignInData): Promise<AuthResult> {
    const accessToken = await this.jwtService.signAsync(user);

    return { ...user, accessToken };
  }

  private async validateUser(input: LoginUserDto): Promise<SignInData | null> {
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
