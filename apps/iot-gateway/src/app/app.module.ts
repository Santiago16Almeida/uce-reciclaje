import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE', // <--- Este es el nombre que Nest no encontraba
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'iot',
            brokers: ['localhost:9092'], // Verifica que Kafka esté en el 9092 en Docker
          },
          consumer: {
            groupId: 'iot-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }