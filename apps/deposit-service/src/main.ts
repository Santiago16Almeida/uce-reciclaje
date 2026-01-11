import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = 3015; // Puerto único para el servicio de depósito
  await app.listen(port);
  Logger.log(`🚀 Deposit-Service corriendo en: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
