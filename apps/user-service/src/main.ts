import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. TCP para el Gateway (Agustín verá sus puntos por aquí)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 3001 },
  });

  // 2. Kafka: Configuración "Blindada"
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `user-svc-final-${Date.now()}`, // ID único para forzar limpieza
        brokers: ['localhost:9092'],
        retry: { retries: 10, initialRetryTime: 5000 }
      },
      consumer: {
        groupId: `user-group-${Date.now()}`,
        allowAutoTopicCreation: true,
      },
      // Esto evita que el error de metadatos cierre el proceso
      subscribe: { fromBeginning: false }
    },
  });

  // Iniciamos. Si Kafka falla, el 'catch' evitará el Code 1
  try {
    await app.startAllMicroservices();
    await app.listen(3001);
    console.log('🚀 SERVIDOR ACTIVO Y ESCUCHANDO EN EL PUERTO 3001');
  } catch (error) {
    console.error('⚠️ Kafka no está listo, pero el servidor TCP sí.');
    await app.listen(3001);
  }
}
bootstrap();