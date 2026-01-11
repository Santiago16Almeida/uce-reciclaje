import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // Este es el "oído" que escucha a Kafka
  @EventPattern('uce.reciclaje.botella_depositada')
  async manejarEventoAuditoria(@Payload() data: any) {
    // Convertimos la data si viene como string (común en Kafka)
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    return await this.appService.crearLog(payload);
  }
}
