import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3001 },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4001 },
      },
      {
        name: 'DEPOSIT_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3002 },
      },
      {
        name: 'REWARD_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3006 },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3007 },
      },
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3008 },
      },
      {
        name: 'HEALTH_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3009 },
      },
      {
        name: 'RECYCLING_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3010 },
      },
      {
        name: 'IOT_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3011 },
      },
      {
        name: 'REPORT_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3012 },
      },
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'assets', 'auth.proto'),
          url: '127.0.0.1:50051',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }