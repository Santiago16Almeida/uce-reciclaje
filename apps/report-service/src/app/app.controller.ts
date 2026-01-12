import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Añadimos Payload
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // Este responde al Dashboard para mostrar los números en las tarjetas
  @MessagePattern({ cmd: 'get_monthly' })
  obtenerReporte() {
    return this.appService.generarReporteMensual();
  }

  // NUEVO: Este escucha al Gateway cuando alguien registra una botella
  @MessagePattern({ cmd: 'update_report_metrics' })
  actualizarMetricas(@Payload() data: { botellas: number }) {
    console.log(`Actualizando reporte: +${data.botellas} botellas`);
    return this.appService.actualizarMetricas(data.botellas);
  }
}
