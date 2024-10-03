import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { HasherModule } from 'src/hasher/hasher.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { AuthResult } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { randomUUID } from 'crypto';

let controller: UsersController;
let authResult: AuthResult;
let authService: AuthService;
let usersService: UsersService;

const payload = {
  email: randomUUID() + '@gmail.com',
  password: 'testpassword',
  name: 'testname',
};
const payload2 = {
  email: randomUUID() + '@gmail.com',
  password: 'testpassword2',
  name: 'otherusername',
};
describe('UsersController', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        DatabaseModule,
        HasherModule,
        TokenModule,
        JwtModule,
        AuthModule,
      ],
      controllers: [UsersController],
      providers: [DatabaseService, UsersService, AuthService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
    // create a user
    await usersService.create(payload);
    await usersService.create(payload2);
    // .set('Authorization', `Bearer ${authResult.accessToken}`);

    // login the user
    authResult = await authService.authenticate({
      email: payload.email,
      password: payload.password,
    });
  });
  describe('E2E TESTS', () => {
    it('should return 404 when trying to search for nonexistent user', async () => {
      expect(
        controller.search(
          {
            user: {
              id: -1,
            },
          },
          'nonexistent',
        ),
      ).rejects.toThrow(NotFoundException);
    });
    it('should return 404 when trying to search self', async () => {
      expect(
        controller.search(
          {
            user: {
              id: authResult.id,
            },
          },
          payload.name,
        ),
      ).rejects.toThrow(NotFoundException);
    });
    it('should find the other user', async () => {
      const result = await controller.search(
        {
          user: {
            id: authResult.id,
          },
        },
        payload2.name,
      );
      expect(result).toBeDefined();
    });
  });
});
