import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC - Canal de seguridad
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'assets', 'auth.proto'),
      url: '127.0.0.1:50051',
    },
  });

  // TCP - Canal para el Gateway (ESTE ES EL QUE USA EL GATEWAY)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 4001 },
  });

  await app.startAllMicroservices();

  // HTTP - Escucha en el 4003 para no chocar con el 4001 TCP
  await app.listen(4003);

  console.log('✅ Auth-Service conectado al Gateway en puerto 4001');
}
bootstrap();