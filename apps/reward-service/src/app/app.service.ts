import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private recompensas = [
    { id: 1, nombre: 'Ticket Comedor UCE', costo: 50 },
    { id: 2, nombre: 'Copia Gratis Biblioteca', costo: 10 },
    { id: 3, nombre: 'Parqueadero Preferencial', costo: 100 }
  ];

  obtenerCatalogo() {
    return this.recompensas;
  }

  canjear(puntosUsuario: number, rewardId: number) {
    const premio = this.recompensas.find(r => r.id === rewardId);
    if (premio && puntosUsuario >= premio.costo) {
      return { status: 'EXITOSO', mensaje: `Has canjeado un ${premio.nombre}` };
    }
    return { status: 'ERROR', mensaje: 'Puntos insuficientes' };
  }
}
