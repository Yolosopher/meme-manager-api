import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TokenService {
  constructor(private databaseService: DatabaseService) {}

  async saveToken(token: string, userId: number): Promise<Token> {
    return await this.databaseService.token.create({
      data: {
        token,
        userId,
      },
    });
  }

  async findToken(token: string): Promise<Token | null> {
    return await this.databaseService.token.findFirst({
      where: {
        token,
      },
    });
  }

  async deleteToken(token: string): Promise<Token | null> {
    return await this.databaseService.token.delete({
      where: {
        token,
      },
    });
  }
}
