import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
        name: 'REWARD_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3006 },
      },
      // ... los demás servicios igual a 127.0.0.1
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }