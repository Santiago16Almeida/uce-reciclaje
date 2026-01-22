import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

@Module({
  imports: [
    // 1. Conexión a PostgreSQL (Cuenta 1)
    TypeOrmModule.forRoot({
      type: 'postgres',
      // IMPORTANTE: Dentro de la misma EC2 usamos la IP del bridge
      host: '44.223.184.82',
      port: 5433,
      username: 'uce_admin',
      password: 'uce_password',
      database: 'uce_users_db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),

    // Conexión a Kafka
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['44.223.184.82:9092'],
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
