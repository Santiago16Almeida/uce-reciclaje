import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [], // Quitamos el CacheModule de aquí si quieres
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
