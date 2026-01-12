import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private totalBotellas = 1540;
  private ahorroCO2Base = 0.029;

  generarReporteMensual() {
    return {
      periodo: 'Enero 2026',
      totalBotellas: this.totalBotellas,
      ahorroCO2: `${(this.totalBotellas * this.ahorroCO2Base).toFixed(2)}kg`,
      estudianteTop: 'Santiago Almeida'
    };
  }

  // NUEVO: Generador de texto CSV
  generarCSV(usuarios: any[]) {
    const header = "Nombre,Email,Puntos,Rol,Estado\n";
    const rows = usuarios.map(u =>
      `${u.nombre},${u.email},${u.puntos},${u.rol},${u.estaActivo ? 'Activo' : 'Inactivo'}`
    ).join("\n");
    return header + rows;
  }

  actualizarMetricas(botellasNuevas: number) {
    this.totalBotellas += botellasNuevas;
    return { success: true, nuevoTotal: this.totalBotellas };
  }
}