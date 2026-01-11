import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @EventPattern('uce.reciclaje.botella_depositada')
  async escucharNotificacion(@Payload() data: any) {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    return this.appService.enviarNotificacion(payload);
  }
}
