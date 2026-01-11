import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module'; // <--- AGREGAR '/app/'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3011
    }
  });

  await app.startAllMicroservices();
  await app.listen(4011); // <--- PUERTO DIFERENTE AL 3011
  console.log('📠 IoT-Gateway listo');
}
bootstrap();