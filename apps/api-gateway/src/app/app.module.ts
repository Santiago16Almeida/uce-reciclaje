import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      // --- CUENTA 1: USUARIOS Y AUTENTICACIÓN (3.234.125.204) ---
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: '3.234.125.204', port: 3001 },
      },
      {
        name: 'AUTH_SERVICE', // El que usas con $env:NODE_OPTIONS
        transport: Transport.TCP,
        options: { host: '3.234.125.204', port: 4001 },
      },

      // --- CUENTA 2: IOT Y AUDITORÍA (52.200.64.213) ---
      {
        name: 'IOT_SERVICE',
        transport: Transport.TCP,
        options: { host: '52.200.64.213', port: 3011 },
      },
      {
        name: 'DEPOSIT_SERVICE',
        transport: Transport.TCP,
        options: { host: '52.200.64.213', port: 3002 },
      },
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.TCP,
        options: { host: '52.200.64.213', port: 3008 },
      },

      // --- CUENTA 3 (ESTA INSTANCIA): RECOMPENSAS Y SALUD (Local) ---
      {
        name: 'REWARD_SERVICE',
        transport: Transport.TCP,
        options: { host: '52.200.64.213', port: 3006 },
      },
      {
        name: 'HEALTH_SERVICE',
        transport: Transport.TCP,
        options: { host: '3.234.125.204', port: 3009 },
      },
      {
        name: 'RECYCLING_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3011 },
      },

      // --- CUENTA 4: REPORTES Y NOTIFICACIONES (100.52.80.163) ---
      {
        name: 'REPORT_SERVICE',
        transport: Transport.TCP,
        options: { host: '100.52.80.163', port: 3012 },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: { host: '100.52.80.163', port: 3007 },
      },

      // --- RESPALDO GRPC (Cuenta 1) ---
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'assets', 'auth.proto'),
          url: '3.234.125.204:50051',
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