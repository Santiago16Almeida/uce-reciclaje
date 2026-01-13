import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Añadimos Payload
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'get_monthly' })
  async obtenerReporte() {
    // IMPORTANTE: Como el Report-Service no tiene DB, 
    // en un flujo ideal el Gateway debería pasarle los datos.
    // Por ahora, para que no falle el dashboard, devolvemos el cálculo.
    return { status: 'Success', message: 'Use la ruta dinámica desde el Gateway' };
  }

  @MessagePattern({ cmd: 'export_csv' })
  exportarDatos(@Payload() usuarios: any[]) {
    // Recibe los usuarios reales y genera el CSV
    return this.appService.generarCSV(usuarios);
  }
}
