import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { CloggerService } from './clogger/clogger.service';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // 	 {
    //   bufferLogs: true,
    // }
  );
  // app.useLogger(app.get(CloggerService));
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
