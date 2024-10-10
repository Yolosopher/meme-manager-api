import { Module } from '@nestjs/common';
import { FollowerController } from './follower.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { FollowerService } from './follower.service';
import { DatabaseModule } from 'src/database/database.module';
import { UniquesModule } from 'src/uniques/uniques.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JwtModule,
    TokenModule,
    DatabaseModule,
    UniquesModule,
  ],
  controllers: [FollowerController],
  providers: [FollowerService],
  exports: [FollowerService],
})
export class FollowerModule {}
