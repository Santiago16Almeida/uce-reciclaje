import { Controller, Inject } from '@nestjs/common'; // <--- AGREGADO 'Inject'
import { MessagePattern, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject(AppService) private readonly appService: AppService // Forzamos la inyección
  ) { }

  @MessagePattern({ cmd: 'add_points' }, Transport.TCP)
  async handleSumarPuntos(@Payload() data: { email: string, puntos: number }) {
    console.log('[User-Service] 📥 TCP: Solicitud recibida:', data);

    try {
      // Intentamos llamar al servicio directamente
      return await this.appService.sumarPuntos(data.email, Number(data.puntos));
    } catch (error) {
      console.error('❌ Error crítico en User-Service:', error.message);
      return {
        status: 'Error',
        message: 'El servicio no pudo procesar la solicitud',
        detalle: error.message
      };
    }
  }

  @EventPattern('uce-reciclaje-botella-final', Transport.KAFKA)
  async manejarBotellaRecicladaNueva(@Payload() data: any) {
    console.log('[User-Service] 🤖 Kafka: Evento recibido', data);
    const email = data.email || data.userId;
    try {
      return await this.appService.sumarPuntos(email, data.puntos);
    } catch (e) {
      console.error('❌ Error Kafka:', e.message);
    }
  }
}