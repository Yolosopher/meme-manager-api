import { Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { HasherModule } from 'src/hasher/hasher.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [DatabaseModule, HasherModule, TokenModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(private usersService: UsersService) {}
  onModuleInit() {
    this.usersService.initAdmin();
  }
}
