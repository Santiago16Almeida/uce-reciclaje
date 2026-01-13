import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private ahorroCO2Base = 0.05;

  generarCSV(usuarios: any[]) {
    const header = "Nombre,Email,Puntos,Rol\n";

    const rows = usuarios.map(u => {
      const nombre = u.nombre || 'Sin nombre';
      const email = u.email || 'Sin email';
      const puntos = u.puntos || 0;
      const rol = u.rol || 'estudiante';
      return `${nombre},${email},${puntos},${rol}`;
    }).join("\n");

    return header + rows;
  }

  generarReporteMensual(usuarios: any[]) {
    const totalPuntos = usuarios.reduce((sum, u) => sum + (Number(u.puntos) || 0), 0);
    const totalBotellas = Math.floor(totalPuntos / 10);
    const top = [...usuarios].sort((a, b) => (b.puntos || 0) - (a.puntos || 0))[0];

    return {
      totalBotellas,
      ahorroCO2: `${(totalBotellas * this.ahorroCO2Base).toFixed(2)}kg`,
      estudianteTop: top ? top.nombre : '---'
    };
  }
}