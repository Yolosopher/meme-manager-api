import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
// import { CloggerService } from './clogger/clogger.service';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // 	 {
    //   bufferLogs: true,
    // }
  );
  // app.useLogger(app.get(CloggerService));

  app.use(json({ limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
