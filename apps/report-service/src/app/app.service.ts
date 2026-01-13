import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private ahorroCO2Base = 0.05; // 50g por botella

  generarReporteDinamico(usuarios: any[]) {
    // Calculamos el total de puntos de todos los usuarios
    const totalPuntos = usuarios.reduce((sum, u) => sum + (Number(u.puntos) || 0), 0);

    // Suponiendo que 10 puntos = 1 botella
    const totalBotellas = Math.floor(totalPuntos / 10);

    // Buscamos al usuario con más puntos
    const topEstudiante = usuarios.length > 0
      ? usuarios.sort((a, b) => b.puntos - a.puntos)[0].nombre
      : '---';

    return {
      periodo: 'Enero 2026',
      totalBotellas: totalBotellas,
      ahorroCO2: `${(totalBotellas * this.ahorroCO2Base).toFixed(2)}kg`,
      estudianteTop: topEstudiante
    };
  }

  generarCSV(usuarios: any[]) {
    const header = "Nombre,Email,Puntos,Rol\n";
    const rows = usuarios.map(u =>
      `${u.nombre},${u.email},${u.puntos || 0},${u.role || 'estudiante'}`
    ).join("\n");
    return header + rows;
  }
}