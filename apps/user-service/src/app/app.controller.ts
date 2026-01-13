import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  //Consultar Perfil a traves del gateway
  @MessagePattern({ cmd: 'get_user_profile' })
  async handleGetProfile(@Payload() data: { email: string }) {
    console.log('[User-Service] Consultando perfil para:', data.email);
    try {
      // Retorna el usuario completo con los puntos para el Dashboard
      return await this.appService.buscarPorEmail(data.email);
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error.message);
      return { status: 'Error', message: 'Usuario no encontrado' };
    }
  }

  // Sincronizacion de botellas con kafka
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

  @MessagePattern({ cmd: 'create_user' })
  async handleCreateUser(@Payload() data: any) {
    return await this.appService.createUser(data);
  }

  @MessagePattern({ cmd: 'add_points' })
  async handleSumarPuntos(@Payload() data: { email: string, puntos: number }) {
    console.log('--- USER SERVICE: RECIBIENDO PUNTOS ---');
    console.log('Datos:', data);

    return await this.appService.sumarPuntos(data.email, Number(data.puntos));
  }

  // Canjes desde kafka-
  @EventPattern('canje_realizado')
  async manejarCanje(@Payload() data: any) {
    try {
      const email = data.email;
      const puntos = Number(data.puntos);

      if (email && !isNaN(puntos)) {
        // En el service, crea una función que reste o usa sumarPuntos con valor negativo
        await this.appService.sumarPuntos(email, -puntos);
        console.log(`[User-Service] 📉 Canje procesado: -${puntos} puntos a ${email}`);
      }
    } catch (error) {
      console.error('⚠️ Error procesando canje:', error.message);
    }
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async handleGetAllUsers() {
    console.log('[User-Service] Extrayendo lista completa de usuarios...');
    // Aquí llamamos a la función que acabamos de crear
    return await this.appService.findAll();
  }

}