import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { HasherModule } from 'src/hasher/hasher.module';

@Module({
  imports: [DatabaseModule, HasherModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
