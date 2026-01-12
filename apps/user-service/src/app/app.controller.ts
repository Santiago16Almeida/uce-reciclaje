import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // --- ESCUCHA DEL GATEWAY (Consultar Perfil) ---
  @MessagePattern({ cmd: 'get_user_profile' })
  async handleGetProfile(@Payload() data: { email: string }) {
    console.log('[User-Service] Consultando perfil para:', data.email);
    try {
      // Retorna el usuario completo (incluyendo puntos) para el Dashboard
      return await this.appService.buscarPorEmail(data.email);
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error.message);
      return { status: 'Error', message: 'Usuario no encontrado' };
    }
  }

  // --- ESCUCHA DE KAFKA (Sincronización de Botellas) ---
  @EventPattern('botella_nueva')
  async manejarBotellaRecicladaNueva(@Payload() data: any) {
    try {
      console.log('[User-Service] 📨 Evento Kafka recibido:', data);

      // Validamos si viene como userId o email
      const email = data.email || data.userId;
      const puntos = Number(data.puntos);

      if (email && !isNaN(puntos)) {
        await this.appService.sumarPuntos(email, puntos);
        console.log(`[User-Service] ✅ Puntos (${puntos}) sumados a: ${email}`);
      }
    } catch (error) {
      console.error('⚠️ Error procesando evento Kafka:', error.message);
    }
  }

  // --- OTROS MENSAJES TCP ---
  @MessagePattern({ cmd: 'create_user' })
  async handleCreateUser(@Payload() data: any) {
    return await this.appService.createUser(data);
  }

  @MessagePattern({ cmd: 'add_points' })
  async handleSumarPuntos(@Payload() data: { email: string, puntos: number }) {
    return await this.appService.sumarPuntos(data.email, Number(data.puntos));
  }
}