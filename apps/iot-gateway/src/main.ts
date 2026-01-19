import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module'; // <--- AGREGAR '/app/'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Canal TCP para que el API-Gateway le envíe señales de sensores ficticios si es necesario
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Obligatorio en AWS
      port: 3011
    }
  });

  await app.startAllMicroservices();
  await app.listen(4011, '0.0.0.0');

  console.log('📠 IoT-Gateway: TCP 3011 | HTTP 4011 | Conectado a Kafka Cuenta 4');
}
bootstrap();