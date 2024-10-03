import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from './auth.module';
import { DatabaseService } from 'src/database/database.service';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { AuthResult } from 'src/users/dto/user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let databaseService: DatabaseService;
  let app: INestApplication;

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

    app = module.createNestApplication();
    await app.init();
    controller = module.get<AuthController>(AuthController);
    databaseService = module.get<DatabaseService>(DatabaseService);
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

  const payload = {
    email: 'test@gmail.com',
    password: 'testpassword',
    name: 'testname',
  };
  let authResult: AuthResult;
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
