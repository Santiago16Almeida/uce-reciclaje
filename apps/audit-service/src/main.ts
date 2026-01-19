import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // Lo creamos como microservicio TCP para que el Gateway lo vea en el 3008
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Importante para AWS
      port: 3008,
    },
  });

  await app.listen();

  Logger.log('🚀 Audit-Service (Solo Mongo) listo en puerto TCP 3008');
}

bootstrap();