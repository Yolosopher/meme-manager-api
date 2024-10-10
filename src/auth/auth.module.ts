import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { AuthGateway } from './auth.gateway';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    TokenModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME! },
      global: true,
    }),
  ],
  providers: [AuthService, AuthGateway, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
