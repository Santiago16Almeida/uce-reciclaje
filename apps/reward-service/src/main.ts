import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // Cambiamos el host a 0.0.0.0 para que sea accesible en AWS
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3006,
    },
  });

  await app.listen();
  console.log('🏆 Reward-Service listo en puerto 3006 (Cuenta 3)');
}
bootstrap();