import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // 1. Creamos la app normal
  const app = await NestFactory.create(AppModule);

  // 2. Le conectamos el microservicio KAFKA (para eventos)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: { groupId: 'notification-consumer' },
    },
  });

  // 3. Le conectamos el microservicio TCP (para que el Gateway le hable)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3005 },
  });

  await app.startAllMicroservices();
  await app.listen(3005); // Puerto HTTP para salud del sistema
  console.log('🔔 Notification-Service listo en puerto 3005');
}
bootstrap();
