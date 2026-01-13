import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Añadimos Payload
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'get_monthly' })
  async obtenerReporte() {

    return { status: 'Success', message: 'Use la ruta dinámica desde el Gateway' };
  }

  @MessagePattern({ cmd: 'export_csv' })
  exportarDatos(usuarios: any[]) {
    console.log('--- REPORT SERVICE: Generando CSV con', usuarios.length, 'usuarios ---');
    return this.appService.generarCSV(usuarios);
  }
}
