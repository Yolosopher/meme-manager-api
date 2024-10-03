import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from './auth.module';
import { DatabaseService } from 'src/database/database.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResult } from 'src/users/dto/user.dto';
import { randomUUID } from 'crypto';

const payload = {
  email: randomUUID() + '@gmail.com',
  password: 'test2password',
  name: 'testname4',
};
let authResult: AuthResult;
let controller: AuthController;
describe('AuthController', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TokenModule,
        UsersModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET!,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME! },
          global: true,
        }),
      ],
      controllers: [AuthController],
      providers: [DatabaseService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('UNIT TESTS', () => {
    it('should return 403 when trying to login with invalid credentials', async () => {
      await expect(
        controller.login({
          email: process.env.ADMIN_EMAIL!,
          password: process.env.ADMIN_PASSWORD! + 'invalid',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should register new acc when trying to register with valid credentials', async () => {
      await expect(controller.register(payload)).resolves.toBe(true);
    });
    it('should return 200 when trying to login with valid credentials', async () => {
      const response = await controller.login(payload);
      expect(response).toHaveProperty('accessToken');
      authResult = response;
    });
    it('should return 200 when trying to get user info', async () => {
      const response = await controller.getSelf({ user: authResult });
      expect(response).toHaveProperty('email', payload.email);
      expect(response).toHaveProperty('name', payload.name);
    });
  });
});
