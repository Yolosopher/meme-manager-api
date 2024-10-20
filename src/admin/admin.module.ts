import { Module } from '@nestjs/common';
import { AdmintokenModule } from './admintoken/admintoken.module';
import { AdminController } from './admin.controller';
import { AdminuserModule } from './adminuser/adminuser.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [AdmintokenModule, AdminuserModule, AuthModule, TokenModule],
  controllers: [AdminController],
})
export class AdminModule {}
