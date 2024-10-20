import { Token } from '@prisma/client';
import { SignInData } from 'src/users/dto/user.dto';

export interface TokenWithUser extends Token {
  user: SignInData;
}
