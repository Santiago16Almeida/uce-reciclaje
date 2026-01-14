import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'get_catalog' })
  getData() {
    return this.appService.obtenerCatalogo();
  }

  @MessagePattern({ cmd: 'redeem_reward' })
  async canjear(data: { email: string, rewardId: number, puntosActuales: number }) {
    return this.appService.canjear(data.puntosActuales, data.rewardId);
  }

}
