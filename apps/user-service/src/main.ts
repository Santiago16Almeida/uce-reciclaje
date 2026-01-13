import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

// apps/user-service/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CANAL TCP: El Gateway se conectará aquí
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3001 }, // Este puerto debe ser EXCLUSIVO para TCP
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
  await app.listen(4002);

  console.log('✅ User-Service: Mensajes TCP en 3001 | API Interna en 4002');
}
bootstrap();