import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Canal TCP para recibir comandos del API Gateway (Cuenta 3)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Visible para el Gateway
      port: 3002,      // Tu puerto estático
    },
  });

  await app.startAllMicroservices();

  const port = 4015; // Puerto HTTP interno para salud
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 Deposit-Service: TCP 3002 | HTTP ${port}`);
}

bootstrap();
