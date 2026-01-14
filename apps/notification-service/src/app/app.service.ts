import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  enviarNotificacion(data: any) {
    //Lógica de negocio activada por evento
    const { userId, puntos } = data;

    this.logger.log(`[EMAIL SIMULATED] Enviando correo a: ${userId}`);
    this.logger.log(`Contenido: "¡Felicidades! Has ganado ${puntos} puntos por reciclar una botella en la UCE."`);

    return { status: 'Notificación enviada' };
  }
}
