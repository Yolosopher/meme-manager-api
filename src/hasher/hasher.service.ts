import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HasherService {
  async hash(password: string) {
    return await hash(password, 10);
  }

  async compare(password: string, hash: string) {
    return await compare(password, hash);
  }
}
