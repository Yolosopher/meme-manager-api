import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { HasherModule } from 'src/hasher/hasher.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { AuthResult } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

let controller: UsersController;
let databaseService: DatabaseService;
let app: INestApplication;
let authResult: AuthResult;
let authService: AuthService;
let usersService: UsersService;

const payload = {
  email: 'test@gmail.com',
  password: 'testpassword',
  name: 'testname',
};
const payload2 = {
  email: 'otherusermail@gmail.com',
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

    app = module.createNestApplication();
    await app.init();
    controller = module.get<UsersController>(UsersController);
    databaseService = module.get<DatabaseService>(DatabaseService);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);

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

  afterAll(async () => {
    // Fetch all table names in the public schema
    const tables = await databaseService.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `;

    // Generate a TRUNCATE command for all tables
    const tableNames = tables
      .map((table) => `"${table.table_name}"`)
      .join(', ');

    // Truncate all tables
    await databaseService.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
    );

    await databaseService.$disconnect(); // Disconnect Prisma
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
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
