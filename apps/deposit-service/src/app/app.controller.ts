import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('depositar')
  depositarBotella(@Query('email') email: string, @Query('puntos') puntos: number) {
    return this.appService.enviarEventoReciclaje(email, Number(puntos));
  }
}