import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { TokenWithUser } from './dto/token.dto';

@Injectable()
export class TokenService {
  constructor(private databaseService: DatabaseService) {}

  public async saveToken({
    pushToken,
    token,
    userId,
  }: {
    token: string;
    userId: number;
    pushToken: string;
  }): Promise<Token> {
    return await this.databaseService.token.create({
      data: {
        token,
        userId,
        pushToken,
      },
    });
  }

  public async findToken(token: string): Promise<Token | null> {
    return await this.databaseService.token.findFirst({
      where: {
        token,
      },
    });
  }

  public async deleteToken(token: string): Promise<Token | null> {
    return await this.databaseService.token.delete({
      where: {
        token,
      },
    });
  }

  public async fetchPushTokens(userId: number): Promise<string[]> {
    const tokens = await this.databaseService.token.findMany({
      where: {
        userId,
      },
      select: {
        pushToken: true,
      },
    });
    return tokens.map((token) => token.pushToken);
  }

  public async getAllTokens(): Promise<TokenWithUser[]> {
    return await this.databaseService.token.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
