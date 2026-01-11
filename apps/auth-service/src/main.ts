import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // Creamos la aplicación
  const app = await NestFactory.create(AppModule);

  // 1. Configuración gRPC (Puerto 50051)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'assets', 'auth.proto'),
      url: '127.0.0.1:50051',
    },
  });

  // 2. Configuración TCP (Puerto 4001) - RESPETANDO TU ESTRUCTURA
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 4001 },
  });

  // Iniciamos todos los microservicios (gRPC y TCP)
  await app.startAllMicroservices();

  // Escuchamos peticiones HTTP en el 4001 para que no choque con el 3001 del User-Service
  await app.listen(4001);

  console.log('🔐 Auth-Service ejecutándose en:');
  console.log('   - gRPC: 127.0.0.1:50051');
  console.log('   - TCP:  127.0.0.1:4001');
}
bootstrap();