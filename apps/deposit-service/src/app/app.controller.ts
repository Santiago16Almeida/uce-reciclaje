import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // URL para probar: http://localhost:3002/api/depositar?email=santiago@uce.edu.ec&puntos=25
  @Get('depositar')
  depositarBotella(@Query('email') email: string, @Query('puntos') puntos: number) {
    return this.appService.enviarEventoReciclaje(email, Number(puntos));
  }
}