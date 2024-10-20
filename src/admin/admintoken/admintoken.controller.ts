import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TokenWithUser } from 'src/token/dto/token.dto';
import { TokenService } from 'src/token/token.service';

@Controller('tokens')
export class AdmintokenController {
  constructor(private tokenService: TokenService) {}
  @HttpCode(HttpStatus.OK)
  @Get('/')
  async getTokens(): Promise<TokenWithUser[]> {
    return await this.tokenService.getAllTokens();
  }
}
