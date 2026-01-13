import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

@Module({
  imports: [
    // 1. Conexión a Base de Datos (Requisito 11)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433,
      username: 'uce_admin',
      password: 'uce_password',
      database: 'uce_users_db',
      entities: [User],
      synchronize: true, // Crea las tablas automáticamente
    }),
    TypeOrmModule.forFeature([User]),

    // 2. Conexión a Kafka (Requisito 15)
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
            initialRetryTime: 100,
            retries: 8
          },
          consumer: {
            groupId: `user-consumer-v2`,
            allowAutoTopicCreation: true
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
