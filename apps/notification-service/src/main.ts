import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Canal KAFKA: Para reaccionar a eventos de botellas automáticamente
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [process.env.KAFKA_BROKERS || '100.52.80.163:9092'] },
      consumer: { groupId: 'notification-consumer' },
    },
  });

  // 2. Canal TCP: Para que el Gateway lo llame en el puerto 3007
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Permitir tráfico desde el Gateway
      port: 3007
    },
  });

  await app.startAllMicroservices();
  await app.listen(4005, '0.0.0.0'); // API HTTP para Health Checks

  console.log('🔔 Notification-Service: Kafka Activo | TCP: 3007 | HTTP: 4005');
}
bootstrap();
