import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

// apps/user-service/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TCP: Aquí es donde el Gateway de la Cuenta 3 te buscará
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // IMPORTANTE: 0.0.0.0 para que AWS permita tráfico externo
      port: 3001
    },
  });

  // CANAL KAFKA: (Tu configuración actual está bien)
  /*app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: { groupId: `user-group-${Date.now()}` }
    },
  });*/

  await app.startAllMicroservices();

  // CAMBIO CLAVE: Escuchar HTTP en el 4002 (o cualquier otro que no sea 3001)
  const httpPort = 4002;
  await app.listen(httpPort, '0.0.0.0');

  console.log(`✅ User-Service: TCP en 3001 | HTTP en ${httpPort}`);
}
bootstrap();