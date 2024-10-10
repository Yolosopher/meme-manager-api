import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CloggerModule } from './clogger/clogger.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
import { MemesModule } from './memes/memes.module';
import { ImageModule } from './image/image.module';
import { GenerateUidModule } from './generate-uid/generate-uid.module';
import { FollowerModule } from './follower/follower.module';
import { LikeModule } from './like/like.module';
import { UniquesService } from './uniques/uniques.service';
import { UniquesModule } from './uniques/uniques.module';

const ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.${ENV}.env`,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    CloggerModule,
    AuthModule,
    TokenModule,
    MemesModule,
    ImageModule,
    GenerateUidModule,
    FollowerModule,
    LikeModule,
    UniquesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UniquesService,
  ],
})
export class AppModule {}
