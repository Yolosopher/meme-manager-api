import { Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { HasherModule } from 'src/hasher/hasher.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, DatabaseModule, HasherModule, TokenModule, JwtModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
