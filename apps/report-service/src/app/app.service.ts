import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // En un proyecto real, esto consultaría a la base de datos de Auditoría (MongoDB)
  generarReporteMensual() {
    return {
      periodo: 'Enero 2025',
      universidad: 'Universidad Central del Ecuador',
      totalBotellas: 1540,
      ahorroCO2: '45kg',
      estudianteTop: 'Santiago Almeida'
    };
  }
}
