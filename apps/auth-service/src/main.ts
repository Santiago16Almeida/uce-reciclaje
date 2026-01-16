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
      // Cambiamos 127.0.0.1 por 0.0.0.0 para que sea visible en la red
      url: '0.0.0.0:50051',
    },
  });

  // TCP - Canal para el Gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    // Escuchamos en 0.0.0.0
    options: { host: '0.0.0.0', port: 4001 },
  });

  await app.startAllMicroservices();

  // Escuchamos en el puerto 4003 (HTTP)
  await app.listen(4003, '0.0.0.0');

  console.log('✅ Auth-Service iniciado y escuchando en 0.0.0.0');
}
bootstrap();