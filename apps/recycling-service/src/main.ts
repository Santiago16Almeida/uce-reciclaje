import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

@Module({})
class RecyclingModule { }

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(RecyclingModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 3010
        },
    });
    await app.listen();
    console.log('♻️  Recycling Service (Botellas) listo en puerto 3010');
}
bootstrap();