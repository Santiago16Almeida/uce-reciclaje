import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

// Módulo vacío para que NestJS pueda arrancar
@Module({})
class RecyclingModule { }

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(RecyclingModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 3010  // Este es el puerto que tienes en tu AppModule
        },
    });

    await app.listen();
    console.log('♻️  Recycling Service (Botellas) iniciado en el puerto 3010');
}
bootstrap();