import { Module } from '@nestjs/common';
import { AdminuserController } from './adminuser.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminuserController],
})
export class AdminuserModule {}
