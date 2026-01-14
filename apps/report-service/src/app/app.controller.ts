import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Añadimos Payload
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'get_monthly' })
  async obtenerReporte() {

    return this.appService.generarReporteMensual();
  }

  @MessagePattern({ cmd: 'export_csv' })
  exportarDatos(@Payload() usuarios: any[]) {
    console.log('--- REPORT SERVICE: Generando CSV con datos reales ---');
    return this.appService.generarCSV(usuarios);
  }
}
