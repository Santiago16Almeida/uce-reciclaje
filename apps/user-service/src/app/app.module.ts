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
      host: process.env.DB_HOST || '172.17.0.1',
      port: parseInt(process.env.DB_PORT!) || 5433,
      username: process.env.DB_USER || 'uce_admin',
      password: process.env.DB_PASSWORD || 'uce_password',
      database: process.env.DB_NAME || 'uce_users_db',
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
            brokers: [process.env.KAFKA_BROKERS || '100.52.80.163:9092'],
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
